from typing import Optional, List, Any
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator, EmailStr, model_validator, Field
import secrets
from functools import lru_cache
import os

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "LeadGenie"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Cookie Security Settings
    SECURE_COOKIES: bool = False  # Set to True in production with HTTPS
    
    # CORS Settings
    backend_cors_origins_str: str = Field(default="", validation_alias="BACKEND_CORS_ORIGINS")

    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        if not self.backend_cors_origins_str:
            return []
        return [origin.strip() for origin in self.backend_cors_origins_str.split(",")]

    # Database Settings
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    @model_validator(mode="after")
    def assemble_db_connection(self) -> 'Settings':
        if self.SQLALCHEMY_DATABASE_URI is None:
            self.SQLALCHEMY_DATABASE_URI = f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"
        return self

    # Redis Settings
    REDIS_HOST: str
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None

    # OpenAI Settings
    OPENAI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    OPENAI_MAX_TOKENS: int = 2000
    OPENAI_TEMPERATURE: float = 0.7

    # Email Settings
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[EmailStr] = None
    EMAILS_FROM_NAME: Optional[str] = None

    # Security Settings
    FIRST_SUPERUSER: EmailStr
    FIRST_SUPERUSER_PASSWORD: str

    model_config = {
        'case_sensitive': True,
        'env_file': os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env'),
        'env_file_encoding': 'utf-8',
        'env_parse_none_str': 'None'
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()