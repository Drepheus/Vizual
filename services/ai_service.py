import os
import logging
from openai import OpenAI

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
client = None

def init_openai_client():
    global client
    if not OPENAI_API_KEY:
        logger.error("OPENAI_API_KEY environment variable is not set")
        return False
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        logger.debug("OpenAI client initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize OpenAI client: {e}")
        return False

def get_ai_response(query):
    if not client and not init_openai_client():
        return "Error: OpenAI API is not properly configured. Please try again later."

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Using GPT-3.5-turbo as requested
            messages=[
                {
                    "role": "system",
                    "content": "You are a GovCon AI Assistant helping with government contracting questions. Provide clear, accurate information about government contracts, regulations, and procurement processes."
                },
                {"role": "user", "content": query}
            ],
            temperature=0.7,
            max_tokens=500
        )
        logger.debug("Successfully received response from OpenAI API")
        return response.choices[0].message.content
    except Exception as e:
        error_msg = f"Error processing query: {str(e)}"
        logger.error(error_msg)
        return error_msg

# Initialize the client when the module is imported
init_openai_client()