import React from 'react';

export default function WeatherDisplay({ data, city }) {
  const iconUrl = `http://openweathermap.org/img/wn/${data.icon}@2x.png`;
  return (
    <div className="text-center my-4">
      <img src={iconUrl} alt={data.description} className="mx-auto" />
      <h2 className="text-3xl font-semibold mb-2">{city}</h2>
      <h3 className="text-3xl font-bold">{Math.round(data.temp)}°</h3>
      <p className="capitalize">{data.description}</p>
      <p>Wilgotność: {data.humidity}% | Wiatr: {data.wind} m/s</p>
      <p>Ciśnienie: {data.pressure} hPa</p>
    </div>
  );
}
