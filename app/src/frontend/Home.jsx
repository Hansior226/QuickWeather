import React, { useState, useEffect } from 'react';
import WeatherDisplay from '../frontend/components/WeatherDisplay';
import HourlyForecast from '../frontend/components/HourlyForecast';
import CityList from '../frontend/components/CityList';
import DailyForecast from '../frontend/components/DailyForecast';

export default function Home() {
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState(null);
  const [data, setData] = useState(null);
  const [units, setUnits] = useState('metric');
  const [lastParams, setLastParams] = useState(null);

  // Funkcja pobierająca pogodę według parametrów i jednostek
  const fetchWeather = async (params = {}, useUnits = units) => {
    let url = `http://localhost:5000/api/weather?units=${useUnits}`;
    if (params.lat && params.lon) {
      url += `&lat=${params.lat}&lon=${params.lon}`;
    } else if (params.city) {
      url += `&city=${encodeURIComponent(params.city)}`;
    } else {
      return alert('Wprowadź miasto lub zezwól na lokalizację.');
    }

    try {
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok) {
        setData(json);
        setLastParams(params);
      } else {
        alert(json.error);
      }
    } catch {
      alert('Błąd połączenia z serwerem.');
    }
  };

  // Funkcja pobierająca geolokalizację i pogodę
  const fetchGeoAndWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const position = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setCoords(position);
          fetchWeather(position);
          setCity('');
        },
        () => alert('Nie można pobrać lokalizacji')
      );
    } else {
      alert('Twoja przeglądarka nie obsługuje geolokalizacji.');
    }
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
    if (city) {
      fetchWeather({ city });
      setCoords(null);
    } else if (coords) {
      fetchWeather(coords);
    } else {
      alert('Wprowadź miasto lub zezwól na lokalizację.');
    }
  };

  // Funkcja wywoływana po kliknięciu w logo, odświeża dane geolokalizacji
  const reloadGeoLocation = () => {
    fetchGeoAndWeather();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-gray-100 p-6 flex flex-col">
      <header className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
        <h1
          className="text-3xl font-semibold cursor-pointer select-none"
          onClick={reloadGeoLocation}
          title="Kliknij, aby odświeżyć pogodę dla Twojej lokalizacji"
        >
          QuickWeather
        </h1>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 w-full max-w-md">
          <input
            type="text"
            placeholder="Miasto, kod pocztowy lub współrzędne..."
            className="flex-1 px-3 py-2 bg-blue-800/70 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={city}
            onChange={e => setCity(e.target.value)}
          />
          <button
            type="button"
            onClick={toggleUnits}
            className="px-3 py-2 bg-blue-700 rounded-lg hover:bg-blue-600 transition"
          >
            °{units === 'metric' ? 'C' : 'F'}
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
          >
            Szukaj
          </button>
        </form>
      </header>

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
              <WeatherDisplay data={data.current} city={data.city} units={units} />
            </div>
            <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 col-span-2">
              <HourlyForecast hourly={data.forecast} units={units} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <CityList units={units} />
            </div>
            <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <DailyForecast daily={data.forecast} units={units} />
            </div>
          </div>
        </>
      )}

      <footer className="mt-auto text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} QuickWeather
      </footer>
    </div>
  );
}
