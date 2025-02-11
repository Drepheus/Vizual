import requests
import os
from datetime import datetime, timedelta
import logging
from time import sleep

logger = logging.getLogger(__name__)

def get_relevant_data(query):
    try:
        headers = {
            'X-Api-Key': os.environ.get('SAM_API_KEY'),
            'Accept': 'application/json'
        }

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

        # Add retry logic for rate limits
        max_retries = 3
        for attempt in range(max_retries):
            response = requests.get(
                'https://api.sam.gov/opportunities/v2/search',
                headers=headers,
                params=params,
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                return format_sam_data(data)
            elif response.status_code == 429:  # Rate limit
                if attempt < max_retries - 1:
                    sleep(2)  # Wait before retrying
                    continue
            logger.error(f"SAM.gov API error: {response.status_code} - {response.text}")
            return []

    except requests.Timeout:
        logger.error("SAM.gov API request timed out")
        return []
    except Exception as e:
        logger.error(f"Error fetching SAM.gov data: {str(e)}")
        return []

def get_awarded_contracts():
    try:
        headers = {
            'X-Api-Key': os.environ.get('SAM_API_KEY'),
            'Accept': 'application/json'
        }

        today = datetime.now()
        past = today - timedelta(days=30)

        params = {
            'api_key': os.environ.get('SAM_API_KEY'),
            'postedFrom': past.strftime("%Y-%m-%d"),
            'postedTo': today.strftime("%Y-%m-%d"),
            'limit': 3,
            'awardStatus': 'awarded'
        }

        # Add retry logic for rate limits
        max_retries = 3
        for attempt in range(max_retries):
            response = requests.get(
                'https://api.sam.gov/opportunities/v2/search',
                headers=headers,
                params=params,
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                return format_awards_data(data)
            elif response.status_code == 429:  # Rate limit
                if attempt < max_retries - 1:
                    sleep(2)  # Wait before retrying
                    continue
            logger.error(f"SAM.gov Awards API error: {response.status_code} - {response.text}")
            return []

    except requests.Timeout:
        logger.error("SAM.gov Awards API request timed out")
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
            'url': f"https://sam.gov/opp/{notice_id}/view"  # Fixed URL format
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
            'url': f"https://sam.gov/opp/{notice_id}/view"  # Fixed URL format
        })
    return formatted_data