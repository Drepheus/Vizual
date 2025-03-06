import requests
import os
import logging
from datetime import datetime, timedelta
from time import sleep
import json
from functools import lru_cache
from urllib.parse import quote

logger = logging.getLogger(__name__)

# Cache responses for 5 minutes to avoid hitting rate limits
@lru_cache(maxsize=128)
def _cached_sam_request(endpoint, query_params_str):
    """Make a cached request to SAM.gov API"""
    base_url = 'https://api.sam.gov/opportunities/v2'
    api_key = os.environ.get('SAM_API_KEY')

    if not api_key:
        logger.error("SAM_API_KEY environment variable is not set")
        return None

    headers = {
        'X-Api-Key': api_key,
        'Accept': 'application/json'
    }

    # Convert query_params_str back to dict
    params = json.loads(query_params_str)
    logger.debug(f"Making SAM.gov API request to {endpoint} with params: {params}")

    # Implement exponential backoff
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = requests.get(
                f'{base_url}/{endpoint}',
                headers=headers,
                params=params,
                timeout=30  # Increased timeout
            )

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:  # Rate limit hit
                wait_time = min(30, (2 ** attempt))  # Exponential backoff, max 30 seconds
                logger.warning(f"Rate limit hit, waiting {wait_time} seconds before retry {attempt + 1}/{max_retries}")
                sleep(wait_time)
                continue
            else:
                logger.error(f"SAM.gov API error: {response.status_code} - {response.text}")
                return None

        except requests.exceptions.RequestException as e:
            logger.error(f"Error making SAM.gov request: {str(e)}")
            if attempt < max_retries - 1:  # Don't sleep on the last attempt
                sleep(min(30, (2 ** attempt)))
            continue

    logger.error("Max retries exceeded for SAM.gov API request")
    return None

def format_date_for_sam(date_obj):
    """Format date in MM/dd/yyyy format as required by SAM.gov API"""
    return date_obj.strftime("%m/%d/%Y")

def get_relevant_data(query=None):
    """Get relevant contract data from SAM.gov"""
    try:
        today = datetime.now()
        past = today - timedelta(days=7)  # Reduced from 30 to 7 days to get more recent data

        # Format dates in MM/dd/yyyy as required by SAM API
        formatted_past = past.strftime("%m/%d/%Y")
        formatted_today = today.strftime("%m/%d/%Y")

        params = {
            'postedFrom': formatted_past,
            'postedTo': formatted_today,
            'limit': 5,
            'isActive': 'true'
        }

        if query:
            # Clean and format the query
            search_terms = query.lower()
            for term in ['fetch', 'get', 'find', 'search for', 'solicitation for']:
                search_terms = search_terms.replace(term, '')
            search_terms = search_terms.strip()
            if search_terms:
                params['keywords'] = quote(search_terms)

        # Convert params to string for caching
        params_str = json.dumps(params, sort_keys=True)

        data = _cached_sam_request('search', params_str)
        if data and 'opportunitiesData' in data:
            return format_sam_data(data)

        return []

    except Exception as e:
        logger.error(f"Error fetching SAM.gov data: {str(e)}")
        return []

def get_awarded_contracts():
    try:
        today = datetime.now()
        past = today - timedelta(days=30)

        params = {
            'api_key': os.environ.get('SAM_API_KEY'),
            'postedFrom': format_date_for_sam(past),
            'postedTo': format_date_for_sam(today),
            'limit': 3,
            'awardStatus': 'awarded'
        }

        # Convert params to string for caching
        params_str = json.dumps(params, sort_keys=True)

        data = _cached_sam_request('search', params_str)
        if data:
            return format_awards_data(data)
        return []

    except Exception as e:
        logger.error(f"Error fetching SAM.gov awards: {str(e)}")
        return []

def format_sam_data(data):
    """Format SAM.gov data for display"""
    formatted_data = []
    opportunities = data.get('opportunitiesData', [])

    if not opportunities or not isinstance(opportunities, list):
        return []

    for opp in opportunities:
        notice_id = opp.get('noticeId', '')
        if not notice_id:
            continue

        formatted_data.append({
            'title': opp.get('title', 'N/A'),
            'agency': opp.get('organizationName', 'N/A'),
            'solicitation_number': opp.get('solicitationNumber', 'N/A'),
            'response_deadline': opp.get('responseDeadLine', 'N/A'),
            'status': opp.get('status', 'N/A'),
            'description': opp.get('description', 'N/A')[:500] + '...' if opp.get('description') else 'N/A',
            'url': f"https://sam.gov/opp/{notice_id}/view"
        })

    return formatted_data

def format_awards_data(data):
    formatted_data = []
    awards = data.get('opportunitiesData', [])

    if not awards or not isinstance(awards, list):
        return []

    for award in awards:
        notice_id = award.get('noticeId', '')
        if not notice_id:
            continue

        formatted_data.append({
            'title': award.get('title', 'N/A'),
            'solicitation_number': award.get('solicitationNumber', 'N/A'),
            'award_amount': award.get('award', {}).get('amount', 'N/A'),
            'award_date': award.get('award', {}).get('date', 'N/A'),
            'awardee': award.get('award', {}).get('awardee', 'N/A'),
            'url': f"https://sam.gov/opp/{notice_id}/view"
        })
    return formatted_data