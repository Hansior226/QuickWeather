// pages/WeatherAlerts.jsx
import React, { useState } from 'react';
import WeatherAlertsWidget from '../components/WeatherAlertsWidget';

export default function WeatherAlerts() {
    const [city, setCity] = useState('');
    const [searchCity, setSearchCity] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (city.trim()) {
            setSearchCity(city.trim());
        }
    };

    const alertTypes = [
        {
            type: 'temperature',
            icon: '🌡️',
            title: 'Ostrzeżenia temperaturowe',
            description: 'Upały powyżej 35°C lub mrozy poniżej -15°C',
            color: '#ff4444'
        },
        {
            type: 'wind',
            icon: '💨',
            title: 'Ostrzeżenia wiatrowe',
            description: 'Silny wiatr powyżej 15 m/s',
            color: '#ff8800'
        },
        {
            type: 'storm',
            icon: '⛈️',
            title: 'Ostrzeżenia burzowe',
            description: 'Burze z piorunami i gradem',
            color: '#8844ff'
        },
        {
            type: 'precipitation',
            icon: '🌧️',
            title: 'Ostrzeżenia opadowe',
            description: 'Intensywne opady deszczu lub śniegu',
            color: '#0088ff'
        },
        {
            type: 'comfort',
            icon: '💧',
            title: 'Komfort pogodowy',
            description: 'Wysoka wilgotność lub duchota',
            color: '#00aa88'
        },
        {
            type: 'pressure',
            icon: '📉',
            title: 'Ciśnienie atmosferyczne',
            description: 'Niskie ciśnienie poniżej 1000 hPa',
            color: '#aa6600'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <h1 className="text-3xl font-bold mb-4 flex items-center">
                    ⚠️ Ostrzeżenia meteorologiczne
                </h1>
                <p className="text-blue-200 mb-6">
                    Sprawdź aktualne ostrzeżenia pogodowe dla wybranego miasta. System automatycznie analizuje warunki meteorologiczne.
                </p>

                <form onSubmit={handleSubmit} className="flex space-x-4">
                    <input
                        type="text"
                        placeholder="Wprowadź nazwę miasta..."
                        className="flex-1 px-4 py-3 bg-blue-800/70 border border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-blue-200"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
                    >
                        Sprawdź
                    </button>
                </form>
            </div>

            {searchCity && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <WeatherAlertsWidget city={searchCity} />

                    <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                        <h3 className="text-xl font-semibold mb-4">📋 Rodzaje ostrzeżeń</h3>
                        <div className="space-y-3">
                            {alertTypes.map((alert, index) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-3 p-3 bg-blue-800/50 rounded-lg border-l-4"
                                    style={{ borderLeftColor: alert.color }}
                                >
                                    <span className="text-2xl">{alert.icon}</span>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-white mb-1">{alert.title}</h4>
                                        <p className="text-sm text-gray-300">{alert.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-blue-700/70 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-semibold mb-4">🎯 Poziomy ostrzeżeń</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                            <span className="font-semibold">Niski</span>
                        </div>
                        <p className="text-sm text-gray-300">Warunki mogą być niewygodne, ale nie stanowią zagrożenia</p>
                    </div>

                    <div className="bg-orange-500/20 border border-orange-500 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                            <span className="font-semibold">Średni</span>
                        </div>
                        <p className="text-sm text-gray-300">Zalecana ostrożność i ograniczenie aktywności na zewnątrz</p>
                    </div>

                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                            <span className="font-semibold">Wysoki</span>
                        </div>
                        <p className="text-sm text-gray-300">Niebezpieczne warunki - unikaj wychodzenia z domu</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
