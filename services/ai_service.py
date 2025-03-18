import os
import logging
from openai import OpenAI
from datetime import datetime
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

def get_ai_response(query):
    if not OPENAI_API_KEY:
        logger.error("OPENAI_API_KEY is not set in environment variables")
        return "Error: OpenAI API key is not configured. Please contact support."

    if not client and not init_openai_client():
        logger.error("Failed to initialize OpenAI client")
        return "Error: Could not initialize AI service. Please try again later."

    try:
        today_date = datetime.today().strftime('%Y-%m-%d')
        system_message = f"""You are Omi, an AI assistant that specializes in everything. Today's date is {today_date}. You help users navigate processes step by step, providing clear and actionable guidance. Your mission is to provide clear, actionable, and expert guidance on any subject.

        - Instant AI-powered image generation  
        - Voice interaction & speech synthesis  
        - Contextual understanding & simplification  
        - Guidance & automation for productivity  
        - Advanced conversational intelligence  
        - Real-time execution & multimodal processing  
        - Adaptive intelligence that adjusts to user needs  
        - Recursive learning for continuous improvement.

        End messages with a suggestion for next queriy that is related

For government contracting, you:
• Search SAM.gov for solicitations, RFQs, and bid opportunities.
• Analyze RFPs & RFQs, summarize key requirements, and suggest winning strategies.
• Guide users step-by-step through the entire GovCon lifecycle, ensuring compliance and strategic advantage.
• Assist with proposal writing, compliance checks, pricing strategies, and risk mitigation.
• Provide real-time updates on regulations, funding, and procurement trends.

For non-GovCon topics, you:
• Answer any general or specialized question across all domains.
• Offer expert advice on business, technology, legal, finance, and more.
• Provide step-by-step guidance on any process the user is navigating.

Keep responses professional, concise, and immediately actionable."""

        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": query}
        ]

        # Enhanced real-time data integration
        data_keywords = ['current', 'latest', 'recent', 'today', 'now', 'live', 'real-time', 'update', 'news']
        sam_keywords = ['solicitation', 'sam.gov', 'contract', 'opportunity', 'bid', 'rfp', 'rfq', 'search', 'find', 'get']
        
        needs_data = (
            any(keyword in query.lower() for keyword in data_keywords + sam_keywords) or 
            'http' in query.lower()
        )

        if needs_data:
            logger.debug("Processing data retrieval query")
            web_results = process_web_content(query)
            if web_results:
                data_content = "\n\nLIVE DATA RETRIEVED:\n"
                for result in web_results:
                    source_type = result.get('source', 'Web')
                    timestamp = result.get('timestamp', '')
                    if source_type == 'SAM.gov':
                        data_content += f"\n[{timestamp}] SAM.gov Data:\n{result['content']}\n"
                    else:
                        data_content += f"\n[{timestamp}] Source ({source_type}): {result['url']}\n"
                        if 'metadata' in result:
                            metadata = result['metadata']
                            data_content += f"Title: {metadata.get('title', 'N/A')}\n"
                            data_content += f"Date: {metadata.get('date', 'N/A')}\n"
                        data_content += f"Content Summary:\n{result['content'][:1500]}...\n"

                messages.append({
                    "role": "system", 
                    "content": (
                        f"Here is the real-time data that was just retrieved (as of {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}):"
                        f"{data_content}\n"
                        "Please analyze this current data and provide insights based on the user's query. "
                        "Make sure to reference the source and timestamp when citing information."
                    )
                })

        logger.debug(f"Sending request to OpenAI API with query: {query[:50]}...")
        logger.debug("Using model: gpt-4o-2024-11-20")

        response = client.chat.completions.create(
            model="gpt-4o",
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
