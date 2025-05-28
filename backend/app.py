import os
import time
import json
import math
import datetime
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv

# Ładowanie zmiennych środowiskowych
load_dotenv()
API_KEY = os.getenv("OPENWEATHER_KEY")
if not API_KEY:
    raise RuntimeError("Brak klucza OPENWEATHER_KEY w pliku .env")

BASE_URL = "https://api.openweathermap.org/data/2.5"
app = Flask(__name__)
CORS(app)

# Inicjalizacja
app.start_time = time.time()

# Prosty cache w pamięci
weather_cache = {}
CACHE_DURATION = 600  # 10 minut


# Decorator do cache'owania
def cache_response(duration=CACHE_DURATION):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            cache_key = f"{f.__name__}:{request.url}"

            if cache_key in weather_cache:
                cached_data, timestamp = weather_cache[cache_key]
                if time.time() - timestamp < duration:
                    return cached_data

            result = f(*args, **kwargs)
            weather_cache[cache_key] = (result, time.time())

            return result

        return wrapper

    return decorator


# Middleware do logowania
@app.before_request
def log_request():
    app.logger.info(f"{request.method} {request.url} - {request.remote_addr}")


@app.after_request
def log_response(response):
    app.logger.info(f"Response: {response.status_code}")
    return response


def reverse_geocode(lat, lon):
    """Odwrotne geokodowanie współrzędnych na nazwę miejscowości"""
    try:
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {"lat": lat, "lon": lon, "format": "jsonv2", "accept-language": "pl"}
        headers = {"User-Agent": "QuickWeather (QuickWeather@gmail.com)"}
        response = requests.get(url, params=params, headers=headers)
        if response.status_code == 200:
            data = response.json()
            address = data.get("address", {})
            return (
                address.get("village")
                or address.get("town")
                or address.get("city")
                or address.get("municipality")
            )
    except Exception as e:
        print(f"Reverse geocoding error: {e}")
    return None


def get_coordinates_for_city(city):
    """Pobiera współrzędne dla podanego miasta"""
    geocode_params = {"q": city, "appid": API_KEY, "limit": 1}
    geocode_resp = requests.get(
        f"http://api.openweathermap.org/geo/1.0/direct", params=geocode_params
    )
    if geocode_resp.status_code == 200:
        geo_data = geocode_resp.json()
        if geo_data:
            return geo_data[0]["lat"], geo_data[0]["lon"]
    return None, None


def get_uv_recommendation(uv_index):
    """Zwraca rekomendacje na podstawie indeksu UV"""
    if uv_index < 3:
        return "Można przebywać na słońcu bez ochrony"
    elif uv_index < 6:
        return "Zalecana ochrona przeciwsłoneczna"
    elif uv_index < 8:
        return "Konieczna ochrona przeciwsłoneczna"
    else:
        return "Unikaj przebywania na słońcu"


# GŁÓWNY ENDPOINT POGODOWY
@app.route("/api/weather", methods=["GET"])
@cache_response(300)  # 5 minut cache
def get_weather():
    """Główny endpoint do pobierania danych pogodowych"""
    city = request.args.get("city")
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    units = request.args.get("units", "metric")

    if city:
        params = {"q": city, "appid": API_KEY, "units": units, "lang": "pl"}
    elif lat and lon:
        params = {
            "lat": lat,
            "lon": lon,
            "appid": API_KEY,
            "units": units,
            "lang": "pl",
        }
    else:
        return jsonify({"error": "Nie podano miasta ani współrzędnych"}), 400

    try:
        # Pobierz aktualne dane pogodowe
        current = requests.get(f"{BASE_URL}/weather", params=params, timeout=10)
        if current.status_code == 401:
            return jsonify({"error": "Nieprawidłowy klucz API (401 Unauthorized)"}), 401
        if current.status_code != 200:
            return (
                jsonify({"error": f"Błąd pobierania danych: {current.status_code}"}),
                current.status_code,
            )

        current_data = current.json()

        # Określ nazwę lokalizacji
        location_name = current_data.get("name")
        if (not location_name or location_name.strip() == "") and lat and lon:
            location_name = reverse_geocode(lat, lon)

        # Pobierz prognozę
        forecast_resp = requests.get(f"{BASE_URL}/forecast", params=params, timeout=10)
        forecast_data = []
        if forecast_resp.status_code == 200:
            forecast_data = forecast_resp.json().get("list", [])

        # Dodatkowe dane z current_data
        sunrise = datetime.datetime.fromtimestamp(
            current_data["sys"]["sunrise"]
        ).strftime("%H:%M")
        sunset = datetime.datetime.fromtimestamp(
            current_data["sys"]["sunset"]
        ).strftime("%H:%M")

        return jsonify(
            {
                "city": location_name,
                "country": current_data["sys"]["country"],
                "coordinates": {
                    "lat": current_data["coord"]["lat"],
                    "lon": current_data["coord"]["lon"],
                },
                "current": {
                    "temp": current_data["main"]["temp"],
                    "feels_like": current_data["main"]["feels_like"],
                    "temp_min": current_data["main"]["temp_min"],
                    "temp_max": current_data["main"]["temp_max"],
                    "humidity": current_data["main"]["humidity"],
                    "pressure": current_data["main"]["pressure"],
                    "wind": {
                        "speed": current_data["wind"]["speed"],
                        "direction": current_data["wind"].get("deg", 0),
                    },
                    "visibility": current_data.get("visibility", 0) / 1000,  # km
                    "clouds": current_data["clouds"]["all"],
                    "description": current_data["weather"][0]["description"],
                    "icon": current_data["weather"][0]["icon"],
                    "sunrise": sunrise,
                    "sunset": sunset,
                },
                "forecast": forecast_data,
            }
        )

    except requests.exceptions.Timeout:
        return jsonify({"error": "Timeout - spróbuj ponownie"}), 408
    except Exception as e:
        return jsonify({"error": f"Nieoczekiwany błąd: {str(e)}"}), 500


# JAKOŚĆ POWIETRZA
@app.route("/api/air-quality", methods=["GET"])
@cache_response(600)  # 10 minut cache
def get_air_quality():
    """Pobiera dane o jakości powietrza"""
    city = request.args.get("city")
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if city:
        lat, lon = get_coordinates_for_city(city)

    if not lat or not lon:
        return jsonify({"error": "Nie można określić współrzędnych"}), 400

    try:
        air_params = {"lat": lat, "lon": lon, "appid": API_KEY}
        air_resp = requests.get(
            f"http://api.openweathermap.org/data/2.5/air_pollution",
            params=air_params,
            timeout=10,
        )

        if air_resp.status_code != 200:
            return (
                jsonify({"error": "Błąd pobierania danych o jakości powietrza"}),
                air_resp.status_code,
            )

        air_data = air_resp.json()
        current_pollution = air_data["list"][0]
        aqi = current_pollution["main"]["aqi"]
        components = current_pollution["components"]

        aqi_descriptions = {
            1: "Bardzo dobra",
            2: "Dobra",
            3: "Umiarkowana",
            4: "Zła",
            5: "Bardzo zła",
        }

        aqi_colors = {
            1: "#00e400",
            2: "#ffff00",
            3: "#ff7e00",
            4: "#ff0000",
            5: "#8f3f97",
        }

        return jsonify(
            {
                "aqi": aqi,
                "description": aqi_descriptions.get(aqi, "Nieznana"),
                "color": aqi_colors.get(aqi, "#gray"),
                "components": {
                    "co": round(components.get("co", 0), 2),
                    "no": round(components.get("no", 0), 2),
                    "no2": round(components.get("no2", 0), 2),
                    "o3": round(components.get("o3", 0), 2),
                    "so2": round(components.get("so2", 0), 2),
                    "pm2_5": round(components.get("pm2_5", 0), 2),
                    "pm10": round(components.get("pm10", 0), 2),
                    "nh3": round(components.get("nh3", 0), 2),
                },
                "timestamp": current_pollution["dt"],
            }
        )

    except Exception as e:
        return (
            jsonify({"error": f"Błąd pobierania danych o jakości powietrza: {str(e)}"}),
            500,
        )


# INDEKS UV
@app.route("/api/uv-index", methods=["GET"])
@cache_response(1800)  # 30 minut cache
def get_uv_index():
    """Pobiera indeks UV (symulowany na podstawie pory dnia)"""
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    city = request.args.get("city")

    if city:
        lat, lon = get_coordinates_for_city(city)

    if not lat or not lon:
        return jsonify({"error": "Wymagane współrzędne"}), 400

    try:
        # Symulacja UV na podstawie pory dnia i szerokości geograficznej
        now = datetime.datetime.now()
        hour = now.hour
        lat_float = float(lat)

        # Podstawowa kalkulacja UV
        if 6 <= hour <= 18:
            # Maksymalny UV w południe, zależny od szerokości geograficznej
            max_uv = 12 if abs(lat_float) < 23.5 else 10 if abs(lat_float) < 40 else 8
            uv_index = max(0, max_uv * math.sin(math.pi * (hour - 6) / 12))

            # Modyfikacja na podstawie pory roku
            day_of_year = now.timetuple().tm_yday
            seasonal_factor = 0.8 + 0.4 * math.sin(
                2 * math.pi * (day_of_year - 81) / 365
            )
            uv_index *= seasonal_factor
        else:
            uv_index = 0

        uv_index = round(uv_index, 1)

        if uv_index < 3:
            level = "Niski"
            color = "#289500"
        elif uv_index < 6:
            level = "Umiarkowany"
            color = "#f7e400"
        elif uv_index < 8:
            level = "Wysoki"
            color = "#f85900"
        elif uv_index < 11:
            level = "Bardzo wysoki"
            color = "#d8001d"
        else:
            level = "Ekstremalny"
            color = "#6b49c8"

        return jsonify(
            {
                "uv_index": uv_index,
                "level": level,
                "color": color,
                "recommendation": get_uv_recommendation(uv_index),
                "peak_time": "12:00-14:00" if uv_index > 3 else None,
            }
        )

    except Exception as e:
        return jsonify({"error": f"Błąd pobierania danych UV: {str(e)}"}), 500


# OSTRZEŻENIA METEOROLOGICZNE
@app.route("/api/weather-alerts", methods=["GET"])
@cache_response(300)  # 5 minut cache
def get_weather_alerts():
    """Generuje ostrzeżenia meteorologiczne na podstawie aktualnych warunków"""
    city = request.args.get("city")
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if city and not (lat and lon):
        lat, lon = get_coordinates_for_city(city)

    if not lat or not lon:
        return jsonify({"error": "Nie można określić współrzędnych"}), 400

    try:
        current_params = {
            "lat": lat,
            "lon": lon,
            "appid": API_KEY,
            "units": "metric",
            "lang": "pl",
        }
        current_resp = requests.get(
            f"{BASE_URL}/weather", params=current_params, timeout=10
        )

        if current_resp.status_code != 200:
            return jsonify({"error": "Błąd pobierania danych pogodowych"}), 500

        current_data = current_resp.json()
        alerts = []

        # Analiza warunków pogodowych
        temp = current_data["main"]["temp"]
        feels_like = current_data["main"]["feels_like"]
        wind_speed = current_data["wind"]["speed"]
        humidity = current_data["main"]["humidity"]
        pressure = current_data["main"]["pressure"]
        weather_main = current_data["weather"][0]["main"].lower()
        weather_desc = current_data["weather"][0]["description"]

        # Ostrzeżenia temperaturowe
        if temp > 35:
            alerts.append(
                {
                    "id": "heat_warning",
                    "type": "temperature",
                    "severity": "high",
                    "title": "Ostrzeżenie przed upałem",
                    "description": f"Temperatura {temp}°C. Unikaj długotrwałego przebywania na słońcu.",
                    "icon": "🌡️",
                    "color": "#ff4444",
                }
            )
        elif temp < -15:
            alerts.append(
                {
                    "id": "cold_warning",
                    "type": "temperature",
                    "severity": "medium",
                    "title": "Ostrzeżenie przed mrozem",
                    "description": f"Temperatura {temp}°C. Ubieraj się ciepło i ogranicz czas na zewnątrz.",
                    "icon": "🥶",
                    "color": "#4444ff",
                }
            )

        # Ostrzeżenia wiatrowe
        if wind_speed > 15:
            severity = "high" if wind_speed > 25 else "medium"
            alerts.append(
                {
                    "id": "wind_warning",
                    "type": "wind",
                    "severity": severity,
                    "title": "Ostrzeżenie przed silnym wiatrem",
                    "description": f"Prędkość wiatru {wind_speed} m/s. Zachowaj ostrożność, unikaj drzew.",
                    "icon": "💨",
                    "color": "#ff8800",
                }
            )

        # Ostrzeżenia burzowe
        if "thunderstorm" in weather_main:
            alerts.append(
                {
                    "id": "storm_warning",
                    "type": "storm",
                    "severity": "high",
                    "title": "Ostrzeżenie przed burzą",
                    "description": "Przewidywane burze. Unikaj otwartych przestrzeni i wysokich obiektów.",
                    "icon": "⛈️",
                    "color": "#8844ff",
                }
            )

        # Ostrzeżenia o opadach
        if "rain" in weather_main and "heavy" in weather_desc:
            alerts.append(
                {
                    "id": "heavy_rain",
                    "type": "precipitation",
                    "severity": "medium",
                    "title": "Ostrzeżenie przed intensywnymi opadami",
                    "description": "Przewidywane silne opady deszczu. Zachowaj ostrożność na drogach.",
                    "icon": "🌧️",
                    "color": "#0088ff",
                }
            )

        # Ostrzeżenia o wilgotności
        if humidity > 85 and temp > 25:
            alerts.append(
                {
                    "id": "humidity_warning",
                    "type": "comfort",
                    "severity": "low",
                    "title": "Wysoka wilgotność",
                    "description": f"Wilgotność {humidity}%. Może być odczuwalna duchota.",
                    "icon": "💧",
                    "color": "#00aa88",
                }
            )

        # Ostrzeżenia o ciśnieniu
        if pressure < 1000:
            alerts.append(
                {
                    "id": "pressure_warning",
                    "type": "pressure",
                    "severity": "low",
                    "title": "Niskie ciśnienie atmosferyczne",
                    "description": f"Ciśnienie {pressure} hPa. Osoby wrażliwe mogą odczuwać dolegliwości.",
                    "icon": "📉",
                    "color": "#aa6600",
                }
            )

        return jsonify(
            {"alerts": alerts, "count": len(alerts), "timestamp": time.time()}
        )

    except Exception as e:
        return jsonify({"error": f"Błąd generowania alertów: {str(e)}"}), 500


# PORÓWNANIE MIAST
@app.route("/api/weather/compare", methods=["GET"])
@cache_response(300)  # 5 minut cache
def compare_cities():
    """Porównuje pogodę w różnych miastach"""
    cities = request.args.getlist("cities")

    if len(cities) < 2:
        return jsonify({"error": "Podaj przynajmniej 2 miasta do porównania"}), 400

    if len(cities) > 6:
        return jsonify({"error": "Maksymalnie 6 miast do porównania"}), 400

    units = request.args.get("units", "metric")
    results = []

    for city in cities:
        try:
            params = {"q": city, "appid": API_KEY, "units": units, "lang": "pl"}
            response = requests.get(f"{BASE_URL}/weather", params=params, timeout=10)

            if response.status_code == 200:
                data = response.json()
                results.append(
                    {
                        "city": data["name"],
                        "country": data["sys"]["country"],
                        "temp": round(data["main"]["temp"], 1),
                        "feels_like": round(data["main"]["feels_like"], 1),
                        "humidity": data["main"]["humidity"],
                        "pressure": data["main"]["pressure"],
                        "wind_speed": data["wind"]["speed"],
                        "clouds": data["clouds"]["all"],
                        "description": data["weather"][0]["description"],
                        "icon": data["weather"][0]["icon"],
                        "coordinates": {
                            "lat": data["coord"]["lat"],
                            "lon": data["coord"]["lon"],
                        },
                    }
                )
            else:
                results.append(
                    {
                        "city": city,
                        "error": f"Nie znaleziono miasta lub błąd API ({response.status_code})",
                    }
                )
        except Exception as e:
            results.append({"city": city, "error": f"Błąd pobierania danych: {str(e)}"})

    # Dodaj statystyki porównania
    valid_results = [r for r in results if "error" not in r]
    if valid_results:
        temps = [r["temp"] for r in valid_results]
        comparison_stats = {
            "hottest": max(valid_results, key=lambda x: x["temp"]),
            "coldest": min(valid_results, key=lambda x: x["temp"]),
            "avg_temp": round(sum(temps) / len(temps), 1),
            "temp_range": round(max(temps) - min(temps), 1),
        }
    else:
        comparison_stats = None

    return jsonify(
        {
            "comparison": results,
            "stats": comparison_stats,
            "units": units,
            "timestamp": time.time(),
        }
    )


# GEOCODING ROZSZERZONY
@app.route("/api/geocode", methods=["GET"])
@cache_response(3600)  # 1 godzina cache
def geocode_location():
    """Wyszukuje lokalizacje na podstawie zapytania"""
    query = request.args.get("q")
    limit = min(int(request.args.get("limit", 5)), 10)  # Max 10 wyników

    if not query:
        return jsonify({"error": "Brak zapytania"}), 400

    if len(query) < 2:
        return jsonify({"error": "Zapytanie musi mieć przynajmniej 2 znaki"}), 400

    try:
        params = {"q": query, "limit": limit, "appid": API_KEY}

        response = requests.get(
            f"http://api.openweathermap.org/geo/1.0/direct", params=params, timeout=10
        )

        if response.status_code != 200:
            return jsonify({"error": "Błąd geocodowania"}), response.status_code

        locations = response.json()

        enriched_locations = []
        for loc in locations:
            display_parts = [loc["name"]]
            if loc.get("state"):
                display_parts.append(loc["state"])
            display_parts.append(loc["country"])

            enriched_locations.append(
                {
                    "name": loc["name"],
                    "country": loc["country"],
                    "country_code": loc.get("country", ""),
                    "state": loc.get("state", ""),
                    "lat": round(loc["lat"], 4),
                    "lon": round(loc["lon"], 4),
                    "display_name": ", ".join(display_parts),
                }
            )

        return jsonify(
            {
                "locations": enriched_locations,
                "count": len(enriched_locations),
                "query": query,
            }
        )

    except Exception as e:
        return jsonify({"error": f"Błąd wyszukiwania: {str(e)}"}), 500


# STATYSTYKI API
@app.route("/api/stats", methods=["GET"])
def get_api_stats():
    """Zwraca statystyki użycia API"""
    uptime_seconds = time.time() - app.start_time
    uptime_hours = uptime_seconds / 3600

    return jsonify(
        {
            "cache_entries": len(weather_cache),
            "uptime_seconds": round(uptime_seconds, 2),
            "uptime_hours": round(uptime_hours, 2),
            "endpoints": [
                {"path": "/api/weather", "description": "Aktualna pogoda i prognoza"},
                {"path": "/api/air-quality", "description": "Jakość powietrza"},
                {"path": "/api/uv-index", "description": "Indeks UV"},
                {
                    "path": "/api/weather-alerts",
                    "description": "Ostrzeżenia meteorologiczne",
                },
                {"path": "/api/weather/compare", "description": "Porównanie miast"},
                {"path": "/api/geocode", "description": "Wyszukiwanie lokalizacji"},
                {"path": "/api/stats", "description": "Statystyki API"},
            ],
            "version": "2.0.0",
            "timestamp": time.time(),
        }
    )


# ENDPOINT ZDROWIA
@app.route("/api/health", methods=["GET"])
def health_check():
    """Sprawdza stan zdrowia API"""
    try:
        # Test połączenia z OpenWeatherMap
        test_params = {"q": "London", "appid": API_KEY}
        test_response = requests.get(
            f"{BASE_URL}/weather", params=test_params, timeout=5
        )
        api_status = "healthy" if test_response.status_code == 200 else "degraded"
    except:
        api_status = "unhealthy"

    return jsonify(
        {
            "status": "healthy",
            "api_connection": api_status,
            "cache_size": len(weather_cache),
            "uptime": round(time.time() - app.start_time, 2),
            "timestamp": time.time(),
        }
    )


# OBSŁUGA BŁĘDÓW
@app.errorhandler(429)
def rate_limit_error(e):
    return jsonify({"error": "Zbyt wiele zapytań. Spróbuj ponownie później."}), 429


@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Wewnętrzny błąd serwera"}), 500


@app.errorhandler(404)
def not_found_error(e):
    return jsonify({"error": "Endpoint nie został znaleziony"}), 404


# CZYSZCZENIE CACHE
@app.route("/api/cache/clear", methods=["POST"])
def clear_cache():
    """Czyści cache (tylko do celów deweloperskich)"""
    global weather_cache
    cache_size = len(weather_cache)
    weather_cache.clear()
    return jsonify(
        {
            "message": f"Cache wyczyszczony. Usunięto {cache_size} wpisów.",
            "timestamp": time.time(),
        }
    )


if __name__ == "__main__":
    print("🌤️  QuickWeather API v2.0.0")
    print("📡 Dostępne endpointy:")
    print("   /api/weather - Aktualna pogoda")
    print("   /api/air-quality - Jakość powietrza")
    print("   /api/uv-index - Indeks UV")
    print("   /api/weather-alerts - Ostrzeżenia")
    print("   /api/weather/compare - Porównanie miast")
    print("   /api/geocode - Wyszukiwanie lokalizacji")
    print("   /api/stats - Statystyki")
    print("   /api/health - Status zdrowia")
    print("\n🚀 Uruchamianie serwera...")
    app.run(debug=True, host="0.0.0.0", port=5000)
