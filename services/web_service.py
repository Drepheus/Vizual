import logging
import re
import trafilatura
import requests
from urllib.parse import urlparse, quote
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
import os

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
        headers = {
            'X-Api-Key': os.environ.get('SAM_API_KEY'),
            'Accept': 'application/json'
        }

        today = datetime.now()
        past = today - timedelta(days=30)
        future = today + timedelta(days=30)

        params = {
            'page': 0,
            'size': 3,  # Get last 3 entries
            'api_key': os.environ.get('SAM_API_KEY'),
            'postedFrom': past.strftime("%Y-%m-%d"),
            'postedTo': future.strftime("%Y-%m-%d"),
            'limit': 3
        }

        if query:
            params['keywords'] = quote(query)

        response = requests.get(
            'https://api.sam.gov/opportunities/v2/search',
            headers=headers,
            params=params
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
        sam_keywords = ['solicitation', 'sam.gov', 'contract', 'opportunity', 'bid']
        if any(keyword in query.lower() for keyword in sam_keywords):
            solicitations = get_sam_solicitations(query)
            if solicitations:
                web_contents = []
                for sol in solicitations:
                    content = (
                        f"Title: {sol['title']}\n"
                        f"Agency: {sol['agency']}\n"
                        f"Solicitation Number: {sol['solicitation_number']}\n"
                        f"Posted Date: {sol['posted_date']}\n"
                        f"Response Due: {sol['due_date']}\n"
                        f"View on SAM.gov: {sol['url']}"
                    )
                    web_contents.append({
                        'url': sol['url'],
                        'content': content
                    })
                return web_contents

        # Process regular URLs
        urls = extract_urls(query)
        web_contents = []

        for url in urls:
            if is_valid_url(url):
                content = get_webpage_content(url)
                if content:
                    web_contents.append({
                        'url': url,
                        'content': content
                    })

        return web_contents
    except Exception as e:
        logger.error(f"Error processing web content: {str(e)}")
        return []