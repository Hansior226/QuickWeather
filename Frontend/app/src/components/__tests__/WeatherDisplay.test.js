// src/components/__tests__/WeatherDisplay.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import WeatherDisplay from '../WeatherDisplay';

const mockWeatherData = {
    temp: 20.5,
    feels_like: 19.8,
    humidity: 65,
    pressure: 1013,
    wind: { speed: 3.5, direction: 180 },
    visibility: 10,
    description: 'bezchmurnie',
    icon: '01d',
    sunrise: '06:30',
    sunset: '18:45'
};

describe('WeatherDisplay', () => {
    test('renders weather data correctly', () => {
        render(
            <WeatherDisplay
                data={mockWeatherData}
                city="Warszawa"
                units="metric"
            />
        );

        expect(screen.getByText('Warszawa')).toBeInTheDocument();
        expect(screen.getByText('21°C')).toBeInTheDocument();
        expect(screen.getByText('bezchmurnie')).toBeInTheDocument();
        expect(screen.getByText('65%')).toBeInTheDocument();
    });

    test('displays imperial units correctly', () => {
        render(
            <WeatherDisplay
                data={mockWeatherData}
                city="Warsaw"
                units="imperial"
            />
        );

        expect(screen.getByText('21°F')).toBeInTheDocument();
    });

    test('shows wind direction when available', () => {
        render(
            <WeatherDisplay
                data={mockWeatherData}
                city="Warszawa"
                units="metric"
            />
        );

        expect(screen.getByText(/180°/)).toBeInTheDocument();
    });
});
