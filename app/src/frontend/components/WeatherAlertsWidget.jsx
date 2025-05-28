// components/WeatherAlertsWidget.jsx
import React, { useState, useEffect } from 'react';

export default function WeatherAlertsWidget({ city, lat, lon }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ((city || (lat && lon))) {
            fetchAlerts();
        }
    }, [city, lat, lon]);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            let url = 'http://localhost:5000/api/weather-alerts?';
            if (city) {
                url += `city=${encodeURIComponent(city)}`;
            } else if (lat && lon) {
                url += `lat=${lat}&lon=${lon}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setAlerts(data.alerts || []);
            } else {
                console.error('Błąd pobierania alertów:', data.error);
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
                <div className="h-8 bg-gray-700 rounded w-full"></div>
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    ✅ Ostrzeżenia
                </h3>
                <p className="text-green-400">Brak aktywnych ostrzeżeń pogodowych</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                ⚠️ Ostrzeżenia ({alerts.length})
            </h3>

            <div className="space-y-3">
                {alerts.map((alert, index) => (
                    <div
                        key={alert.id || index}
                        className="p-3 rounded-lg border-l-4"
                        style={{
                            backgroundColor: `${alert.color}20`,
                            borderLeftColor: alert.color
                        }}
                    >
                        <div className="flex items-start space-x-2">
                            <span className="text-lg">{alert.icon}</span>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{alert.title}</p>
                                <p className="text-xs text-gray-300 mt-1">{alert.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
