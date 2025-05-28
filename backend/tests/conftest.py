# tests/conftest.py
import pytest
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
import json


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def mock_weather_response():
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
        "name": "Bielsko-Biała",
    }


@pytest.fixture
def mock_forecast_response():
    return {
        "list": [
            {
                "dt": 1640700000,
                "main": {"temp": 18.5, "humidity": 70, "pressure": 1010},
                "weather": [{"description": "pochmurno", "icon": "04d"}],
                "wind": {"speed": 2.8},
            }
        ]
    }
