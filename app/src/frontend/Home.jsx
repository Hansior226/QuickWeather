import React, { useState, useEffect } from 'react';
import WeatherDisplay from './components/WeatherDisplay';
import ForecastChart from './components/ForecastChart';

export default function Home() {
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState(null);
  const [data, setData] = useState(null);
  const [units, setUnits] = useState('metric');

  const fetchWeather = async (params = {}) => {
    let url = `http://localhost:5000/api/weather?units=${units}`;

    if (params.lat && params.lon) {
      url += `&lat=${params.lat}&lon=${params.lon}`;
    } else if (params.city) {
      url += `&city=${encodeURIComponent(params.city)}`;
    } else {
      alert('Wprowadź miasto lub zezwól na lokalizację.');
      return;
    }

    try {
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok) setData(json);
      else alert(json.error);
    } catch {
      alert('Błąd połączenia z serwerem.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (coords) {
      fetchWeather(coords);
    } else if (city) {
      fetchWeather({ city });
    } else {
      alert('Wprowadź miasto lub zezwól na lokalizację.');
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const position = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          };
          setCoords(position);
          fetchWeather(position); // Automatyczne pobranie pogody
        },
        (err) => {
          console.warn('Błąd geolokalizacji:', err);
        }
      );
    }
  }, [units]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col items-center justify-center p-4">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">QuickWeather</h1>
        <p className="text-lg text-blue-600">Sprawdź pogodę w dowolnym miejscu na świecie</p>
      </header>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Miasto, kod pocztowy lub współrzędne..."
            className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setCoords(null);
            }}
          />
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => {
                const newUnits = units === 'metric' ? 'imperial' : 'metric';
                setUnits(newUnits);
                if (coords) fetchWeather(coords);
                else if (city) fetchWeather({ city });
              }}
              className="text-sm text-blue-600 underline"
            >
              °{units === 'metric' ? 'C' : 'F'}
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Sprawdź pogodę
            </button>
          </div>
        </form>
        {data && (
          <>
            <WeatherDisplay data={data.current} city={data.city} />
            <ForecastChart forecast={data.forecast} units={units} />
          </>
        )}
      </div>
      <footer className="mt-10 text-sm text-blue-700">&copy; {new Date().getFullYear()} QuickWeather</footer>
    </div>
  );
}
