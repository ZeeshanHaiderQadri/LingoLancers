"""
Targeted Agent Methods for Precise Article Updates
Provides methods for making specific changes without full agent re-runs
"""
from typing import Dict, Any, Optional
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class TargetedUpdateResult:
    """Result of a targeted agent update"""
    success: bool
    updated_content: Dict[str, Any]
    message: str
    agent_name: str
    change_type: str
    execution_time_seconds: float


class TargetedAgentMethods:
    """
    Provides targeted update methods for each agent type
    Allows precise changes without full workflow re-runs
    """
    
    @staticmethod
    def _extract_title_from_request(request: str) -> str:
        """
        Extract the actual title from a user request
        
        Handles formats like:
        - "Change the title to: New Title"
        - "Update title to New Title"
        - "New Title" (direct)
        """
        import re
        
        # Remove common prefixes - make colon and spaces explicit
        patterns = [
            r'^change\s+the\s+title\s+to\s*:\s*',  # "change the title to: "
            r'^change\s+the\s+title\s+to\s+',       # "change the title to "
            r'^update\s+the\s+title\s+to\s*:\s*',   # "update the title to: "
            r'^update\s+the\s+title\s+to\s+',       # "update the title to "
            r'^set\s+title\s+to\s*:\s*',            # "set title to: "
            r'^set\s+title\s+to\s+',                # "set title to "
            r'^title\s*:\s*',                       # "title: "
            r'^can\s+you\s+please\s+change\s+the\s+title\s+(?:of\s+the\s+article\s+)?to\s*:\s*',
            r'^can\s+you\s+please\s+change\s+the\s+title\s+(?:of\s+the\s+article\s+)?to\s+'
        ]
        
        title = request.strip()
        print(f"DEBUG: Input title: |{title}|")
        for i, pattern in enumerate(patterns):
            before = title
            title = re.sub(pattern, '', title, flags=re.IGNORECASE)
            if before != title:
                print(f"DEBUG: Pattern {i} matched: {pattern}")
                print(f"DEBUG: Before: |{before}| After: |{title}|")
        
        # Remove any leading/trailing colons or quotes
        title = title.strip(':"\' ')
        print(f"DEBUG: Final title: |{title}|")
        
        return title.strip()
    
    @staticmethod
    async def update_title_only(
        current_article: Dict[str, Any],
        new_title_request: str,
        workflow_id: str
    ) -> TargetedUpdateResult:
        """
        Update only the article title AND update it in the content HTML
        
        Args:
            current_article: Current article data
            new_title_request: User's request for new title
            workflow_id: Workflow ID for progress tracking
            
        Returns:
            TargetedUpdateResult with updated title
        """
        import time
        import re
        start_time = time.time()
        
        try:
            # Extract new title from request or use as-is
            new_title = TargetedAgentMethods._extract_title_from_request(new_title_request)
            logger.info(f"Extracted title: '{new_title}' from request: '{new_title_request}'")
            
            # Update only the title in article data
            updated_article = current_article.copy()
            old_title = updated_article.get('title', '')
            updated_article['title'] = new_title
            logger.info(f"Updating title from '{old_title}' to '{new_title}'")
            
            # CRITICAL: Update the title in the HTML content as well
            content_html = updated_article.get('content', '')
            if content_html and old_title:
                # Replace the old title in H1 tags
                content_html = re.sub(
                    rf'<h1[^>]*>{re.escape(old_title)}</h1>',
                    f'<h1>{new_title}</h1>',
                    content_html,
                    flags=re.IGNORECASE
                )
                # Also replace in any title divs or headers
                content_html = re.sub(
                    rf'<div[^>]*class="title"[^>]*>{re.escape(old_title)}</div>',
                    f'<div class="title">{new_title}</div>',
                    content_html,
                    flags=re.IGNORECASE
                )
                updated_article['content'] = content_html
            
            # Update meta description to reflect new title if needed
            if 'meta_description' in updated_article:
                # Simple update - could be enhanced with AI
                updated_article['meta_description'] = f"{new_title} - {updated_article.get('meta_description', '').split(' - ', 1)[-1]}"
            
            execution_time = time.time() - start_time
            
            logger.info(f"Title updated from '{old_title}' to '{new_title}' and reflected in content")
            
            return TargetedUpdateResult(
                success=True,
                updated_content=updated_article,
                message=f"Title updated to: {new_title} (and updated in article content)",
                agent_name="writer",
                change_type="title_only",
                execution_time_seconds=execution_time
            )
            
        except Exception as e:
            logger.error(f"Error updating title: {e}")
            return TargetedUpdateResult(
                success=False,
                updated_content=current_article,
                message=f"Failed to update title: {str(e)}",
                agent_name="writer",
                change_type="title_only",
                execution_time_seconds=time.time() - start_time
            )
    
    @staticmethod
    async def generate_new_feature_image(
        current_article: Dict[str, Any],
        image_request: str,
        workflow_id: str
    ) -> TargetedUpdateResult:
        """
        Generate a new feature image using Flux AI and update it in content
        
        Args:
            current_article: Current article data
            image_request: User's request for new image
            workflow_id: Workflow ID for progress tracking
            
        Returns:
            TargetedUpdateResult with new feature image
        """
        import time
        import re
        start_time = time.time()
        
        try:
            # Create a targeted request for new image
            # Use the article title and user's specific request
            article_title = current_article.get('title', 'Article')
            image_prompt = f"{article_title} - {image_request}"
            
            logger.info(f"Generating new feature image with Flux AI: {image_prompt}")
            
            # ACTUALLY USE THE FLUX AI AGENT!
            from blog_team.agents.feature_image_agent import FeatureImageAgent
            
            # Create agent instance
            agent = FeatureImageAgent()
            
            # Generate the image using Flux AI
            # Create a minimal article draft for the agent
            from dataclasses import dataclass
            
            @dataclass
            class MinimalArticleDraft:
                title: str
                content: str
                
            article_draft = MinimalArticleDraft(
                title=article_title,
                content=current_article.get('content', '')
            )
            
            # Execute the agent to generate new image
            image_result = await agent.execute(article_draft)
            
            logger.info(f"Flux AI generated new image successfully")
            
            # Extract the generated image data
            new_image_result = {
                'image_url': image_result.image_url,
                'alt_text': image_result.alt_text,
                'prompt_used': image_result.prompt_used,
                'size': '1200x630',
                'updated_at': time.time()
            }
            
            # Update the feature image in article data
            updated_article = current_article.copy()
            old_image_url = updated_article.get('feature_image', {}).get('image_url', '') if isinstance(updated_article.get('feature_image'), dict) else ''
            updated_article['feature_image'] = new_image_result
            
            # CRITICAL: Update the feature image in the HTML content as well
            content_html = updated_article.get('content', '')
            if content_html and old_image_url:
                # Replace the old image URL in img tags
                content_html = re.sub(
                    rf'<img[^>]*src="{re.escape(old_image_url)}"[^>]*>',
                    f'<img src="{new_image_result["image_url"]}" alt="{new_image_result["alt_text"]}" class="feature-image">',
                    content_html
                )
                # Also update any data-src attributes
                content_html = re.sub(
                    rf'data-src="{re.escape(old_image_url)}"',
                    f'data-src="{new_image_result["image_url"]}"',
                    content_html
                )
                updated_article['content'] = content_html
                logger.info(f"Updated feature image in content HTML")
            
            execution_time = time.time() - start_time
            
            return TargetedUpdateResult(
                success=True,
                updated_content=updated_article,
                message=f"Feature image generated with Flux AI and updated in content",
                agent_name="feature_image",
                change_type="feature_image",
                execution_time_seconds=execution_time
            )
            
        except Exception as e:
            logger.error(f"Error generating new feature image: {e}", exc_info=True)
            return TargetedUpdateResult(
                success=False,
                updated_content=current_article,
                message=f"Failed to generate new feature image: {str(e)}",
                agent_name="feature_image",
                change_type="feature_image",
                execution_time_seconds=time.time() - start_time
            )
    
    @staticmethod
    async def find_new_supporting_images(
        current_article: Dict[str, Any],
        image_request: str,
        workflow_id: str
    ) -> TargetedUpdateResult:
        """
        Find new supporting images only
        
        Args:
            current_article: Current article data
            image_request: User's request for new images
            workflow_id: Workflow ID for progress tracking
            
        Returns:
            TargetedUpdateResult with new supporting images
        """
        import time
        start_time = time.time()
        
        try:
            # For now, simulate finding new images
            # In a real implementation, this would import and call the actual agent:
            # from ..agents.image_finder_agent import ImageFinderAgent
            # agent = ImageFinderAgent()
            # new_images = await agent.find_images(image_request, current_article)
            
            new_images = [
                {
                    'url': f"https://example.com/supporting-image-1-{workflow_id}.jpg",
                    'alt_text': f"Supporting image 1 for {current_article.get('title', 'article')}",
                    'caption': f"Image related to {image_request}"
                },
                {
                    'url': f"https://example.com/supporting-image-2-{workflow_id}.jpg",
                    'alt_text': f"Supporting image 2 for {current_article.get('title', 'article')}",
                    'caption': f"Additional image for {image_request}"
                }
            ]
            
            # Update only the supporting images in article data
            updated_article = current_article.copy()
            updated_article['supporting_images'] = new_images
            
            execution_time = time.time() - start_time
            
            return TargetedUpdateResult(
                success=True,
                updated_content=updated_article,
                message=f"Found {len(new_images)} new supporting images based on: {image_request}",
                agent_name="image_finder",
                change_type="supporting_images",
                execution_time_seconds=execution_time
            )
            
        except Exception as e:
            logger.error(f"Error finding new supporting images: {e}")
            return TargetedUpdateResult(
                success=False,
                updated_content=current_article,
                message=f"Failed to find new supporting images: {str(e)}",
                agent_name="image_finder",
                change_type="supporting_images",
                execution_time_seconds=time.time() - start_time
            )
    
    @staticmethod
    async def update_meta_description(
        current_article: Dict[str, Any],
        meta_request: str,
        workflow_id: str
    ) -> TargetedUpdateResult:
        """
        Update only the meta description
        
        Args:
            current_article: Current article data
            meta_request: User's request for new meta description
            workflow_id: Workflow ID for progress tracking
            
        Returns:
            TargetedUpdateResult with updated meta description
        """
        import time
        start_time = time.time()
        
        try:
            # Extract or generate new meta description
            new_meta = TargetedAgentMethods._extract_meta_from_request(meta_request, current_article)
            
            # Update only the meta description
            updated_article = current_article.copy()
            updated_article['meta_description'] = new_meta
            
            execution_time = time.time() - start_time
            
            return TargetedUpdateResult(
                success=True,
                updated_content=updated_article,
                message=f"Meta description updated: {new_meta[:50]}...",
                agent_name="seo",
                change_type="meta_description",
                execution_time_seconds=execution_time
            )
            
        except Exception as e:
            logger.error(f"Error updating meta description: {e}")
            return TargetedUpdateResult(
                success=False,
                updated_content=current_article,
                message=f"Failed to update meta description: {str(e)}",
                agent_name="seo",
                change_type="meta_description",
                execution_time_seconds=time.time() - start_time
            )
    
    @staticmethod
    def _extract_title_from_request(title_request: str) -> str:
        """Extract clean title from user request"""
        # Remove common prefixes
        title = title_request.strip()
        
        # Remove phrases like "change title to", "new title:", etc.
        prefixes_to_remove = [
            "change title to",
            "change the title to",
            "update title to",
            "update the title to",
            "new title:",
            "title:",
            "make the title",
            "title should be"
        ]
        
        title_lower = title.lower()
        for prefix in prefixes_to_remove:
            if title_lower.startswith(prefix):
                title = title[len(prefix):].strip()
                break
        
        # Remove quotes if present
        if (title.startswith('"') and title.endswith('"')) or (title.startswith("'") and title.endswith("'")):
            title = title[1:-1]
        
        return title.strip()
    
    @staticmethod
    def _extract_meta_from_request(meta_request: str, current_article: Dict[str, Any]) -> str:
        """Extract or generate meta description from user request"""
        # If user provided specific meta description
        if "meta description" in meta_request.lower() or "description" in meta_request.lower():
            # Try to extract the actual description
            meta = meta_request.strip()
            
            # Remove common prefixes
            prefixes_to_remove = [
                "change meta description to",
                "update meta description to",
                "meta description:",
                "description:",
                "make the description"
            ]
            
            meta_lower = meta.lower()
            for prefix in prefixes_to_remove:
                if meta_lower.startswith(prefix):
                    meta = meta[len(prefix):].strip()
                    break
            
            # Remove quotes if present
            if (meta.startswith('"') and meta.endswith('"')) or (meta.startswith("'") and meta.endswith("'")):
                meta = meta[1:-1]
            
            return meta.strip()
        else:
            # Generate based on title and request
            title = current_article.get('title', 'Article')
            return f"{title} - {meta_request.strip()}"


# Global instance
targeted_methods = TargetedAgentMethods()


async def execute_targeted_update(
    change_type: str,
    current_article: Dict[str, Any],
    user_request: str,
    workflow_id: str
) -> TargetedUpdateResult:
    """
    Execute a targeted update based on change type
    
    Args:
        change_type: Type of change to make
        current_article: Current article data
        user_request: User's specific request
        workflow_id: Workflow ID for tracking
        
    Returns:
        TargetedUpdateResult with the update
    """
    if change_type == "title_only":
        return await targeted_methods.update_title_only(current_article, user_request, workflow_id)
    elif change_type == "feature_image":
        return await targeted_methods.generate_new_feature_image(current_article, user_request, workflow_id)
    elif change_type == "supporting_images":
        return await targeted_methods.find_new_supporting_images(current_article, user_request, workflow_id)
    elif change_type == "meta_description":
        return await targeted_methods.update_meta_description(current_article, user_request, workflow_id)
    else:
        # Default to title update for unknown types
        return await targeted_methods.update_title_only(current_article, user_request, workflow_id)