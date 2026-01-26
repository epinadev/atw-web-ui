"""Application configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    app_name: str = "ATW Web API"
    debug: bool = False
    atw_command: str = "atw"
    host: str = "0.0.0.0"
    port: int = 8001
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    # Allow all origins in development (set ATW_WEB_CORS_ALLOW_ALL=true)
    cors_allow_all: bool = True

    class Config:
        env_prefix = "ATW_WEB_"


settings = Settings()
