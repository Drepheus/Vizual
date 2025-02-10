
import requests
import os
from datetime import datetime

def get_relevant_data(query):
    try:
        headers = {
            'X-Api-Key': os.environ.get('SAM_API_KEY'),
            'Accept': 'application/json'
        }
        
        params = {
            'q': query,
            'page': 0,
            'size': 10,
            'api_key': os.environ.get('SAM_API_KEY')
        }
        
        response = requests.get(
            'https://api.sam.gov/entity-information/v3/entities',
            headers=headers,
            params=params
        )
        
        if response.status_code == 200:
            data = response.json()
            return format_sam_data(data)
        else:
            print(f"SAM.gov API error: {response.status_code} - {response.text}")
            return {"error": f"SAM.gov API error: {response.status_code}"}
            
    except Exception as e:
        print(f"Error fetching SAM.gov data: {str(e)}")
        return {"error": f"Error fetching SAM.gov data: {str(e)}"}

def format_sam_data(data):
    formatted_data = []
    entities = data.get('entityData', [])
    
    for entity in entities:
        reg = entity.get('coreData', {}).get('entityRegistration', {})
        formatted_data.append({
            'entity_name': reg.get('legalBusinessName', 'N/A'),
            'duns': reg.get('ueiSAM', 'N/A'),
            'status': reg.get('registrationStatus', 'N/A'),
            'expiration_date': reg.get('registrationExpirationDate', 'N/A')
        })
    return formatted_data
