// src/components/WeatherDisplay.jsx
import React from 'react';

export default function WeatherDisplay({ data, city, units }) {
  const iconUrl = `http://openweathermap.org/img/wn/${data.icon}@4x.png`;
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <img src={iconUrl} alt={data.description} className="w-32 h-32" />
      <h2 className="text-2xl font-medium">{city}</h2>
      <p className="text-5xl font-bold">
        {Math.round(data.temp)}°{units === 'metric' ? 'C' : 'F'}
      </p>
      <p className="capitalize">{data.description}</p>
      <p className="text-sm text-gray-400">
        Wilgotoność {Math.round(data.humidity)}% | Wiatr {data.wind} {units === 'metric' ? 'm/s' : 'mph'}
      </p>
    </div>
  );
}
