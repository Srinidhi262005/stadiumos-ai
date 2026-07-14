from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import Settings
from .core.logging import logger
from .api.router import api_router

settings = Settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint for the whole service
@app.get("/health")
async def health_check():
    logger.info("Health check called")
    return {"status": "ok", "service": "backend", "environment": settings.ENVIRONMENT}

# Include API routers under versioned prefix
app.include_router(api_router, prefix=settings.API_V1_STR)
