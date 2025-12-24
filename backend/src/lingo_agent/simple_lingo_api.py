"""
Simple WebSocket handler for Lingo Agent - With Intelligent Orchestration
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import logging
import json
import asyncio
from .master_lingo_agent import MasterLingoAgent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/lingo", tags=["lingo"])

# Global agent instance
lingo_agent = None
active_websocket = None

@router.get("/voices")
async def get_available_voices():
    """Get all available Azure Speech voices"""
    return {
        "english_us": {
            "female": ["en-US-AriaNeural", "en-US-JennyNeural", "en-US-MichelleNeural"],
            "male": ["en-US-GuyNeural", "en-US-ChristopherNeural", "en-US-EricNeural"]
        },
        "english_uk": {
            "female": ["en-GB-SoniaNeural", "en-GB-LibbyNeural"],
            "male": ["en-GB-RyanNeural", "en-GB-ThomasNeural"]
        },
        "arabic": {
            "saudi_arabia": ["ar-SA-ZariyahNeural", "ar-SA-HamedNeural"],
            "egypt": ["ar-EG-SalmaNeural", "ar-EG-ShakirNeural"],
            "uae": ["ar-AE-FatimaNeural", "ar-AE-HamdanNeural"]
        },
        "chinese": {
            "mandarin": ["zh-CN-XiaoxiaoNeural", "zh-CN-YunxiNeural"],
            "cantonese": ["zh-HK-HiuMaanNeural", "zh-HK-WanLungNeural"]
        },
        "spanish": {
            "spain": ["es-ES-ElviraNeural", "es-ES-AlvaroNeural"],
            "mexico": ["es-MX-DaliaNeural", "es-MX-JorgeNeural"]
        },
        "french": {
            "france": ["fr-FR-DeniseNeural", "fr-FR-HenriNeural"],
            "canada": ["fr-CA-SylvieNeural", "fr-CA-AntoineNeural"]
        },
        "german": {
            "germany": ["de-DE-KatjaNeural", "de-DE-ConradNeural"],
            "austria": ["de-AT-IngridNeural", "de-AT-JonasNeural"]
        },
        "hindi": {
            "india": ["hi-IN-SwaraNeural", "hi-IN-MadhurNeural"]
        },
        "urdu": {
            "pakistan": ["ur-PK-UzmaNeural", "ur-PK-AsadNeural"],
            "india": ["ur-IN-GulNeural", "ur-IN-SalmanNeural"]
        },
        "japanese": {
            "japan": ["ja-JP-NanamiNeural", "ja-JP-KeitaNeural"]
        },
        "korean": {
            "korea": ["ko-KR-SunHiNeural", "ko-KR-InJoonNeural"]
        },
        "portuguese": {
            "brazil": ["pt-BR-FranciscaNeural", "pt-BR-AntonioNeural"],
            "portugal": ["pt-PT-RaquelNeural", "pt-PT-DuarteNeural"]
        },
        "russian": {
            "russia": ["ru-RU-SvetlanaNeural", "ru-RU-DmitryNeural"]
        },
        "italian": {
            "italy": ["it-IT-ElsaNeural", "it-IT-DiegoNeural"]
        }
    }

@router.websocket("/ws")
async def simple_websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint with intelligent orchestration"""
    global lingo_agent, active_websocket
    
    try:
        await websocket.accept()
        active_websocket = websocket
        logger.info("✅ WebSocket connected")
        
        # Initialize Master Lingo Agent if not already done
        if lingo_agent is None:
            lingo_agent = MasterLingoAgent()
            logger.info("✅ Master Lingo Agent initialized")
        
        
        # IMPORTANT: Update callbacks for THIS websocket connection
        # (callbacks must be updated for each new connection, not just first time)
        async def send_ui_update(data: dict):
            """Send UI updates to frontend"""
            try:
                await websocket.send_json(data)
                logger.info(f"📤 Sent UI update: {data.get('type')}")
            except Exception as e:
                logger.error(f"❌ Error sending UI update: {e}")
        
        async def on_start_workflow(workflow_dict: dict):
            """Handle workflow start requests from Agent Lightning"""
            try:
                # Extract workflow details from Agent Lightning format
                workflow_id = workflow_dict.get('id', '')
                workflow_type = workflow_dict.get('type', 'unknown')
                workflow_data = workflow_dict.get('data', {})
                
                logger.info(f"🚀 Starting workflow: {workflow_type} (ID: {workflow_id})")
                logger.info(f"📊 Workflow data: {workflow_data}")
                
                # Actually create the workflow in the blog team backend
                if workflow_type == 'blog':
                    try:
                        import httpx
                        from datetime import datetime
                        
                        # Prepare blog creation request
                        blog_request = {
                            "topic": workflow_data.get('topic', 'General Topic'),
                            "tone": workflow_data.get('tone', 'professional'),
                            "target_word_count": workflow_data.get('word_count', 1500),
                            "reference_urls": workflow_data.get('reference_urls', []),
                            "additional_instructions": f"Keywords: {', '.join(workflow_data.get('keywords', []))}" if workflow_data.get('keywords') else None
                        }
                        
                        logger.info(f"📝 Creating blog workflow with data: {blog_request}")
                        
                        # Call the blog team API to create the workflow
                        async with httpx.AsyncClient() as client:
                            response = await client.post(
                                "http://localhost:8000/api/blog/create",
                                json=blog_request,
                                timeout=10.0
                            )
                            
                            if response.status_code in [200, 202]:
                                result = response.json()
                                real_workflow_id = result.get('workflow_id')
                                logger.info(f"✅ Blog workflow created successfully: {real_workflow_id}")
                                
                                # Send workflow_started message to frontend with REAL workflow ID
                                await websocket.send_json({
                                    "type": "workflow_started",
                                    "workflow_type": "blog",
                                    "workflow_id": real_workflow_id,
                                    "data": blog_request
                                })
                                
                                logger.info(f"✅ Workflow start message sent to frontend with ID: {real_workflow_id}")
                            else:
                                logger.error(f"❌ Failed to create blog workflow: {response.status_code} - {response.text}")
                                # Send error to frontend
                                await websocket.send_json({
                                    "type": "ui_update",
                                    "data": {
                                        "message": "Sorry, I couldn't start the blog workflow. Please try again.",
                                        "error": True
                                    }
                                })
                    except Exception as e:
                        logger.error(f"❌ Error creating blog workflow: {e}")
                        await websocket.send_json({
                            "type": "ui_update",
                            "data": {
                                "message": f"Sorry, there was an error starting the blog workflow: {str(e)}",
                                "error": True
                            }
                        })
                elif workflow_type == 'travel':
                    try:
                        import httpx
                        
                        # Prepare travel creation request
                        travel_request = {
                            "destination": workflow_data.get('destination', 'Unknown Destination'),
                            "duration": workflow_data.get('duration') or '7 days',
                            "budget": workflow_data.get('budget') or '$2500',
                            "preferences": workflow_data.get('preferences', {}),
                            "user_id": "voice_user"
                        }
                        
                        logger.info(f"✈️ Creating travel workflow with data: {travel_request}")
                        
                        # Call the travel team API to create the workflow
                        async with httpx.AsyncClient() as client:
                            response = await client.post(
                                "http://localhost:8000/api/travel/create",
                                json=travel_request,
                                timeout=10.0
                            )
                            
                            if response.status_code in [200, 202]:
                                result = response.json()
                                # Extract workflow ID from response data
                                real_workflow_id = result.get('data', {}).get('workflow_id')
                                logger.info(f"✅ Travel workflow created successfully: {real_workflow_id}")
                                
                                # Send workflow_started message to frontend with REAL workflow ID
                                await websocket.send_json({
                                    "type": "workflow_started",
                                    "workflow_type": "travel",
                                    "workflow_id": real_workflow_id,
                                    "data": travel_request
                                })
                                
                                logger.info(f"✅ Workflow start message sent to frontend with ID: {real_workflow_id}")
                            else:
                                logger.error(f"❌ Failed to create travel workflow: {response.status_code} - {response.text}")
                                await websocket.send_json({
                                    "type": "ui_update",
                                    "data": {
                                        "message": "Sorry, I couldn't start the travel workflow. Please try again.",
                                        "error": True
                                    }
                                })
                    except Exception as e:
                        logger.error(f"❌ Error creating travel workflow: {e}")
                        await websocket.send_json({
                            "type": "ui_update",
                            "data": {
                                "message": f"Sorry, there was an error starting the travel workflow: {str(e)}",
                                "error": True
                            }
                        })
                else:
                    # For other workflow types, just send the message for now
                    logger.warning(f"⚠️ Workflow type '{workflow_type}' not yet implemented in on_start_workflow")
                    await websocket.send_json({
                        "type": "workflow_started",
                        "workflow_type": workflow_type,
                        "workflow_id": workflow_id,
                        "data": workflow_data
                    })
                
            except Exception as e:
                logger.error(f"❌ Error starting workflow: {e}")
        
        lingo_agent.on_update_ui = send_ui_update
        lingo_agent.on_start_workflow = on_start_workflow
        logger.info("✅ Callbacks set for current WebSocket connection")
        
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to Lingo Agent with Intelligent Orchestration"
        })
        
        # Keep connection alive
        while True:
            try:
                # Receive message with timeout
                data = await asyncio.wait_for(websocket.receive_json(), timeout=30.0)
                message_type = data.get("type")
                
                logger.info(f"📨 Received: {message_type}")
                
                if message_type == "text_input" or message_type == "message":
                    text = data.get("text") or data.get("content", "")
                    
                    # ✅ Use Master Lingo Agent for intelligent processing
                    logger.info(f"🧠 Processing with Master Lingo Agent: {text}")
                    
                    # Process with Master Lingo Agent (don't send user message back - frontend already shows it)
                    await lingo_agent._process_user_input(text)
                    
                    logger.info(f"✅ Message processed by Master Lingo Agent")
                
                elif message_type == "ping":
                    await websocket.send_json({"type": "pong"})
                    logger.debug("🏓 Pong sent")
                
                elif message_type == "heartbeat":
                    await websocket.send_json({
                        "type": "heartbeat_response",
                        "timestamp": asyncio.get_event_loop().time()
                    })
                    logger.debug("💓 Heartbeat response")
                
                else:
                    logger.info(f"Unknown message type: {message_type}")
                    
            except asyncio.TimeoutError:
                # Send heartbeat on timeout
                try:
                    await websocket.send_json({
                        "type": "heartbeat",
                        "timestamp": asyncio.get_event_loop().time()
                    })
                except:
                    break
                    
            except WebSocketDisconnect:
                logger.info("🔌 Client disconnected")
                break
                    
            except Exception as e:
                logger.error(f"Message processing error: {e}")
                # Break on disconnect errors
                if "disconnect" in str(e).lower():
                    break
                
    except WebSocketDisconnect:
        logger.info("🔌 WebSocket disconnected")
    except Exception as e:
        logger.error(f"❌ WebSocket error: {e}")
    finally:
        active_websocket = None
        logger.info("🔌 WebSocket connection closed")

@router.get("/status")
async def get_status():
    """Get Lingo Agent status"""
    return {
        "status": "active",
        "websocket_connected": active_websocket is not None,
        "agent_ready": True
    }
