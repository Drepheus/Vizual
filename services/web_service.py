import logging
from services.sam_service import get_relevant_data
from urllib.parse import urlparse, quote
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
import os
import re
import trafilatura
import requests

logger = logging.getLogger(__name__)

def is_valid_url(url):
    """Check if the provided string is a valid URL"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except Exception as e:
        logger.error(f"Error validating URL: {str(e)}")
        return False

def extract_urls(text):
    """Extract URLs from text using regex"""
    try:
        url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        return re.findall(url_pattern, text)
    except Exception as e:
        logger.error(f"Error extracting URLs: {str(e)}")
        return []

def get_sam_solicitations(query=None):
    """Fetch recent solicitations from SAM.gov API"""
    try:
        # Make sure we have the API key
        api_key = os.environ.get('SAM_API_KEY')
        if not api_key:
            logger.error("SAM_API_KEY environment variable is not set")
            return []
            
        headers = {
            'X-Api-Key': api_key,
            'Accept': 'application/json'
        }

        today = datetime.now()
        future = today + timedelta(days=30)

        # Format dates in MM/dd/yyyy as required by SAM API
        formatted_today = today.strftime("%m/%d/%Y")
        formatted_future = future.strftime("%m/%d/%Y")

        params = {
            'api_key': api_key,
            'postedFrom': formatted_today,
            'postedTo': formatted_future,
            'limit': 5,  # Increased limit
            'isActive': 'true'
        }

        # Clean and format the query for the search
        if query:
            # Extract only the relevant search terms
            search_terms = query.lower()
            for term in ['fetch', 'get', 'find', 'search for', 'solicitation for', 'contract for']:
                search_terms = search_terms.replace(term, '')
            search_terms = search_terms.strip()
            params['keywords'] = quote(search_terms)

        # Log the attempt with query
        logger.info(f"Querying SAM.gov with search terms: {search_terms if query else 'None'}")
        
        response = requests.get(
            'https://api.sam.gov/opportunities/v2/search',
            headers=headers,
            params=params,
            timeout=15  # Adding a timeout
        )

        if response.status_code == 200:
            data = response.json()
            opportunities = data.get('opportunitiesData', [])

            solicitations = []
            for opp in opportunities[:3]:  # Only return top 3
                notice_id = opp.get('noticeId', '')
                if not notice_id:
                    continue

                # Construct the proper SAM.gov opportunity URL
                opportunity_url = f"https://sam.gov/opp/{notice_id}/view"

                solicitation = {
                    'title': opp.get('title', 'N/A'),
                    'agency': opp.get('organizationName', 'N/A'),
                    'posted_date': opp.get('postedDate', 'N/A'),
                    'due_date': opp.get('responseDeadLine', 'N/A'),
                    'solicitation_number': opp.get('solicitationNumber', 'N/A'),
                    'url': opportunity_url
                }
                solicitations.append(solicitation)

            return solicitations
        else:
            logger.error(f"SAM.gov API error: {response.status_code} - {response.text}")
            return []

    except Exception as e:
        logger.error(f"Error fetching SAM.gov solicitations: {str(e)}")
        return []

def get_webpage_content(url):
    """Fetch and extract main content from a webpage"""
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded is None:
            return None

        content = trafilatura.extract(downloaded, include_links=True, include_images=True)
        if content is None:
            return None

        return content
    except Exception as e:
        logger.error(f"Error fetching webpage content: {str(e)}")
        return None

def process_web_content(query):
    """Process query for web content and return relevant information"""
    try:
        # Check for SAM.gov related queries
        sam_keywords = ['solicitation', 'sam.gov', 'contract', 'opportunity', 'bid', 'rfp', 'rfq', 
                       'proposal', 'federal', 'government contract']

        is_sam_query = any(keyword in query.lower() for keyword in sam_keywords)

        if is_sam_query:
            logger.info(f"Processing SAM.gov query: {query}")
            opportunities = get_relevant_data(query)

            if opportunities:
                web_contents = []
                for opp in opportunities:
                    content = (
                        f"Title: {opp['title']}\n"
                        f"Agency: {opp['agency']}\n"
                        f"Solicitation Number: {opp['solicitation_number']}\n"
                        f"Response Deadline: {opp['response_deadline']}\n"
                        f"Status: {opp['status']}\n"
                        f"Description: {opp['description']}\n"
                        f"View on SAM.gov: {opp['url']}"
                    )
                    web_contents.append({
                        'url': opp['url'],
                        'content': content
                    })

                logger.info(f"Found {len(web_contents)} opportunities from SAM.gov")
                return web_contents
            else:
                logger.warning(f"No opportunities found for query: {query}")
                return []

        return []

    except Exception as e:
        logger.error(f"Error processing web content: {str(e)}")
        return []