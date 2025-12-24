1`  1qASZD`?
#!/usr/bin/env python3
"""
🔍 DEBUG: Callback Connection Issues
Diagnose why workflows complete in 0.0 seconds and callbacks aren't working
"""

import asyncio
import websockets
import json
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_websocket_callbacks():
    """Test WebSocket connection and callback functionality"""
    
    print("🔍 TESTING WEBSOCKET CALLBACK CONNECTION")
    print("=" * 50)
    
    try:
        # Connect to WebSocket (correct endpoint)
        uri = "ws://localhost:8000/api/lingo/ws"
        print(f"📡 Connecting to: {uri}")
        
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected successfully")
            
            # Test 1: Send a travel request
            print("\n🧪 TEST 1: Travel Planning Request")
            travel_message = {
                "type": "text_input",
                "text": "I want to plan a trip to London"
            }
            
            await websocket.send(json.dumps(travel_message))
            print("📤 Sent travel request")
            
            # Listen for responses
            response_count = 0
            start_time = datetime.now()
            
            while response_count < 5:  # Listen for up to 5 responses
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    data = json.loads(response)
                    response_count += 1
                    
                    elapsed = (datetime.now() - start_time).total_seconds()
                    
                    print(f"\n📥 Response {response_count} (after {elapsed:.1f}s):")
                    print(f"   Type: {data.get('type', 'unknown')}")
                    
                    if data.get('type') == 'start_workflow':
                        print(f"   🎯 WORKFLOW START DETECTED!")
                        print(f"   Workflow Type: {data.get('workflow_type')}")
                        print(f"   Data: {data.get('data', {})}")
                        
                    elif data.get('type') == 'navigate':
                        print(f"   🧭 NAVIGATION DETECTED!")
                        print(f"   Destination: {data.get('destination')}")
                        
                    elif data.get('type') == 'chat_message':
                        print(f"   💬 CHAT MESSAGE:")
                        print(f"   Role: {data.get('role')}")
                        print(f"   Content: {data.get('content', '')[:100]}...")
                        
                    else:
                        print(f"   Raw: {str(data)[:200]}...")
                        
                except asyncio.TimeoutError:
                    print(f"\n⏰ Timeout after {response_count} responses")
                    break
                except Exception as e:
                    print(f"\n❌ Error receiving response: {e}")
                    break
            
            # Test 2: Send a blog request
            print(f"\n🧪 TEST 2: Blog Writing Request")
            blog_message = {
                "type": "text_input", 
                "text": "Write a blog article about AI"
            }
            
            await websocket.send(json.dumps(blog_message))
            print("📤 Sent blog request")
            
            # Listen for blog responses
            blog_responses = 0
            while blog_responses < 3:
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=8.0)
                    data = json.loads(response)
                    blog_responses += 1
                    
                    print(f"\n📥 Blog Response {blog_responses}:")
                    print(f"   Type: {data.get('type', 'unknown')}")
                    
                    if data.get('type') == 'start_workflow':
                        print(f"   🎯 BLOG WORKFLOW START DETECTED!")
                        print(f"   Workflow Type: {data.get('workflow_type')}")
                        
                except asyncio.TimeoutError:
                    print(f"\n⏰ Blog test timeout after {blog_responses} responses")
                    break
                    
    except Exception as e:
        print(f"❌ WebSocket connection failed: {e}")
        return False
    
    print(f"\n✅ WebSocket callback test completed")
    return True

async def test_backend_status():
    """Check if backend is running and responsive"""
    
    print("\n🔍 TESTING BACKEND STATUS")
    print("=" * 30)
    
    import aiohttp
    
    try:
        async with aiohttp.ClientSession() as session:
            # Test health endpoint
            async with session.get("http://localhost:8000/health") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Backend health: {data}")
                else:
                    print(f"⚠️ Backend health check failed: {response.status}")
                    
            # Test lingo status
            async with session.get("http://localhost:8000/lingo/status") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Lingo status: {data}")
                else:
                    print(f"⚠️ Lingo status check failed: {response.status}")
                    
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False
        
    return True

async def main():
    """Run all diagnostic tests"""
    
    print("🚀 CALLBACK CONNECTION DIAGNOSTIC")
    print("=" * 60)
    print(f"⏰ Started at: {datetime.now()}")
    
    # Test backend first
    backend_ok = await test_backend_status()
    if not backend_ok:
        print("\n❌ Backend is not responding. Please start the backend first.")
        return
    
    # Test WebSocket callbacks
    websocket_ok = await test_websocket_callbacks()
    
    print(f"\n📊 DIAGNOSTIC SUMMARY")
    print("=" * 30)
    print(f"Backend Status: {'✅ OK' if backend_ok else '❌ FAILED'}")
    print(f"WebSocket Callbacks: {'✅ OK' if websocket_ok else '❌ FAILED'}")
    
    if not websocket_ok:
        print(f"\n🔧 RECOMMENDED FIXES:")
        print("1. Check if backend is running on port 8000")
        print("2. Verify WebSocket endpoint is registered")
        print("3. Check callback registration in lingo_agent")
        print("4. Verify Agent Lightning integration")

if __name__ == "__main__":
    asyncio.run(main())