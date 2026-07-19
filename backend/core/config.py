import os
from pathlib import Path
from pydantic import BaseSettings, Field, AnyUrl, validator

class Settings(BaseSettings):
    # General
    PROJECT_NAME: str = "StadiumOS AI Backend"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = Field("development", env="ENVIRONMENT")
    API_V1_STR: str = "/api/v1"

    # CORS
    ALLOWED_HOSTS: list[str] = Field(default_factory=lambda: ["*"])

    # Database
    DATABASE_URL: str = Field("sqlite:///./stadiumos.db", env="DATABASE_URL")

    # Security / JWT
    SECRET_KEY: str = Field("dev_secret_key", env="SECRET_KEY")
    ALGORITHM: str = Field("HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(30, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    # External services
    GEMINI_API_KEY: str = Field("", env="GEMINI_API_KEY")
    SUPABASE_URL: AnyUrl = Field("https://example.com", env="SUPABASE_URL")
    SUPABASE_ANON_KEY: str = Field("", env="SUPABASE_ANON_KEY")

    class Config:
        env_file = str(Path(__file__).resolve().parents[1] / ".env")
        env_file_encoding = "utf-8"

    @validator("ALLOWED_HOSTS", pre=True)
    def split_allowed_hosts(cls, v):
        if isinstance(v, str):
            return [host.strip() for host in v.split(",")]
        return v

    @validator("DATABASE_URL", pre=True)
    def normalize_sqlite_path(cls, v):
        if isinstance(v, str) and v.startswith("sqlite:///"):
            if os.getenv("VERCEL") or os.getenv("VERCEL_ENV"):
                if v in ("sqlite:///./stadiumos.db", "sqlite:///stadiumos.db"):
                    return "sqlite:////tmp/stadiumos.db"
        return v

# Export a singleton instance for easy import
settings = Settings()
