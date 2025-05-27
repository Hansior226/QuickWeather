import React from 'react';

export default function DailyForecast({ daily, units }) {
  const days = daily.filter((_, i) => i % 8 === 4).slice(0, 5);

  // Zakres temperatur w zależności od jednostek
  const minTemp = units === 'metric' ? -20 : 0;
  const maxTemp = units === 'metric' ? 40 : 110;
  const range = maxTemp - minTemp;

  return (
    <>
      <h3 className="text-xl font-semibold mb-2">Pogoda 5-dniowa</h3>
      <div className="bg-gray-800 rounded-2xl p-6 m-4 shadow-xl space-y-4">
        {days.map((d, i) => {
          const date = new Date(d.dt * 1000);
          const dayName = date.toLocaleDateString('pl-PL', { weekday: 'short' });

          let tempPercent = ((d.main.temp - minTemp) / range) * 100;
          tempPercent = Math.min(Math.max(tempPercent, 0), 100);

          return (
            <div key={i} className="flex items-center justify-between">
              <p className="w-16">{dayName}</p>
              <img
                src={`http://openweathermap.org/img/wn/${d.weather[0].icon}.png`}
                alt=""
                className="w-8 h-8"
              />
              <p className="font-semibold">
                {Math.round(d.main.temp)}°{units === 'metric' ? 'C' : 'F'}
              </p>
              <div className="h-1 flex-1 bg-gray-700 rounded-full ml-4">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${tempPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
