import os
from fastapi import FastAPI, Depends, HTTPException, Header
from dotenv import load_dotenv

load_dotenv()

from routers import embed, ask
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
app = FastAPI(title="NoteSense AI Service")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

async def verify_internal_key(x_internal_key: str = Header(...)):
    expected_key = os.getenv("INTERNAL_API_KEY")
    if x_internal_key != expected_key:
        raise HTTPException(status_code=403, detail="Invalid internal API key")
    return x_internal_key

# Apply security globally to all internal routes
app.include_router(embed.router, prefix="/internal", dependencies=[Depends(verify_internal_key)])
app.include_router(ask.router, prefix="/internal", dependencies=[Depends(verify_internal_key)])

@app.get("/health")
def health_check():
    return {"status": "ok"}
