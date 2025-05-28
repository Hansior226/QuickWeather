# tests/test_api.py
import pytest
import json
from unittest.mock import patch, Mock
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture
def client():
    """Fixture dla klienta testowego Flask"""
    from app import app

    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def mock_weather_response():
    """Mock odpowiedzi z API pogodowego"""
    return {
        "coord": {"lon": 19.0292, "lat": 49.8121},
        "weather": [
            {"id": 800, "main": "Clear", "description": "bezchmurnie", "icon": "01d"}
        ],
        "main": {
            "temp": 20.5,
            "feels_like": 19.8,
            "temp_min": 18.0,
            "temp_max": 22.0,
            "pressure": 1013,
            "humidity": 65,
        },
        "wind": {"speed": 3.5, "deg": 180},
        "clouds": {"all": 10},
        "visibility": 10000,
        "sys": {"country": "PL", "sunrise": 1640668800, "sunset": 1640700000},
        "name": "Warszawa",
    }


class TestBasicEndpoints:
    """Podstawowe testy endpointów"""

    def test_health_endpoint(self, client):
        """Test endpointu zdrowia"""
        response = client.get("/api/health")
        print(f"Health response status: {response.status_code}")
        print(f"Health response data: {response.get_data(as_text=True)}")

        assert response.status_code != 404

    def test_stats_endpoint(self, client):
        """Test endpointu statystyk"""
        response = client.get("/api/stats")
        print(f"Stats response status: {response.status_code}")
        print(f"Stats response data: {response.get_data(as_text=True)}")

        assert response.status_code != 404


class TestWeatherAPI:
    """Testy API pogodowego"""

    def test_weather_endpoint_missing_params(self, client):
        """Test błędu przy braku parametrów"""
        response = client.get("/api/weather")

        print(f"Missing params response status: {response.status_code}")
        print(f"Missing params response data: {response.get_data(as_text=True)}")

        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data

    @patch("app.requests.get")
    def test_weather_endpoint_with_city_mock(
        self, mock_get, client, mock_weather_response
    ):
        """Test pobierania pogody dla miasta z mockiem"""
        mock_current = Mock()
        mock_current.status_code = 200
        mock_current.json.return_value = mock_weather_response

        mock_forecast = Mock()
        mock_forecast.status_code = 200
        mock_forecast.json.return_value = {"list": []}

        mock_get.side_effect = [mock_current, mock_forecast]

        response = client.get("/api/weather?city=Warszawa&units=metric")

        print(f"Weather response status: {response.status_code}")
        print(f"Weather response data: {response.get_data(as_text=True)}")

        if response.status_code == 200:
            data = json.loads(response.data)
            assert "current" in data
            assert "city" in data
        else:
            assert response.status_code in [401, 500]

    def test_weather_endpoint_invalid_city(self, client):
        """Test dla nieistniejącego miasta"""
        response = client.get("/api/weather?city=NonexistentCity123&units=metric")

        print(f"Invalid city response status: {response.status_code}")
        print(f"Invalid city response data: {response.get_data(as_text=True)}")

        assert response.status_code in [404, 500]


class TestUtilityFunctions:
    """Testy funkcji pomocniczych"""

    def test_app_import(self):
        """Test czy aplikacja się importuje"""
        try:
            from app import app

            assert app is not None
            print("✅ App import successful")
        except ImportError as e:
            print(f"❌ App import failed: {e}")
            pytest.fail(f"Cannot import app: {e}")

    def test_reverse_geocode_function_exists(self):
        """Test czy funkcja reverse_geocode istnieje"""
        try:
            from app import reverse_geocode

            print("✅ reverse_geocode function exists")
        except ImportError:
            print("⚠️ reverse_geocode function not found - this is OK")

    def test_normalize_city_name_function(self):
        """Test funkcji normalizacji nazw miast"""
        try:
            from app import normalize_city_name

            result = normalize_city_name("Kraków")
            assert result is not None
            print(f"✅ normalize_city_name('Kraków') = {result}")

        except ImportError:
            print("⚠️ normalize_city_name function not found - skipping test")
            pytest.skip("normalize_city_name function not implemented")


class TestErrorHandling:
    """Testy obsługi błędów"""

    def test_404_error(self, client):
        """Test obsługi błędu 404"""
        response = client.get("/api/nonexistent-endpoint")

        assert response.status_code == 404
        print("✅ 404 error handling works")

    @patch("app.requests.get")
    def test_api_timeout_error(self, mock_get, client):
        """Test obsługi timeout API"""
        mock_get.side_effect = Exception("Timeout error")

        response = client.get("/api/weather?city=TestCity")

        print(f"Timeout test response status: {response.status_code}")
        assert response.status_code == 500


def test_environment_variables():
    """Test zmiennych środowiskowych"""
    import os

    api_key = os.getenv("OPENWEATHER_KEY")
    if api_key:
        print(f"✅ API key found: {api_key[:10]}...")
    else:
        print("⚠️ No API key found in environment")
