# tests/test_api.py
import pytest
import json
from unittest.mock import patch, Mock


class TestWeatherAPI:

    def test_weather_endpoint_with_city(self, client):
        """Test pobierania pogody dla miasta"""
        with patch("app.requests.get") as mock_get:
            # Mock response dla current weather
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "coord": {"lon": 19.0292, "lat": 49.8121},
                "weather": [{"description": "bezchmurnie", "icon": "01d"}],
                "main": {"temp": 20.5, "humidity": 65, "pressure": 1013},
                "wind": {"speed": 3.5, "deg": 180},
                "clouds": {"all": 10},
                "visibility": 10000,
                "sys": {"country": "PL", "sunrise": 1640668800, "sunset": 1640700000},
                "name": "Warszawa",
            }
            mock_get.return_value = mock_response

            response = client.get("/api/weather?city=Warszawa&units=metric")

            assert response.status_code == 200
            data = json.loads(response.data)
            assert data["city"] == "Warszawa"
            assert "current" in data
            assert "temp" in data["current"]

    def test_weather_endpoint_with_coordinates(self, client):
        """Test pobierania pogody dla współrzędnych"""
        with patch("app.requests.get") as mock_get:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "coord": {"lon": 19.0292, "lat": 49.8121},
                "weather": [{"description": "bezchmurnie", "icon": "01d"}],
                "main": {"temp": 20.5, "humidity": 65, "pressure": 1013},
                "wind": {"speed": 3.5, "deg": 180},
                "clouds": {"all": 10},
                "visibility": 10000,
                "sys": {"country": "PL", "sunrise": 1640668800, "sunset": 1640700000},
                "name": "Bielsko-Biała",
            }
            mock_get.return_value = mock_response

            response = client.get("/api/weather?lat=49.8121&lon=19.0292&units=metric")

            assert response.status_code == 200
            data = json.loads(response.data)
            assert "current" in data
            assert data["current"]["temp"] == 20.5

    def test_weather_endpoint_missing_params(self, client):
        """Test błędu przy braku parametrów"""
        response = client.get("/api/weather")

        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data

    def test_weather_endpoint_api_error(self, client):
        """Test obsługi błędu API"""
        with patch("app.requests.get") as mock_get:
            mock_response = Mock()
            mock_response.status_code = 404
            mock_get.return_value = mock_response

            response = client.get("/api/weather?city=NonexistentCity")

            assert response.status_code == 404

    def test_air_quality_endpoint(self, client):
        """Test endpointu jakości powietrza"""
        with patch("app.requests.get") as mock_get:
            # Mock geocoding response
            mock_geo_response = Mock()
            mock_geo_response.status_code = 200
            mock_geo_response.json.return_value = [{"lat": 52.2297, "lon": 21.0122}]

            # Mock air quality response
            mock_air_response = Mock()
            mock_air_response.status_code = 200
            mock_air_response.json.return_value = {
                "list": [
                    {
                        "main": {"aqi": 2},
                        "components": {
                            "co": 233.0,
                            "no2": 15.0,
                            "o3": 85.0,
                            "pm2_5": 8.0,
                            "pm10": 12.0,
                        },
                        "dt": 1640700000,
                    }
                ]
            }

            mock_get.side_effect = [mock_geo_response, mock_air_response]

            response = client.get("/api/air-quality?city=Warszawa")

            assert response.status_code == 200
            data = json.loads(response.data)
            assert data["aqi"] == 2
            assert "components" in data

    def test_uv_index_endpoint(self, client):
        """Test endpointu indeksu UV"""
        response = client.get("/api/uv-index?lat=52.2297&lon=21.0122")

        assert response.status_code == 200
        data = json.loads(response.data)
        assert "uv_index" in data
        assert "level" in data
        assert "recommendation" in data

    def test_weather_alerts_endpoint(self, client):
        """Test endpointu ostrzeżeń"""
        with patch("app.requests.get") as mock_get:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "main": {"temp": 38.0, "humidity": 45, "pressure": 1015},
                "wind": {"speed": 18.0},
                "weather": [{"main": "Clear", "description": "bezchmurnie"}],
            }
            mock_get.return_value = mock_response

            response = client.get("/api/weather-alerts?lat=52.2297&lon=21.0122")

            assert response.status_code == 200
            data = json.loads(response.data)
            assert "alerts" in data
            assert isinstance(data["alerts"], list)

    def test_compare_cities_endpoint(self, client):
        """Test porównywania miast"""
        with patch("app.requests.get") as mock_get:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "name": "Warszawa",
                "sys": {"country": "PL"},
                "main": {
                    "temp": 20.0,
                    "feels_like": 19.0,
                    "humidity": 65,
                    "pressure": 1013,
                },
                "wind": {"speed": 3.0},
                "clouds": {"all": 20},
                "weather": [{"description": "bezchmurnie", "icon": "01d"}],
                "coord": {"lat": 52.2297, "lon": 21.0122},
            }
            mock_get.return_value = mock_response

            response = client.get("/api/weather/compare?cities=Warszawa&cities=Kraków")

            assert response.status_code == 200
            data = json.loads(response.data)
            assert "comparison" in data
            assert len(data["comparison"]) == 2

    def test_geocode_endpoint(self, client):
        """Test wyszukiwania lokalizacji"""
        with patch("app.requests.get") as mock_get:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = [
                {
                    "name": "Warszawa",
                    "country": "PL",
                    "state": "Mazowieckie",
                    "lat": 52.2297,
                    "lon": 21.0122,
                }
            ]
            mock_get.return_value = mock_response

            response = client.get("/api/geocode?q=Warszawa")

            assert response.status_code == 200
            data = json.loads(response.data)
            assert "locations" in data
            assert len(data["locations"]) > 0

    def test_stats_endpoint(self, client):
        """Test endpointu statystyk"""
        response = client.get("/api/stats")

        assert response.status_code == 200
        data = json.loads(response.data)
        assert "cache_entries" in data
        assert "uptime_seconds" in data
        assert "endpoints" in data

    def test_health_endpoint(self, client):
        """Test endpointu zdrowia"""
        with patch("app.requests.get") as mock_get:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_get.return_value = mock_response

            response = client.get("/api/health")

            assert response.status_code == 200
            data = json.loads(response.data)
            assert data["status"] == "healthy"


class TestUtilityFunctions:

    def test_normalize_city_name(self):
        """Test normalizacji nazw miast"""
        from app import normalize_city_name

        assert normalize_city_name("Bielsko Biała") == "Bielsko-Biała"
        assert normalize_city_name("Kraków") == "Kraków"
        assert normalize_city_name("krakow") == "Kraków"
        assert normalize_city_name("warszawa") == "Warsaw"

    def test_reverse_geocode(self):
        """Test odwrotnego geokodowania"""
        from app import reverse_geocode

        with patch("app.requests.get") as mock_get:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {"address": {"city": "Warszawa"}}
            mock_get.return_value = mock_response

            result = reverse_geocode(52.2297, 21.0122)
            assert result == "Warszawa"

    def test_get_uv_recommendation(self):
        """Test rekomendacji UV"""
        from app import get_uv_recommendation

        assert "bez ochrony" in get_uv_recommendation(2)
        assert "ochrona przeciwsłoneczna" in get_uv_recommendation(5)
        assert "Unikaj" in get_uv_recommendation(12)


class TestCacheSystem:

    def test_cache_decorator(self, client):
        """Test systemu cache"""
        with patch("app.requests.get") as mock_get:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "name": "Warszawa",
                "main": {"temp": 20.0, "humidity": 65, "pressure": 1013},
                "weather": [{"description": "bezchmurnie", "icon": "01d"}],
                "wind": {"speed": 3.0, "deg": 180},
                "clouds": {"all": 10},
                "visibility": 10000,
                "sys": {"country": "PL", "sunrise": 1640668800, "sunset": 1640700000},
                "coord": {"lat": 52.2297, "lon": 21.0122},
            }
            mock_get.return_value = mock_response

            # Pierwsze wywołanie
            response1 = client.get("/api/weather?city=Warszawa")
            assert response1.status_code == 200

            # Drugie wywołanie (powinno użyć cache)
            response2 = client.get("/api/weather?city=Warszawa")
            assert response2.status_code == 200

            # Sprawdź czy API było wywołane tylko raz
            assert mock_get.call_count <= 2  # current + forecast

    def test_clear_cache(self, client):
        """Test czyszczenia cache"""
        response = client.post("/api/cache/clear")

        assert response.status_code == 200
        data = json.loads(response.data)
        assert "message" in data
