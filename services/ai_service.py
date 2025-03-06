import os
import logging
from openai import OpenAI
from datetime import datetime
from services.web_service import process_web_content

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables (use python-dotenv if necessary)
from dotenv import load_dotenv
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SAM_API_KEY = os.getenv("SAM_API_KEY")
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
        Your responses should focus on accuracy, efficiency, and real-time data retrieval."""

        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": query}
        ]

        sam_keywords = ['solicitation', 'sam.gov', 'contract', 'opportunity', 'bid', 'rfp', 'rfq']
        needs_data = any(keyword in query.lower() for keyword in sam_keywords) or 'http' in query.lower()

        if needs_data:
            logger.debug("Processing data retrieval query")
            web_results = process_web_content(query)

            if web_results:
                data_content = "\n\nLIVE DATA RETRIEVED:\n"
                for result in web_results:
                    source_type = result.get('source', 'Web')
                    if source_type == 'SAM.gov':
                        data_content += f"\n{result['content']}\n"
                    else:
                        data_content += f"\nSource ({source_type}): {result['url']}\n"
                        data_content += f"Content Summary:\n{result['content'][:1000]}...\n"

                messages.append({"role": "system", "content": f"Here is the live data that was just retrieved: {data_content}\nPlease analyze this data and provide insights based on the user's query."})

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



