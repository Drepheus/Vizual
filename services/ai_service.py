import os
import logging
from openai import OpenAI
import json
from services.web_service import process_web_content
from services.sam_service import get_relevant_data, get_awarded_contracts

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
        relevant_data = get_relevant_data(query)
        awarded_contracts = get_awarded_contracts()

        sam_context = "\nRecent SAM.gov Data:\n"

        if relevant_data and not isinstance(relevant_data, dict):  # Check if it's not an error response
            sam_context += "\nRelevant Opportunities:\n"
            for opp in relevant_data:
                sam_context += f"- Title: {opp.get('entity_name')}\n"
                sam_context += f"  Solicitation Number: {opp.get('duns')}\n"
                sam_context += f"  Status: {opp.get('status')}\n"
                sam_context += f"  Expiration: {opp.get('expiration_date')}\n\n"

        if awarded_contracts:
            sam_context += "\nRecent Contract Awards:\n"
            for award in awarded_contracts:
                sam_context += f"- Title: {award.get('title')}\n"
                sam_context += f"  Amount: {award.get('award_amount')}\n"
                sam_context += f"  Awardee: {award.get('awardee')}\n\n"

        return sam_context
    except Exception as e:
        logger.error(f"Error getting SAM.gov context: {e}")
        return "\nNote: SAM.gov data currently unavailable\n"

def get_ai_response(query):
    if not OPENAI_API_KEY:
        logger.error("OPENAI_API_KEY is not set in environment variables")
        return "Error: OpenAI API key is not configured. Please set up your API key in Replit Secrets."

    if not client and not init_openai_client():
        logger.error("Failed to initialize OpenAI client")
        return "Error: Could not initialize OpenAI client. Please check your API key."

    try:
        # Process web content including SAM.gov data
        web_contents = process_web_content(query)

        # Format web content
        context = format_web_content(web_contents)

        messages = [
            {
                "role": "system",
                "content": """You are BidBot, an AI assistant specialized in government contracting with advanced web browsing capabilities. You can access and analyze web content in real-time, including SAM.gov solicitations.

✅ **Key Capabilities:**
1. Real-time Web Access: Browse and analyze web content dynamically
2. SAM.gov Integration: Direct access to contract opportunities
3. Information Synthesis: Combine data from multiple sources
4. Source Citation: Always cite sources and provide direct links

### **🚀 Enhanced Behaviors:**
1️⃣ For SAM.gov requests: 
   - Present recent solicitations with direct links
   - Include key details like agency, dates, and solicitation numbers
2️⃣ For web content:
   - Analyze and summarize relevant information
   - Provide direct quotes when applicable
3️⃣ Always maintain professional tone and accuracy
4️⃣ Cite sources and provide links for verification

Keep responses engaging and data-driven, focusing on practical value for government contractors."""
            }
        ]

        if context:
            messages.append({
                "role": "system",
                "content": f"Here is relevant web content to consider in your response:{context}"
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
        return f"Error connecting to OpenAI API: {error_msg}"

# Initialize the client when the module is imported
init_openai_client()