from fastapi import Request, status
from fastapi.responses import JSONResponse
import structlog

logger = structlog.get_logger(__name__)

class AppException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code

class AuthenticationException(AppException):
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)

class AuthorizationException(AppException):
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)

class ValidationException(AppException):
    def __init__(self, message: str = "Validation error"):
        super().__init__(message, status.HTTP_422_UNPROCESSABLE_ENTITY)

class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)

class DatabaseException(AppException):
    def __init__(self, message: str = "Database error occurred"):
        super().__init__(message, status.HTTP_500_INTERNAL_SERVER_ERROR)

class ExternalAPIException(AppException):
    def __init__(self, message: str = "External API call failed"):
        super().__init__(message, status.HTTP_502_BAD_GATEWAY)

class MLInferenceException(AppException):
    def __init__(self, message: str = "ML Inference failed"):
        super().__init__(message, status.HTTP_500_INTERNAL_SERVER_ERROR)

class ConfigurationException(AppException):
    def __init__(self, message: str = "Configuration error"):
        super().__init__(message, status.HTTP_500_INTERNAL_SERVER_ERROR)

async def app_exception_handler(request: Request, exc: AppException):
    logger.error("app_exception", path=request.url.path, status_code=exc.status_code, error=exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"message": exc.message}}
    )

from sqlalchemy.exc import SQLAlchemyError
from redis.exceptions import RedisError

async def global_exception_handler(request: Request, exc: Exception):
    correlation_id = getattr(request.state, "correlation_id", "unknown")
    logger.exception("unhandled_exception", path=request.url.path, error=str(exc), correlation_id=correlation_id)
    
    if isinstance(exc, SQLAlchemyError):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": {"message": "Database operation failed. Please try again later."}}
        )
    elif isinstance(exc, RedisError):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": {"message": "Cache operation failed. Please try again later."}}
        )
        
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": {"message": "Internal server error", "reference": correlation_id}}
    )
