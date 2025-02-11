import logging
import re
import trafilatura
from urllib.parse import urlparse

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

def get_webpage_content(url):
    """Fetch and extract main content from a webpage"""
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded is None:
            logger.error(f"Failed to download content from {url}")
            return None

        content = trafilatura.extract(downloaded, include_links=True, include_images=True)
        if content is None:
            logger.error(f"Failed to extract content from {url}")
            return None

        return content
    except Exception as e:
        logger.error(f"Error fetching webpage content: {str(e)}")
        return None

def process_web_content(query):
    """Process query for web content and return relevant information"""
    try:
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