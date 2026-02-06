from __future__ import annotations

from typing import Optional, Dict, Any

from fastapi import Depends, Header, HTTPException, status

from app.core.security import verify_cognito_access_token, CognitoAuthError


async def get_current_user(
    authorization: Optional[str] = Header(default=None),
) -> Dict[str, Any]:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bearer token.",
        )

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bearer token.",
        )

    try:
        claims = await verify_cognito_access_token(token)
        # You can return a normalized user object here if you want
        return {
            "sub": claims.get("sub"),
            "username": claims.get("username"),
            "scope": claims.get("scope"),
            "client_id": claims.get("client_id"),
        }
    except CognitoAuthError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )
