"""Run the store operations crew (all agents) locally. Uses AWS Bedrock — no OpenAI key."""
import os

from dotenv import load_dotenv

load_dotenv()

from agents.crew import run_store_operations


def main():
    if not any(
        os.getenv(k) for k in ("AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_PROFILE")
    ):
        print("Configure AWS first: run 'aws configure' or set AWS_REGION / AWS_PROFILE in .env")
        return
    print("Starting Store Operations Crew (AWS Bedrock)...")
    result = run_store_operations()
    print("\n--- Crew output ---")
    print(result)


if __name__ == "__main__":
    main()
