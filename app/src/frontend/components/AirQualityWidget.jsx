// components/AirQualityWidget.jsx
import React, { useState, useEffect } from 'react';

export default function AirQualityWidget({ city, lat, lon }) {
    const [airData, setAirData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ((city || (lat && lon))) {
            fetchAirQuality();
        }
    }, [city, lat, lon]);

    const fetchAirQuality = async () => {
        setLoading(true);
        try {
            let url = 'http://localhost:5000/api/air-quality?';
            if (city) {
                url += `city=${encodeURIComponent(city)}`;
            } else if (lat && lon) {
                url += `lat=${lat}&lon=${lon}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setAirData(data);
            } else {
                console.error('Błąd pobierania jakości powietrza:', data.error);
            }
        } catch (error) {
            console.error('Błąd połączenia:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-800 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-700 rounded w-1/2"></div>
            </div>
        );
    }

    if (!airData) return null;

    const getAQIColor = (aqi) => {
        const colors = {
            1: 'bg-green-500',
            2: 'bg-yellow-500',
            3: 'bg-orange-500',
            4: 'bg-red-500',
            5: 'bg-purple-500'
        };
        return colors[aqi] || 'bg-gray-500';
    };

    return (
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                🌬️ Jakość powietrza
            </h3>

            <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 rounded-full ${getAQIColor(airData.aqi)} flex items-center justify-center text-white font-bold text-lg`}>
                    {airData.aqi}
                </div>
                <div>
                    <p className="text-xl font-semibold">{airData.description}</p>
                    <p className="text-sm text-gray-400">Indeks AQI</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-gray-400">PM2.5</p>
                    <p className="font-semibold">{airData.components.pm2_5} μg/m³</p>
                </div>
                <div>
                    <p className="text-gray-400">PM10</p>
                    <p className="font-semibold">{airData.components.pm10} μg/m³</p>
                </div>
                <div>
                    <p className="text-gray-400">NO₂</p>
                    <p className="font-semibold">{airData.components.no2} μg/m³</p>
                </div>
                <div>
                    <p className="text-gray-400">O₃</p>
                    <p className="font-semibold">{airData.components.o3} μg/m³</p>
                </div>
            </div>
        </div>
    );
}
