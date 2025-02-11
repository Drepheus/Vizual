import os
import logging
from openai import OpenAI
import json
from services.web_service import process_web_content
from services.sam_service import get_relevant_data, get_awarded_contracts
from datetime import datetime, timedelta

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

def format_web_content(web_contents):
    """Format web content for AI context"""
    if not web_contents:
        return ""

    formatted_content = "\nWeb Content:\n"
    for content in web_contents:
        # For SAM.gov solicitations, keep the full content
        if 'sam.gov' in content['url'].lower():
            formatted_content += f"\nFrom SAM.gov:\n{content['content']}\n"
        else:
            # For other web content, truncate to avoid token limits
            formatted_content += f"\nFrom {content['url']}:\n{content['content'][:1000]}...\n"

    return formatted_content

def get_ai_response(query):
    if not OPENAI_API_KEY:
        logger.error("OPENAI_API_KEY is not set in environment variables")
        return "Error: OpenAI API key is not configured. Please contact support."

    if not client and not init_openai_client():
        logger.error("Failed to initialize OpenAI client")
        return "Error: Could not initialize AI service. Please try again later."

    try:
        # Get SAM.gov data first
        relevant_data = get_relevant_data(query)

        system_message = """You are BidBot, an AI assistant specialized in government contracting. Your responses should be immediate and actionable.

Key Behaviors:
1. Provide direct, concise answers
2. When SAM.gov data is available, highlight opportunities with direct links
3. When SAM.gov data is unavailable, provide alternative guidance
4. Always maintain professional tone

Response Format:
- Start with direct answer to query
- If SAM.gov data available: List relevant opportunities
- If no SAM.gov data: Provide alternative guidance
- End with actionable next steps
"""

        messages = [{"role": "system", "content": system_message}]

        # Add context about SAM.gov data availability
        if relevant_data:
            context = "\nCurrent Active Opportunities:\n"
            for opp in relevant_data:
                context += f"- Title: {opp['entity_name']}\n"
                context += f"  Solicitation Number: {opp['duns']}\n"
                context += f"  Status: {opp['status']}\n"
                context += f"  Due Date: {opp['expiration_date']}\n"
                context += f"  View on SAM.gov: {opp['url']}\n\n"

            messages.append({
                "role": "system",
                "content": f"Here are relevant opportunities from SAM.gov:\n{context}"
            })
        else:
            messages.append({
                "role": "system",
                "content": "Note: We're currently experiencing high traffic on SAM.gov API. I'll provide general guidance and alternative resources while the system recovers. You can try your search again in a few minutes."
            })

        messages.append({"role": "user", "content": query})

        logger.debug(f"Sending request to OpenAI API with query: {query[:50]}...")
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )
        logger.debug("Successfully received response from OpenAI API")
        return response.choices[0].message.content
    except Exception as e:
        error_msg = str(e)
        logger.error(f"OpenAI API error: {error_msg}")
        return f"I apologize, but I encountered an error processing your request. Please try again. If the issue persists, contact support."

# Initialize the client when the module is imported
init_openai_client()