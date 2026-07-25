import httpx
import logging
import time
from typing import Any, Dict, Optional
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type, retry_if_result, before_sleep_log

logger = logging.getLogger(__name__)

class APIClientError(Exception):
    pass

class APIClientTimeout(APIClientError):
    pass

class APIClientRateLimit(APIClientError):
    pass

def should_retry(result) -> bool:
    if isinstance(result, httpx.Response):
        return result.status_code in [429, 500, 502, 503]
    return False

def scrub_params(params: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not params:
        return {}
    scrubbed = params.copy()
    for sensitive_key in ["key", "token", "appid", "api_key"]:
        if sensitive_key in scrubbed:
            scrubbed[sensitive_key] = "***"
    return scrubbed

class BaseClient:
    def __init__(self, base_url: str, timeout: int = 10):
        self.client = httpx.AsyncClient(base_url=base_url, timeout=timeout)
        self.provider = base_url

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=(retry_if_exception_type((httpx.TimeoutException, httpx.NetworkError, APIClientRateLimit)) | retry_if_result(should_retry)),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True
    )
    async def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> httpx.Response:
        safe_params = scrub_params(params)
        url = f"{self.client.base_url}{endpoint}"
        
        start_time = time.time()
        logger.info(f"API Provider: {self.provider} | Request URL: {url} | Params: {safe_params}")
        
        try:
            response = await self.client.get(endpoint, params=params)
            duration = round((time.time() - start_time) * 1000, 2)
            logger.info(f"API Provider: {self.provider} | Response Time: {duration}ms | Status Code: {response.status_code}")
            
            if response.status_code == 429:
                raise APIClientRateLimit("Rate limit exceeded")
                
            response.raise_for_status()
            return response
        except httpx.TimeoutException:
            logger.error(f"API Provider: {self.provider} | Timeout Error")
            raise APIClientTimeout("API Timeout")
        except httpx.NetworkError:
            logger.error(f"API Provider: {self.provider} | Network Failure")
            raise APIClientError("Network Failure")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=(retry_if_exception_type((httpx.TimeoutException, httpx.NetworkError, APIClientRateLimit)) | retry_if_result(should_retry)),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True
    )
    async def post(self, endpoint: str, json: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> httpx.Response:
        # If absolute URL is provided (like in Google Routes API), use it directly
        url = endpoint if endpoint.startswith("http") else f"{self.client.base_url}{endpoint}"
        
        start_time = time.time()
        logger.info(f"API Provider: {self.provider} | Request URL: {url}")
        
        try:
            response = await self.client.post(url, json=json, headers=headers)
            duration = round((time.time() - start_time) * 1000, 2)
            logger.info(f"API Provider: {self.provider} | Response Time: {duration}ms | Status Code: {response.status_code}")
            
            if response.status_code == 429:
                raise APIClientRateLimit("Rate limit exceeded")
                
            response.raise_for_status()
            return response
        except httpx.TimeoutException:
            logger.error(f"API Provider: {self.provider} | Timeout Error")
            raise APIClientTimeout("API Timeout")
        except httpx.NetworkError:
            logger.error(f"API Provider: {self.provider} | Network Failure")
            raise APIClientError("Network Failure")

    async def close(self):
        await self.client.aclose()

    async def close(self):
        await self.client.aclose()
