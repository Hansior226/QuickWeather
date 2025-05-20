import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv


load_dotenv()
API_KEY = os.getenv("OPENWEATHER_KEY")
if not API_KEY:
    raise RuntimeError("Brak klucza OPENWEATHER_KEY w pliku .env")

BASE_URL = "https://api.openweathermap.org/data/2.5"
app = Flask(__name__)
CORS(app)

def reverse_geocode(lat, lon):
    try:
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {
            'lat': lat,
            'lon': lon,
            'format': 'jsonv2',
            'accept-language': 'pl'
        }
        headers = {
            'User-Agent': 'QuickWeather (QuickWeather@gmail.com)'
        }
        response = requests.get(url, params=params, headers=headers)
        if response.status_code == 200:
            data = response.json()
            address = data.get('address', {})
            return address.get('village') or address.get('town') or address.get('city') or address.get('municipality')
    except Exception as e:
        print(f"Reverse geocoding error: {e}")
    return None

@app.route('/api/weather', methods=['GET'])
def get_weather():
    city = request.args.get('city')
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    units = request.args.get('units', 'metric')

    if city:
        params = {'q': city, 'appid': API_KEY, 'units': units, 'lang': 'pl'}
    elif lat and lon:
        params = {'lat': lat, 'lon': lon, 'appid': API_KEY, 'units': units, 'lang': 'pl'}
    else:
        return jsonify({'error': 'Nie podano miasta ani współrzędnych'}), 400

    current = requests.get(f"{BASE_URL}/weather", params=params)
    if current.status_code == 401:
        return jsonify({'error': 'Nieprawidłowy klucz API (401 Unauthorized)'}), 401
    if current.status_code != 200:
        return jsonify({'error': f'Błąd pobierania danych: {current.status_code}'}), current.status_code
    current_data = current.json()


    location_name = current_data.get('name')
    if (not location_name or location_name.strip() == "") and lat and lon:
        location_name = reverse_geocode(lat, lon)

    forecast_resp = requests.get(f"{BASE_URL}/forecast", params=params)
    forecast_data = None
    if forecast_resp.status_code == 200:
        forecast_data = forecast_resp.json().get('list', [])

    return jsonify({
        'city': location_name,
        'current': {
            'temp': current_data['main']['temp'],
            'humidity': current_data['main']['humidity'],
            'pressure': current_data['main']['pressure'],
            'wind': current_data['wind']['speed'],
            'description': current_data['weather'][0]['description'],
            'icon': current_data['weather'][0]['icon'],
        },
        'forecast': forecast_data or [],
    })

if __name__ == '__main__':
    app.run(debug=True)
