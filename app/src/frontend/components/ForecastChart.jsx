import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

export default function ForecastChart({ forecast, units }) {
  const labels = forecast.filter((_, i) => i % 8 === 4).map(item => {
    const date = new Date(item.dt * 1000);
    return date.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric' });
  });
  const temps = forecast.filter((_, i) => i % 8 === 4).map(item => Math.round(item.main.temp));

  const data = {
    labels,
    datasets: [
      { label: `Temp. (°${units === 'metric' ? 'C' : 'F'})`, data: temps, tension: 0.4 }
    ]
  };

  return <Line data={data} className="my-4" />;
}