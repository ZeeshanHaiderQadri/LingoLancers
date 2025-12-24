"""
Global team instances for the application
"""

from typing import Optional, Any, Dict

# Team instances will be set during application startup
web_design_team: Optional[Any] = None
web_development_team: Optional[Any] = None
ecommerce_team: Optional[Any] = None
social_media_team: Optional[Any] = None
blog_writing_team: Optional[Any] = None
research_team: Optional[Any] = None
travel_planning_team: Optional[Any] = None

def set_team_instances(**kwargs):
    """Set the global team instances"""
    global web_design_team, web_development_team, ecommerce_team
    global social_media_team, blog_writing_team, research_team, travel_planning_team
    
    web_design_team = kwargs.get('web_design_team')
    web_development_team = kwargs.get('web_development_team')
    ecommerce_team = kwargs.get('ecommerce_team')
    social_media_team = kwargs.get('social_media_team')
    blog_writing_team = kwargs.get('blog_writing_team')
    research_team = kwargs.get('research_team')
    travel_planning_team = kwargs.get('travel_planning_team')

def get_team_instances() -> Dict[str, Any]:
    """Get all team instances"""
    return {
        'web_design': web_design_team,
        'web_development': web_development_team,
        'ecommerce': ecommerce_team,
        'social_media': social_media_team,
        'blog_writing': blog_writing_team,
        'research': research_team,
        'travel_planning': travel_planning_team
    }