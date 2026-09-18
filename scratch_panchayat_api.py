import os

panchayat_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/backend/app/api/v1/panchayat.py'

with open(panchayat_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'from app.services.demo_data import VILLAGE_NAME' not in content:
    content = content.replace('from app.schemas.panchayat import HealthPulseResponse, ChartData, HealthTrend, WelfareOpportunity, FacilityStatus', 'from app.schemas.panchayat import HealthPulseResponse, ChartData, HealthTrend, WelfareOpportunity, FacilityStatus\nfrom app.services.demo_data import VILLAGE_NAME')
    
    # Replace "Navjeevan Gram" with VILLAGE_NAME in the endpoint
    content = content.replace('village="Navjeevan Gram",', 'village=VILLAGE_NAME,')

    with open(panchayat_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated Panchayat backend to use centralized demo data")
