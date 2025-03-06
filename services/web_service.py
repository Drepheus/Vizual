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

                        opportunity_url = f"https://sam.gov/opportunity/{notice_id}"

                        solicitations.append({
                            'title': opp.get('title', 'No Title'),
                            'agency': opp.get('department', 'Unknown Agency'),
                            'solicitation_number': opp.get('solicitationNumber', 'N/A'),
                            'posted_date': opp.get('postedDate', 'Unknown'),
                            'due_date': opp.get('responseDeadLine', 'Unknown'),
                            'description': opp.get('description', 'No description available'),
                            'url': opportunity_url
                        })

                    logger.info(f"Found {len(solicitations)} solicitations from SAM.gov")
                    return solicitations
                else:
                    logger.error(f"SAM.gov API request failed with status code: {response.status_code}")
                    logger.error(f"Response: {response.text}")
                    return []

            except Exception as e:
                logger.error(f"Error fetching SAM.gov solicitations: {str(e)}")
                return []