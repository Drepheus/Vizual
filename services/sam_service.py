import requests
import os
from datetime import datetime, timedelta
import logging
from time import sleep
import json
from functools import lru_cache

logger = logging.getLogger(__name__)

# Cache responses for 5 minutes to avoid hitting rate limits
@lru_cache(maxsize=128)
def _cached_sam_request(endpoint, query_params_str):
    """Make a cached request to SAM.gov API"""
    base_url = 'https://api.sam.gov/opportunities/v2'
    headers = {
        'X-Api-Key': os.environ.get('SAM_API_KEY'),
        'Accept': 'application/json'
    }

    # Convert query_params_str back to dict
    params = json.loads(query_params_str)

    # Implement exponential backoff
    max_retries = 5
    for attempt in range(max_retries):
        try:
            response = requests.get(
                f'{base_url}/{endpoint}',
                headers=headers,
                params=params,
                timeout=10
            )

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                wait_time = min(30, (2 ** attempt))  # Exponential backoff, max 30 seconds
                logger.warning(f"Rate limit hit, waiting {wait_time} seconds before retry {attempt + 1}/{max_retries}")
                sleep(wait_time)
                continue
            else:
                logger.error(f"SAM.gov API error: {response.status_code} - {response.text}")
                return None

        except requests.Timeout:
            logger.error("SAM.gov API request timed out")
            return None
        except Exception as e:
            logger.error(f"Error making SAM.gov request: {str(e)}")
            return None

    logger.error("Max retries exceeded for SAM.gov API request")
    return None

def get_relevant_data(query):
    try:
        today = datetime.now()
        future = today + timedelta(days=30)

        params = {
            'api_key': os.environ.get('SAM_API_KEY'),
            'postedFrom': today.strftime("%Y-%m-%d"),
            'postedTo': future.strftime("%Y-%m-%d"),
            'limit': 3,
            'isActive': 'true'
        }

        if query:
            params['q'] = query

        # Convert params to string for caching
        params_str = json.dumps(params, sort_keys=True)

        data = _cached_sam_request('search', params_str)
        if data:
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
            'postedFrom': past.strftime("%Y-%m-%d"),
            'postedTo': today.strftime("%Y-%m-%d"),
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
    formatted_data = []
    opportunities = data.get('opportunitiesData', [])

    if not opportunities or not isinstance(opportunities, list):
        return []

    for opp in opportunities:
        notice_id = opp.get('noticeId', '')
        if not notice_id:
            continue

        formatted_data.append({
            'entity_name': opp.get('title', 'N/A'),
            'duns': opp.get('solicitationNumber', 'N/A'),
            'status': opp.get('status', 'N/A'),
            'expiration_date': opp.get('responseDeadLine', 'N/A'),
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