import os
import logging
from openai import OpenAI
import json
from services.web_service import process_web_content

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
    keywords = {
        "sam": "SAM.gov is the official site for registering to do business with the federal government.",
        "registration": "To bid on government contracts, businesses must register in SAM.gov and obtain a DUNS number.",
        "duns": "A DUNS number is a unique nine-digit identifier for businesses, required for federal government contracting.",
        "contract": "Government contracts are agreements between federal agencies and private businesses for goods or services.",
        "bid": "Government contract bids must be submitted according to the specific requirements in the solicitation.",
    }

    response_parts = []
    query_lower = query.lower()

    for keyword, info in keywords.items():
        if keyword in query_lower:
            response_parts.append(info)

    if not response_parts:
        return "I can provide basic information about government contracting. Please ask about specific topics like SAM registration, DUNS numbers, or bidding processes."

    return " ".join(response_parts)

def get_ai_response(query):
    if not OPENAI_API_KEY:
        logger.error("OPENAI_API_KEY is not set in environment variables")
        return "Error: OpenAI API key is not configured. Please set up your API key in Replit Secrets."

    if not client and not init_openai_client():
        logger.error("Failed to initialize OpenAI client")
        return "Error: Could not initialize OpenAI client. Please check your API key."

    try:
        # Process any web content in the query
        web_contents = process_web_content(query)

        messages = [
            {
                "role": "system",
                "content": """You are BidBot, an AI assistant specialized in government contracting, business strategy, and compliance. You can now browse the internet to provide up-to-date information.

✅ **Key Capabilities:**
1. Web Browsing: You can read and analyze web content when URLs are provided
2. Real-time Information: You can access current information from websites
3. Source Citation: You always cite your sources when using external information

### **🚀 Enhanced Behaviors:**
1️⃣ When URLs are provided, analyze their content and incorporate relevant insights
2️⃣ Always mention when you're using information from provided web sources
3️⃣ If no URLs are provided, respond based on your core knowledge
4️⃣ Maintain your helpful, professional tone while providing accurate information

Keep responses engaging, well-structured, and backed by sources when available."""
            }
        ]

        # Add web content context if available
        if web_contents:
            web_context = "\n\nWeb Content References:\n"
            for content in web_contents:
                web_context += f"\nFrom {content['url']}:\n{content['content'][:1000]}...\n"

            messages.append({
                "role": "system",
                "content": f"Here is relevant web content to consider in your response:{web_context}"
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