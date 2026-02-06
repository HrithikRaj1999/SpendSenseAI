from __future__ import annotations

import time
from typing import Any, Dict, Optional

import httpx
from jose import jwt
from jose.exceptions import JWTError, ExpiredSignatureError

from app.core.config import settings


class CognitoAuthError(Exception):
    pass


_JWKS_CACHE: Dict[str, Any] = {"keys": None, "expires_at": 0}
_JWKS_TTL_SECONDS = 60 * 60  # 1 hour


def _jwks_url() -> str:
    return f"{settings.cognito_issuer}/.well-known/jwks.json"


async def _get_jwks() -> Dict[str, Any]:
    now = int(time.time())
    if _JWKS_CACHE["keys"] and now < int(_JWKS_CACHE["expires_at"]):
        return _JWKS_CACHE["keys"]

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(_jwks_url())
        if resp.status_code != 200:
            raise CognitoAuthError("Unable to fetch JWKS from Cognito.")
        jwks = resp.json()

    _JWKS_CACHE["keys"] = jwks
    _JWKS_CACHE["expires_at"] = now + _JWKS_TTL_SECONDS
    return jwks


def _pick_jwk(jwks: Dict[str, Any], kid: str) -> Optional[Dict[str, Any]]:
    keys = jwks.get("keys", [])
    for k in keys:
        if k.get("kid") == kid:
            return k
    return None


async def verify_cognito_access_token(token: str) -> Dict[str, Any]:
    """
    Verifies Cognito *access token*:
      - signature via JWKS
      - issuer check
      - expiration check
      - token_use == "access"
      - client_id matches app client
    Returns claims.
    """
    try:
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        if not kid:
            raise CognitoAuthError("Invalid token header (missing kid).")

        jwks = await _get_jwks()
        jwk = _pick_jwk(jwks, kid)
        if not jwk:
            # keys rotated -> refetch once
            _JWKS_CACHE["keys"] = None
            jwks = await _get_jwks()
            jwk = _pick_jwk(jwks, kid)
            if not jwk:
                raise CognitoAuthError("Invalid token (unknown kid).")

        claims = jwt.decode(
            token,
            jwk,
            algorithms=["RS256"],
            issuer=settings.cognito_issuer,
            options={
                "verify_aud": False,  # Cognito access token uses client_id, not aud
            },
        )

        # ---- strong checks ----
        token_use = claims.get("token_use")
        if token_use != "access":
            raise CognitoAuthError("Invalid token_use. Expected access token.")

        client_id = claims.get("client_id")
        if client_id != settings.cognito_client_id:
            raise CognitoAuthError("Token client_id mismatch.")

        return claims

    except ExpiredSignatureError:
        raise CognitoAuthError("Token expired.")
    except JWTError:
        raise CognitoAuthError("Token verification failed.")
