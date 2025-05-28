import React, { useEffect, useState } from 'react';

const cities = [
  { name: 'Bielsko-Biała', country: 'PL' },
  { name: 'Katowice', country: 'PL' },
  { name: 'Warszawa', country: 'PL' },
];

export default function CityList({ units }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCitiesWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        const promises = cities.map(async (c) => {
          const response = await fetch(`http://localhost:5000/api/weather?city=${c.name}&units=${units}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || `Błąd dla ${c.name}`);
          }

          return data;
        });

        const results = await Promise.all(promises);
        setList(results);
      } catch (err) {
        console.error('Błąd pobierania danych miast:', err);
        setError('Nie udało się pobrać danych o miastach');
        setList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCitiesWeather();
  }, [units]);

  if (loading) {
    return (
      <div>
        <h3 className="text-xl font-semibold mb-2">Inne duże miasta</h3>
        <div className="bg-gray-800 rounded-2xl p-6 m-3 shadow-xl">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3 className="text-xl font-semibold mb-2">Inne duże miasta</h3>
        <div className="bg-red-900/20 border border-red-500 rounded-2xl p-6 m-3">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Inne duże miasta</h3>
      {list.length === 0 ? (
        <div className="bg-gray-800 rounded-2xl p-6 m-3 shadow-xl">
          <p className="text-gray-400">Brak danych o miastach</p>
        </div>
      ) : (
        list.map((d, i) => (
          <div key={i} className="bg-gray-800 rounded-2xl p-6 m-3 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                {d.current?.icon && (
                  <img
                    src={`http://openweathermap.org/img/wn/${d.current.icon}@2x.png`}
                    alt={d.current.description || 'Weather icon'}
                    className="w-10 h-10"
                  />
                )}
                <div>
                  <p className="font-medium">{d.city}</p>
                  {d.current?.description && (
                    <p className="text-sm text-gray-400 capitalize">{d.current.description}</p>
                  )}
                </div>
              </div>
              {d.current?.temp && (
                <p className="text-2xl font-bold">
                  {Math.round(d.current.temp)}°{units === 'metric' ? 'C' : 'F'}
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
