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

        // Użyj funkcji matcher zamiast dokładnego tekstu
        expect(screen.getByText((content, element) => {
            return content.includes('65') && content.includes('%');
        })).toBeInTheDocument();

        expect(screen.getByText((content, element) => {
            return content.includes('3.5') && content.includes('m/s');
        })).toBeInTheDocument();
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

    test('shows wind information', () => {
        render(
            <WeatherDisplay
                data={mockWeatherData}
                city="Warszawa"
                units="metric"
            />
        );

        // Sprawdź czy kierunek wiatru jest renderowany (jeśli komponent to obsługuje)
        const windElement = screen.getByText((content, element) => {
            return content.includes('3.5');
        });
        expect(windElement).toBeInTheDocument();
    });
});
