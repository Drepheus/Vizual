import os
import logging
from openai import OpenAI
from datetime import datetime

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
    if not OPENAI_API_KEY:
        logger.error("OPENAI_API_KEY is not set in environment variables")
        return "Error: OpenAI API key is not configured. Please contact support."

    if not client and not init_openai_client():
        logger.error("Failed to initialize OpenAI client")
        return "Error: Could not initialize AI service. Please try again later."

    try:
        today_date = datetime.today().strftime('%Y-%m-%d')
        system_message = f"""You are BidBot, an AI assistant specialized in government contracting but also everything else. Today's date is {today_date}. You help users navigate processes step by step, providing clear and actionable guidance.

Your responses should follow this structure:
• Start with a direct answer to the query
• Follow with detailed explanation and context
• End with concrete next steps or recommendations

Format your responses using these visual cues:
• Use "🎯 Direct Answer:" to highlight the main response
• Use "📝 Details:" for explanations and context
• Use "⚡ Next Steps:" for actionable items
• Use bullet points (•) for lists
• Use emphasis for important terms or concepts

Keep responses professional, concise, and immediately actionable."""

        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": query}
        ]

        logger.debug(f"Sending request to OpenAI API with query: {query[:50]}...")
        logger.debug("Using model: gpt-4o-2024-11-20")

        response = client.chat.completions.create(
            model="gpt-4o-2024-11-20",
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )
        logger.debug("Successfully received response from OpenAI API")
        return response.choices[0].message.content

    except Exception as e:
        error_msg = str(e)
        logger.error(f"OpenAI API error: {error_msg}")
        return "I apologize, but I encountered an error processing your request. Please try again in a moment."

# Initialize the client when the module is imported
init_openai_client()