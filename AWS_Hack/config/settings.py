"""Application settings loaded from environment."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # LLM
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    # AWS
    aws_region: str = "us-east-1"
    aws_profile: str | None = None
    store_id: str = "store-001"
    
    # AWS Bedrock
    bedrock_model_id: str = "amazon.nova-pro-v1:0"

    # Table names (prefix with store_id if you want multi-tenant)
    inventory_table: str = "store-inventory"
    orders_table: str = "store-orders"
    equipment_table: str = "store-equipment"
    customers_table: str = "store-customers"
    staff_schedules_table: str = "store-staff-schedules"

    # Step Functions
    state_machine_name: str = "StoreOperationsWorkflow"

    @property
    def llm_api_key(self) -> str:
        return self.openai_api_key or self.anthropic_api_key


settings = Settings()