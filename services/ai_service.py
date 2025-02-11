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

def get_sam_context(query):
    """Get relevant SAM.gov data as context"""
    try:
        sam_context = "\nRecent SAM.gov Data:\n"

        # Try to get relevant data with a timeout
        try:
            relevant_data = get_relevant_data(query)
            if relevant_data and not isinstance(relevant_data, dict):
                sam_context += "\nCurrent Active Opportunities:\n"
                for opp in relevant_data:
                    sam_context += f"- Title: {opp.get('entity_name')}\n"
                    sam_context += f"  Solicitation Number: {opp.get('duns')}\n"
                    sam_context += f"  Status: {opp.get('status')}\n"
                    sam_context += f"  Response Due: {opp.get('expiration_date')}\n"
                    sam_context += f"  View on SAM.gov: {opp.get('url')}\n\n"
        except Exception as e:
            logger.error(f"Error fetching relevant data: {e}")
            sam_context += "\nNote: Unable to fetch current opportunities at this moment.\n"

        # Try to get awarded contracts with a timeout
        try:
            awarded_contracts = get_awarded_contracts()
            if awarded_contracts:
                sam_context += "\nRecent Contract Awards:\n"
                for award in awarded_contracts:
                    sam_context += f"- Title: {award.get('title')}\n"
                    sam_context += f"  Amount: {award.get('award_amount')}\n"
                    sam_context += f"  Awardee: {award.get('awardee')}\n\n"
        except Exception as e:
            logger.error(f"Error fetching awarded contracts: {e}")

        return sam_context
    except Exception as e:
        logger.error(f"Error getting SAM.gov context: {e}")
        return "\nNote: SAM.gov data temporarily unavailable\n"

def get_ai_response(query):
    if not OPENAI_API_KEY:
        logger.error("OPENAI_API_KEY is not set in environment variables")
        return "Error: OpenAI API key is not configured. Please contact support."

    if not client and not init_openai_client():
        logger.error("Failed to initialize OpenAI client")
        return "Error: Could not initialize AI service. Please try again later."

    try:
        # Process web content including SAM.gov data with timeout
        try:
            web_contents = process_web_content(query)
            context = ""
            if web_contents:
                context = "\nRelevant Information:\n"
                for content in web_contents:
                    context += f"\nFrom {content['url']}:\n{content['content']}\n"
        except Exception as e:
            logger.error(f"Error processing web content: {e}")
            context = "\nNote: Additional web content currently unavailable\n"

        # Get SAM.gov context
        sam_context = get_sam_context(query)

        messages = [
            {
                "role": "system",
                "content": """You are BidBot, an AI assistant specialized in government contracting with advanced web browsing capabilities. Your responses should be immediate and actionable.

Key Behaviors:
1. Provide direct, concise answers
2. Include relevant SAM.gov data when available
3. Cite sources and provide working links
4. Always maintain professional tone

When SAM.gov data is available:
- Present opportunities with direct links
- Include key details like agency and dates
- Highlight important deadlines

Keep responses focused on practical value for government contractors."""
            }
        ]

        if context or sam_context:
            messages.append({
                "role": "system",
                "content": f"Here is relevant context for your response:{context}{sam_context}"
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