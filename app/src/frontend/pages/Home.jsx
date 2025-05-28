// pages/Home.jsx
import React, { useState, useEffect } from 'react';
import WeatherDisplay from '../components/WeatherDisplay';
import HourlyForecast from '../components/HourlyForecast';
import CityList from '../components/CityList';
import DailyForecast from '../components/DailyForecast';
import AirQualityWidget from '../components/AirQualityWidget';
import UVWidget from '../components/UVWidget';
import WeatherAlertsWidget from '../components/WeatherAlertsWidget';
import ErrorPopup from '../components/ErrorPopup';
import usePopup from '../hooks/usePopup';

export default function Home() {
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState(null);
  const [data, setData] = useState(null);
  const [units, setUnits] = useState('metric');
  const [lastParams, setLastParams] = useState(null);
  const [loading, setLoading] = useState(false);

  const { popup, showError, showWarning, showInfo, showSuccess, hidePopup } = usePopup();

  // Funkcja pobierająca pogodę według parametrów i jednostek
  const fetchWeather = async (params = {}, useUnits = units) => {
    let url = `http://localhost:5000/api/weather?units=${useUnits}`;
    if (params.lat && params.lon) {
      url += `&lat=${params.lat}&lon=${params.lon}`;
    } else if (params.city) {
      url += `&city=${encodeURIComponent(params.city)}`;
    } else {
      showWarning('Wprowadź miasto lub zezwól na lokalizację.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(url);
      const json = await res.json();

      if (res.ok) {
        setData(json);
        setLastParams(params);
        if (params.city) {
          showSuccess(`Pomyślnie pobrano pogodę dla ${json.city}`);
        }
      } else {
        // Lepsze komunikaty błędów
        if (res.status === 404) {
          showError(`Nie znaleziono miasta "${params.city}". Sprawdź pisownię lub spróbuj użyć innej nazwy.`);
        } else if (res.status === 401) {
          showError('Błąd autoryzacji API. Sprawdź klucz API.');
        } else {
          showError(json.error || `Błąd serwera (${res.status}). Spróbuj ponownie później.`);
        }
      }
    } catch (error) {
      showError('Błąd połączenia z serwerem. Sprawdź połączenie internetowe i spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  // Funkcja pobierająca geolokalizację i pogodę
  const fetchGeoAndWeather = () => {
    if (!navigator.geolocation) {
      showError('Twoja przeglądarka nie obsługuje geolokalizacji. Wprowadź miasto ręcznie.');
      return;
    }

    setLoading(true);
    showInfo('Pobieranie lokalizacji...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const position = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCoords(position);
        fetchWeather(position);
        setCity('');
        hidePopup(); // Ukryj popup "Pobieranie lokalizacji..."
      },
      (error) => {
        setLoading(false);
        let errorMessage = 'Nie można pobrać lokalizacji. ';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Dostęp do lokalizacji został zablokowany. Włącz lokalizację w ustawieniach przeglądarki.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Informacje o lokalizacji są niedostępne.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Przekroczono czas oczekiwania na lokalizację.';
            break;
          default:
            errorMessage += 'Wystąpił nieznany błąd.';
            break;
        }

        showError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minut
      }
    );
  };

  // Pobranie lokalizacji i pogody przy pierwszym renderze
  useEffect(() => {
    fetchGeoAndWeather();
  }, []);

  // Przełączenie jednostek temperatury
  const toggleUnits = () => {
    const newUnits = units === 'metric' ? 'imperial' : 'metric';
    setUnits(newUnits);
    if (lastParams) {
      fetchWeather(lastParams, newUnits);
    }
  };

  // Obsługa wyszukiwania po nazwie miasta
  const handleSubmit = e => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather({ city: city.trim() });
      setCoords(null);
    } else if (coords) {
      fetchWeather(coords);
    } else {
      showWarning('Wprowadź nazwę miasta lub użyj lokalizacji.');
    }
  };

  // Funkcja wywoływana po kliknięciu w przycisk lokalizacji
  const reloadGeoLocation = () => {
    fetchGeoAndWeather();
  };

  return (
    <div className="space-y-6">
      {/* Popup dla błędów */}
      <ErrorPopup
        message={popup.show ? popup.message : ''}
        type={popup.type}
        onClose={hidePopup}
      />

      {/* Header z wyszukiwaniem */}
      <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <input
            type="text"
            placeholder="Wyszukaj miasto..."
            className="flex-1 px-4 py-3 bg-blue-800/70 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-blue-200"
            value={city}
            onChange={e => setCity(e.target.value)}
            disabled={loading}
          />
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={reloadGeoLocation}
              disabled={loading}
              className="px-4 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Użyj mojej lokalizacji"
            >
              <span>{loading ? '⏳' : '📍'}</span>
              <span className="hidden sm:inline">
                {loading ? 'Ładowanie...' : 'Moja lokalizacja'}
              </span>
            </button>
            <button
              type="button"
              onClick={toggleUnits}
              disabled={loading}
              className="px-4 py-3 bg-blue-700 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
              °{units === 'metric' ? 'C' : 'F'}
            </button>
            <button
              type="submit"
              disabled={loading || !city.trim()}
              className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Szukam...' : 'Szukaj'}
            </button>
          </div>
        </form>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center">
          <div className="animate-spin text-4xl mb-2">🌀</div>
          <p className="text-blue-200">Ładowanie danych pogodowych...</p>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Główny widok pogody */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <WeatherDisplay data={data.current} city={data.city} units={units} />
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <HourlyForecast hourly={data.forecast} units={units} />
              </div>
            </div>
          </div>

          {/* Dodatkowe informacje */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AirQualityWidget
              city={data.city}
              lat={data.coordinates?.lat}
              lon={data.coordinates?.lon}
            />
            <UVWidget
              city={data.city}
              lat={data.coordinates?.lat}
              lon={data.coordinates?.lon}
            />
            <WeatherAlertsWidget
              city={data.city}
              lat={data.coordinates?.lat}
              lon={data.coordinates?.lon}
            />
          </div>

          {/* Prognoza i miasta */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <DailyForecast daily={data.forecast} units={units} />
            </div>
            <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <CityList units={units} />
            </div>
          </div>
        </>
      )}

      {!data && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌤️</div>
          <h2 className="text-2xl font-semibold mb-2">Witaj w QuickWeather!</h2>
          <p className="text-blue-200">Wyszukaj miasto lub użyj swojej lokalizacji, aby zobaczyć pogodę.</p>
        </div>
      )}
    </div>
  );
}
