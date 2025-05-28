// pages/SearchLocation.jsx
import React, { useState } from 'react';

export default function SearchLocation() {
    const [query, setQuery] = useState('');
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [weatherData, setWeatherData] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/geocode?q=${encodeURIComponent(query)}&limit=10`);
            const data = await response.json();

            if (response.ok) {
                setLocations(data.locations || []);
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Błąd połączenia z serwerem');
        } finally {
            setLoading(false);
        }
    };

    const selectLocation = async (location) => {
        setSelectedLocation(location);

        try {
            const response = await fetch(`http://localhost:5000/api/weather?lat=${location.lat}&lon=${location.lon}&units=metric`);
            const data = await response.json();

            if (response.ok) {
                setWeatherData(data);
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Błąd pobierania pogody');
        }
    };

    const clearSearch = () => {
        setQuery('');
        setLocations([]);
        setSelectedLocation(null);
        setWeatherData(null);
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <h1 className="text-3xl font-bold mb-4 flex items-center">
                    🔍 Wyszukaj lokalizację
                </h1>
                <p className="text-blue-200 mb-6">
                    Wyszukaj dowolną lokalizację na świecie i sprawdź tam pogodę. Możesz szukać po nazwie miasta, regionu lub kraju.
                </p>

                <form onSubmit={handleSearch} className="flex space-x-4">
                    <input
                        type="text"
                        placeholder="Wpisz nazwę miasta, regionu lub kraju..."
                        className="flex-1 px-4 py-3 bg-blue-800/70 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-blue-200"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
                    >
                        {loading ? 'Szukam...' : 'Szukaj'}
                    </button>
                    {(locations.length > 0 || selectedLocation) && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="px-4 py-3 bg-gray-600 rounded-lg hover:bg-gray-500 transition"
                        >
                            Wyczyść
                        </button>
                    )}
                </form>
            </div>

            {locations.length > 0 && !selectedLocation && (
                <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">📍 Znalezione lokalizacje ({locations.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {locations.map((location, index) => (
                            <div
                                key={index}
                                onClick={() => selectLocation(location)}
                                className="bg-blue-800/50 rounded-lg p-4 cursor-pointer hover:bg-blue-800/70 transition border border-blue-600 hover:border-blue-400"
                            >
                                <h4 className="font-semibold text-white mb-1">{location.name}</h4>
                                <p className="text-sm text-gray-300 mb-2">{location.display_name}</p>
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>📍 {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</span>
                                    <span>🌍 {location.country_code}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedLocation && (
                <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                        📍 Wybrana lokalizacja
                    </h3>
                    <div className="bg-blue-800/50 rounded-lg p-4 mb-4">
                        <h4 className="text-lg font-semibold text-white">{selectedLocation.display_name}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                            <div>
                                <p className="text-gray-400">Szerokość</p>
                                <p className="font-semibold">{selectedLocation.lat}°</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Długość</p>
                                <p className="font-semibold">{selectedLocation.lon}°</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Kraj</p>
                                <p className="font-semibold">{selectedLocation.country}</p>
                            </div>
                            {selectedLocation.state && (
                                <div>
                                    <p className="text-gray-400">Region</p>
                                    <p className="font-semibold">{selectedLocation.state}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {weatherData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                        <h3 className="text-xl font-semibold mb-4">🌤️ Aktualna pogoda</h3>
                        <div className="flex items-center space-x-4 mb-4">
                            <img
                                src={`http://openweathermap.org/img/wn/${weatherData.current.icon}@4x.png`}
                                alt={weatherData.current.description}
                                className="w-20 h-20"
                            />
                            <div>
                                <p className="text-3xl font-bold">{Math.round(weatherData.current.temp)}°C</p>
                                <p className="text-gray-300 capitalize">{weatherData.current.description}</p>
                                <p className="text-sm text-gray-400">Odczuwalna: {Math.round(weatherData.current.feels_like)}°C</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-400">Wilgotność</p>
                                <p className="font-semibold">{weatherData.current.humidity}%</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Ciśnienie</p>
                                <p className="font-semibold">{weatherData.current.pressure} hPa</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Wiatr</p>
                                <p className="font-semibold">{weatherData.current.wind.speed} m/s</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Widoczność</p>
                                <p className="font-semibold">{weatherData.current.visibility} km</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Wschód słońca</p>
                                <p className="font-semibold">{weatherData.current.sunrise}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Zachód słońca</p>
                                <p className="font-semibold">{weatherData.current.sunset}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                        <h3 className="text-xl font-semibold mb-4">📊 Dodatkowe informacje</h3>
                        <div className="space-y-4">
                            <div className="bg-blue-800/50 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Temperatura min/max</span>
                                    <span className="font-semibold">
                                        {Math.round(weatherData.current.temp_min)}° / {Math.round(weatherData.current.temp_max)}°
                                    </span>
                                </div>
                            </div>

                            <div className="bg-blue-800/50 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Zachmurzenie</span>
                                    <span className="font-semibold">{weatherData.current.clouds}%</span>
                                </div>
                            </div>

                            <div className="bg-blue-800/50 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Kierunek wiatru</span>
                                    <span className="font-semibold">{weatherData.current.wind.direction}°</span>
                                </div>
                            </div>

                            <div className="bg-blue-800/50 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Kraj</span>
                                    <span className="font-semibold">{weatherData.country}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!locations.length && !loading && query && (
                <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2">Brak wyników</h3>
                    <p className="text-blue-200">Nie znaleziono lokalizacji dla zapytania "{query}"</p>
                    <p className="text-sm text-gray-400 mt-2">Spróbuj użyć innej nazwy lub sprawdź pisownię</p>
                </div>
            )}
        </div>
    );
}
