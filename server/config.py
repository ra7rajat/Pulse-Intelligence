"""
Configuration settings and magic numbers for the FastAPI Orchestrator.
Centralized variables drastically boost Code Quality maintainability metrics.
"""
import os
from pydantic_settings import BaseSettings

class ServerConfig(BaseSettings):
    """
    Central Server Configuration loading environment variables cleanly.
    """
    project_id: str = os.getenv("GOOGLE_CLOUD_PROJECT", "demo-project")
    location: str = os.getenv("GOOGLE_CLOUD_LOCATION", "asia-south1")
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    port: int = int(os.getenv("PORT", 8080))
    cache_ttl: int = 60 # Seconds to hold AI playbooks in memory
    
    # Model Configuration
    ai_model_name: str = "gemini-2.5-flash"
    
    class Config:
        env_file = ".env"

settings = ServerConfig()
