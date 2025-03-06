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

import logging
import re
import trafilature
import requests
from urllib.parse import urlparse, quote
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
import os
from time import sleep
from functools import lru_cache
from services.sam_service import get_sam_solicitations

logger = logging.getLogger(__name__)

def is_valid_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc]) and result.scheme in ['http', 'https']
    except Exception as e:
        logger.error(f"Error validating URL: {str(e)}")
        return False

@lru_cache(maxsize=100)
def get_webpage_content(url, max_retries=3):
    try:
        for attempt in range(max_retries):
            try:
                downloaded = trafilature.fetch_url(url)
                if downloaded is None:
                    logger.warning(f"Failed to download content from {url}")
                    continue

                content = trafilature.extract(
                    downloaded,
                    include_links=True,
                    include_images=True,
                    include_tables=True,
                    output_format='text',
                    with_metadata=True
                )

                if content:
                    metadata = {}
                    if isinstance(content, dict):
                        metadata = {
                            'title': content.get('title', ''),
                            'author': content.get('author', ''),
                            'date': content.get('date', ''),
                            'description': content.get('description', ''),
                            'text': content.get('text', content)
                        }
                        content = metadata['text']

                    logger.info(f"Successfully extracted content from {url}")
                    return {
                        'content': content,
                        'metadata': metadata,
                        'url': url,
                        'timestamp': datetime.now().isoformat()
                    }

                if attempt < max_retries - 1:
                    sleep(2 ** attempt)
                continue

            except Exception as e:
                logger.error(f"Error during attempt {attempt + 1} for {url}: {str(e)}")
                if attempt < max_retries - 1:
                    sleep(2 ** attempt)
                continue

        return None

    except Exception as e:
        logger.error(f"Error processing webpage {url}: {str(e)}")
        return None

def extract_urls(text):
    try:
        url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        urls = re.findall(url_pattern, text)
        return [url for url in urls if is_valid_url(url)]
    except Exception as e:
        logger.error(f"Error extracting URLs: {str(e)}")
        return []

def process_web_content(query):
    try:
        sam_keywords = ['solicitation', 'sam.gov', 'contract', 'opportunity', 'bid', 'rfp', 'rfq']
        is_sam_query = any(keyword in query.lower() for keyword in sam_keywords)

        web_contents = []

        if is_sam_query:
            logger.info(f"Processing SAM.gov query: {query}")
            solicitations = get_sam_solicitations(query)

            if solicitations:
                for sol in solicitations:
                    content = (
                        f"SAM.GOV SOLICITATION:\n"
                        f"Title: {sol['title']}\n"
                        f"Agency: {sol['agency']}\n"
                        f"Solicitation Number: {sol['solicitation_number']}\n"
                        f"Posted Date: {sol['posted_date']}\n"
                        f"Response Deadline: {sol['due_date']}\n"
                        f"Description: {sol['description'] if 'description' in sol else 'N/A'}\n"
                        f"View on SAM.gov: {sol['url']}"
                    )
                    web_contents.append({
                        'url': sol['url'],
                        'content': content,
                        'source': 'SAM.gov',
                        'timestamp': datetime.now().isoformat()
                    })
                logger.info(f"Found {len(web_contents)} solicitations from SAM.gov")
            else:
                logger.warning("No SAM.gov solicitations found")

        urls = extract_urls(query)
        for url in urls:
            result = get_webpage_content(url)
            if result:
                web_contents.append({
                    'url': url,
                    'content': result['content'],
                    'metadata': result.get('metadata', {}),
                    'source': 'Web Scraping',
                    'timestamp': result['timestamp']
                })
                logger.info(f"Successfully scraped content from {url}")

        if web_contents:
            logger.info(f"Successfully processed {len(web_contents)} sources")
            return web_contents
        else:
            logger.warning(f"No content found for query: {query}")
            return []

    except Exception as e:
        logger.error(f"Error processing web content: {str(e)}")
        return []

def get_sam_solicitations(query=None):
    try:
        api_key = os.getenv('SAM_API_KEY')
        if not api_key:
            logger.error("SAM_API_KEY environment variable is not set")
            return []

        headers = {
            'X-Api-Key': api_key,
            'Accept': 'application/json'
        }

        today = datetime.now()
        future = today + timedelta(days=30)

        formatted_today = today.strftime("%m/%d/%Y")
        formatted_future = future.strftime("%m/%d/%Y")

        params = {
            'api_key': api_key,
            'postedFrom': formatted_today,
            'postedTo': formatted_future,
            'limit': 5,
            'isActive': 'true'
        }

        if query:
            search_terms = query.lower()
            for term in ['fetch', 'get', 'find', 'search for', 'solicitation for', 'contract for']:
                search_terms = search_terms.replace(term, '')
            search_terms = search_terms.strip()
            params['keywords'] = quote(search_terms)

        response = requests.get(
            'https://api.sam.gov/opportunities/v2/search',
            headers=headers,
            params=params,
            timeout=15
        )

        if response.status_code == 200:
            data = response.json()
            opportunities = data.get('opportunitiesData', [])

            solicitations = []
            for opp in opportunities[:3]:
                notice_id = opp.get('noticeId', '')
                if not notice_id:
                    continue

                opportunity_url = f"https://sam
