// pages/CompareCity.jsx
import React, { useState } from 'react';

export default function CompareCity() {
    const [cities, setCities] = useState(['']);
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState('metric');

    const addCity = () => {
        if (cities.length < 6) {
            setCities([...cities, '']);
        }
    };

    const removeCity = (index) => {
        if (cities.length > 1) {
            const newCities = cities.filter((_, i) => i !== index);
            setCities(newCities);
        }
    };

    const updateCity = (index, value) => {
        const newCities = [...cities];
        newCities[index] = value;
        setCities(newCities);
    };

    const handleCompare = async () => {
        const validCities = cities.filter(city => city.trim());
        if (validCities.length < 2) {
            alert('Wprowadź przynajmniej 2 miasta do porównania');
            return;
        }

        setLoading(true);
        try {
            const cityParams = validCities.map(city => `cities=${encodeURIComponent(city)}`).join('&');
            const response = await fetch(`http://localhost:5000/api/weather/compare?${cityParams}&units=${units}`);
            const data = await response.json();

            if (response.ok) {
                setComparison(data);
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Błąd połączenia z serwerem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <h1 className="text-3xl font-bold mb-4 flex items-center">
                    📊 Porównaj miasta
                </h1>
                <p className="text-blue-200 mb-6">
                    Porównaj pogodę w różnych miastach jednocześnie. Możesz dodać do 6 miast.
                </p>

                <div className="space-y-4">
                    {cities.map((city, index) => (
                        <div key={index} className="flex space-x-2">
                            <input
                                type="text"
                                placeholder={`Miasto ${index + 1}...`}
                                className="flex-1 px-4 py-3 bg-blue-800/70 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-blue-200"
                                value={city}
                                onChange={(e) => updateCity(index, e.target.value)}
                            />
                            {cities.length > 1 && (
                                <button
                                    onClick={() => removeCity(index)}
                                    className="px-3 py-3 bg-red-600 rounded-lg hover:bg-red-500 transition"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}

                    <div className="flex space-x-2">
                        {cities.length < 6 && (
                            <button
                                onClick={addCity}
                                className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500 transition"
                            >
                                + Dodaj miasto
                            </button>
                        )}
                        <button
                            onClick={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
                            className="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-600 transition"
                        >
                            °{units === 'metric' ? 'C' : 'F'}
                        </button>
                        <button
                            onClick={handleCompare}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
                        >
                            {loading ? 'Porównuję...' : 'Porównaj'}
                        </button>
                    </div>
                </div>
            </div>

            {comparison && (
                <div className="space-y-6">
                    {comparison.stats && (
                        <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                            <h3 className="text-xl font-semibold mb-4">📈 Statystyki</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-red-400">{comparison.stats.hottest.temp}°</p>
                                    <p className="text-sm text-gray-400">Najcieplej</p>
                                    <p className="text-sm">{comparison.stats.hottest.city}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-400">{comparison.stats.coldest.temp}°</p>
                                    <p className="text-sm text-gray-400">Najchłodniej</p>
                                    <p className="text-sm">{comparison.stats.coldest.city}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-yellow-400">{comparison.stats.avg_temp}°</p>
                                    <p className="text-sm text-gray-400">Średnia</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-purple-400">{comparison.stats.temp_range}°</p>
                                    <p className="text-sm text-gray-400">Różnica</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {comparison.comparison.map((city, index) => (
                            <div key={index} className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                                {city.error ? (
                                    <div className="text-center">
                                        <p className="text-red-400 font-semibold">{city.city}</p>
                                        <p className="text-sm text-gray-400">{city.error}</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="flex items-center justify-center space-x-2 mb-4">
                                            <img
                                                src={`http://openweathermap.org/img/wn/${city.icon}@2x.png`}
                                                alt={city.description}
                                                className="w-12 h-12"
                                            />
                                            <div>
                                                <h3 className="text-lg font-semibold">{city.city}</h3>
                                                <p className="text-sm text-gray-400">{city.country}</p>
                                            </div>
                                        </div>

                                        <p className="text-3xl font-bold mb-2">{city.temp}°</p>
                                        <p className="text-sm text-gray-400 mb-4 capitalize">{city.description}</p>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-400">Odczuwalna</p>
                                                <p className="font-semibold">{city.feels_like}°</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Wilgotność</p>
                                                <p className="font-semibold">{city.humidity}%</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Wiatr</p>
                                                <p className="font-semibold">{city.wind_speed} {units === 'metric' ? 'm/s' : 'mph'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Zachmurzenie</p>
                                                <p className="font-semibold">{city.clouds}%</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
