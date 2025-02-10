import os
import logging
from openai import OpenAI
import json
import re

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

def get_local_response(query):
    """Fallback function for when API calls fail"""
    # Basic keyword matching for common government contracting terms
    keywords = {
        "sam": "SAM.gov is the official site for registering to do business with the federal government.",
        "registration": "To bid on government contracts, businesses must register in SAM.gov and obtain a DUNS number.",
        "duns": "A DUNS number is a unique nine-digit identifier for businesses, required for federal government contracting.",
        "contract": "Government contracts are agreements between federal agencies and private businesses for goods or services.",
        "bid": "Government contract bids must be submitted according to the specific requirements in the solicitation.",
    }

    # Simple response generation based on keywords
    response_parts = []
    query_lower = query.lower()

    for keyword, info in keywords.items():
        if keyword in query_lower:
            response_parts.append(info)

    if not response_parts:
        return "I can provide basic information about government contracting. Please ask about specific topics like SAM registration, DUNS numbers, or bidding processes."

    return " ".join(response_parts)

def get_ai_response(query):
    if not client and not init_openai_client():
        logger.warning("OpenAI API not configured, falling back to local processing")
        return get_local_response(query)

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
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
        error_msg = str(e)
        logger.error(f"OpenAI API error: {error_msg}")

        # Fall back to local processing for any API errors
        logger.info("Falling back to local processing")
        return get_local_response(query)


# The following code is removed because it is no longer needed.
#POE_EMAIL = os.environ.get("POE_EMAIL")
#POE_PASSWORD = os.environ.get("POE_PASSWORD")
#client = None
#
#def init_poe_client():
#    global client
#    if not POE_EMAIL or not POE_PASSWORD:
#        logger.error("POE_EMAIL or POE_PASSWORD environment variables are not set")
#        return False
#    try:
#        client = PoeApi(POE_EMAIL, POE_PASSWORD)
#        logger.debug("Poe client initialized successfully")
#        return True
#    except Exception as e:
#        logger.error(f"Failed to initialize Poe client: {e}")
#        return False
#
#def get_ai_response(query):
#    if not client and not init_poe_client():
#        return "Error: Poe API is not properly configured. Please try again later."
#
#    try:
#        response = client.send_message("chatgpt", query)
#        logger.debug("Successfully received response from Poe API")
#        return response
#    except Exception as e:
#        error_msg = str(e)
#        if "auth" in error_msg.lower():
#            logger.error(f"Poe API authentication error: {e}")
#            return "Authentication error. Please check your Poe credentials or contact support."
#        elif "rate" in error_msg.lower():
#            logger.error(f"Poe API rate limit exceeded: {e}")
#            return "We're processing too many requests right now. Please try again in a few moments."
#        else:
#            logger.error(f"Error processing query: {e}")
#            return f"An unexpected error occurred. Please try again later. Error: {str(e)}"

# Initialize the client when the module is imported
init_openai_client()