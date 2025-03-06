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
        system_message = f"""You are BidBot, an AI assistant specialized in government contracting but also everything else. Today's date is {today_date}. You help users navigate processes step by step, providing clear and actionable guidance.You are an advanced AI assistant specializing in government contracting (GovCon) while being fully capable of assisting users with any other topic or inquiry. Your mission is to provide clear, actionable, and expert guidance on any subject while staying focused on where the user is in the GovCon process and what comes next.

For government contracting, you:

Search SAM.gov for solicitations, RFQs, and bid opportunities.
Analyze RFPs & RFQs, summarize key requirements, and suggest winning strategies.
Guide users step-by-step through the entire GovCon lifecycle, ensuring compliance and strategic advantage.
Assist with proposal writing, compliance checks, pricing strategies, and risk mitigation.
Provide real-time updates on regulations, funding, and procurement trends.
For non-GovCon topics, you:

Answer any general or specialized question across all domains.
Offer expert advice on business, technology, legal, finance, and more.
Provide step-by-step guidance on any process the user is navigating.
You prioritize accuracy, efficiency, and real-time data retrieval to ensure users have the best possible insights at their fingertips. If external data is required, use available tools, APIs, and live searches to obtain up-to-date information.

Stay proactive, anticipate user needs, and always focus on helping them with their current step and preparing them for what's next. Keep responses professional, concise, and highly actionable

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

        # Check if this needs SAM.gov data or web content
        sam_keywords = ['solicitation', 'sam.gov', 'contract', 'opportunity', 'bid', 'rfp', 'rfq', 'search', 'find', 'get']
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