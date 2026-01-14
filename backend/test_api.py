import requests
import json

# Test the API endpoints
base_url = 'http://localhost:8000/api/v1'

# Test restaurant list endpoint
print('Testing restaurant list endpoint...')
response = requests.get(f'{base_url}/restaurants/restaurants/')
print(f'Status: {response.status_code}')
if response.status_code == 200:
    data = response.json()
    print(f'Found {len(data)} restaurants')
    if data and isinstance(data, list) and len(data) > 0:
        print(f'First restaurant: {data[0]["name"]}')
    else:
        print('No restaurants found or unexpected response format')
else:
    print(f'Error: {response.text}')

print()

# Test OTP endpoint
print('Testing OTP endpoint...')
response = requests.post(f'{base_url}/accounts/auth/send-otp/', json={'phone': '+1234567890'})
print(f'Status: {response.status_code}')
print(f'Response: {response.json()}')

print()

# Test user authentication (this will fail since we don't have a valid OTP)
print('Testing user authentication...')
response = requests.post(f'{base_url}/accounts/auth/verify-otp/', json={
    'phone': '+1234567890',
    'code': '123456',
    'name': 'Test User',
    'role': 'customer'
})
print(f'Status: {response.status_code}')
print(f'Response: {response.json()}')