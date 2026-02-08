from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    aws_region: str | None = Field(None, alias="AWS_REGION")
    cognito_user_pool_id: str | None = Field(None, alias="COGNITO_USER_POOL_ID")
    cognito_client_id: str | None = Field(None, alias="COGNITO_CLIENT_ID")

    @property
    def cognito_issuer(self) -> str:
        return f"https://cognito-idp.{self.aws_region}.amazonaws.com/{self.cognito_user_pool_id}"


settings = Settings()
