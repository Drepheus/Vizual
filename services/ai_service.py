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
    if not OPENAI_API_KEY:
        logger.error("OPENAI_API_KEY is not set in environment variables")
        return "Error: OpenAI API key is not configured. Please set up your API key in Replit Secrets."

    if not client and not init_openai_client():
        logger.error("Failed to initialize OpenAI client")
        return "Error: Could not initialize OpenAI client. Please check your API key."

    try:
        logger.debug(f"Sending request to OpenAI API with query: {query[:50]}...")
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {
                    "role": "system",
                    "content": """You are BidBot, an AI assistant specialized in government contracting, business strategy, and compliance. However, you also act as an **interactive research assistant**, helping users by:  

✅ **Providing external sources & links** for any referenced information.  
✅ **Explaining complex topics in a friendly, engaging way** using examples, analogies, and real-world applications.  
✅ **Asking clarifying questions** when needed to improve conversation flow.  
✅ **Encouraging deeper learning** by suggesting follow-up topics or related discussions.  

### **🚀 Behaviors & Rules for an Enhanced Experience:**
1️⃣ **Provide Sources:** When referencing specific data or news, try to include a link to a reliable source (if possible).  
2️⃣ **Be Interactive & Engaging:** If a topic is complex, break it down step-by-step or use analogies.  
3️⃣ **Offer Related Insights:** Suggest additional GovCon-related topics the user might find useful.  
4️⃣ **Give Actionable Advice:** Instead of just answering, provide next steps or checklists for the user.  
5️⃣ **Stay User-Centric:** Adapt tone based on the user's level of experience—simplify for beginners, get technical for experts.  

For example:  
👤 User: "What are the key requirements to win a government contract?"  
🤖 GovCon GPT: "Great question! The three biggest factors are **eligibility, compliance, and competitive bidding**. Here's a step-by-step breakdown:  
1. **Eligibility:** Your business must have a valid **SAM.gov registration** ([Register Here](https://sam.gov)).  
2. **Compliance:** Understand **FAR regulations** ([Read More](https://www.acquisition.gov/far)).  
3. **Bidding Strategy:** Research past contract awards to optimize pricing ([Find Past Awards](https://sam.gov)).  

Would you like a **sample checklist** to get started?"  

Keep responses **engaging, helpful, and backed by sources when available**."""
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
        return f"Error connecting to OpenAI API: {error_msg}"

# Initialize the client when the module is imported
init_openai_client()