import React from 'react';

export default function HourlyForecast({ hourly, units }) {
  const hours = hourly.slice(0, 12);

  const shortDescriptions = {
    'bezchmurnie': 'Słońce',
    'zachmurzenie małe': 'Lekko chm.',
    'zachmurzenie umiarkowane': 'Chmury',
    'zachmurzenie duże': 'Zachm.',
    'pochmurno': 'Pochmurno',
    'słabe opady deszczu' : "Deszcz",
    'przelotne opady deszczu': 'Deszcz',
    'lekkie opady deszczu': 'Deszcz',
    'umiarkowane opady deszczu': 'Deszcz',
    'silne opady deszczu': 'Ulewa',
    'burza': 'Burza',
    'śnieg': 'Śnieg',
    'lekkie opady śniegu': 'Śnieg',
    'mgła': 'Mgła',
    'zamglenie': 'Zamglenie',
  };

  return (
    <div className="overflow-x-auto flex justify-center">
      <div className="flex space-x-4">
        {hours.map((h, i) => {
          const date = new Date(h.dt * 1000);
          const hour = date.getHours();
          const fullDesc = h.weather[0].description.toLowerCase();
          const description = shortDescriptions[fullDesc] || fullDesc;

          return (
            <div
              key={i}
              className="flex-shrink-0 bg-gray-800 p-4 m-2 mt-5 pt-16 rounded-2xl text-center w-20 h-60">
              <p className="text-sm ">{hour}:00</p>
              <img
                src={`http://openweathermap.org/img/wn/${h.weather[0].icon}@2x.png`}
                alt={fullDesc}
                className="mx-auto w-10 h-10"
              />
              <p className="text-xs text-gray-300">{description}</p>
              <p className="font-semibold">{Math.round(h.main.temp)}°</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
