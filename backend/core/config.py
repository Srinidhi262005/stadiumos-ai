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
    DATABASE_URL: AnyUrl = Field(..., env="DATABASE_URL")

    # Security / JWT
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = Field("HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(30, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    # External services
    GEMINI_API_KEY: str = Field(..., env="GEMINI_API_KEY")
    SUPABASE_URL: AnyUrl = Field(..., env="SUPABASE_URL")
    SUPABASE_ANON_KEY: str = Field(..., env="SUPABASE_ANON_KEY")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @validator("ALLOWED_HOSTS", pre=True)
    def split_allowed_hosts(cls, v):
        if isinstance(v, str):
            return [host.strip() for host in v.split(",")]
        return v

# Export a singleton instance for easy import
settings = Settings()
