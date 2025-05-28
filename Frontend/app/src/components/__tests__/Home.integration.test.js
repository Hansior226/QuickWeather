// src/components/__tests__/Home.integration.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../pages/Home';

// Mock wszystkich komponentów używanych w Home
jest.mock('../../components/WeatherDisplay', () => {
    return function MockWeatherDisplay({ data, city, units }) {
        return (
            <div data-testid="weather-display">
                <h2>{city}</h2>
                <p>{Math.round(data.temp)}°{units === 'metric' ? 'C' : 'F'}</p>
                <p>{data.description}</p>
            </div>
        );
    };
});

jest.mock('../../components/HourlyForecast', () => {
    return function MockHourlyForecast() {
        return <div data-testid="hourly-forecast">Hourly Forecast</div>;
    };
});

jest.mock('../../components/CityList', () => {
    return function MockCityList() {
        return <div data-testid="city-list">City List</div>;
    };
});

jest.mock('../../components/DailyForecast', () => {
    return function MockDailyForecast() {
        return <div data-testid="daily-forecast">Daily Forecast</div>;
    };
});

jest.mock('../../components/AirQualityWidget', () => {
    return function MockAirQualityWidget() {
        return <div data-testid="air-quality-widget">Air Quality</div>;
    };
});

jest.mock('../../components/UVWidget', () => {
    return function MockUVWidget() {
        return <div data-testid="uv-widget">UV Index</div>;
    };
});

jest.mock('../../components/WeatherAlertsWidget', () => {
    return function MockWeatherAlertsWidget() {
        return <div data-testid="weather-alerts-widget">Weather Alerts</div>;
    };
});

jest.mock('../../components/ErrorPopup', () => {
    return function MockErrorPopup({ message, type, onClose }) {
        if (!message) return null;
        return (
            <div data-testid="error-popup" data-type={type}>
                <p>{message}</p>
                <button onClick={onClose}>Zamknij</button>
            </div>
        );
    };
});

// Mock geolocation
const mockGeolocation = {
    getCurrentPosition: jest.fn()
};
global.navigator.geolocation = mockGeolocation;

// Mock fetch
global.fetch = jest.fn();

const HomeWithRouter = () => (
    <BrowserRouter>
        <Home />
    </BrowserRouter>
);

describe('Home Integration Tests', () => {
    beforeEach(() => {
        fetch.mockClear();
        mockGeolocation.getCurrentPosition.mockClear();
        jest.clearAllMocks();
    });

    test('loads weather data on geolocation success', async () => {
        // Mock geolocation success
        mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
            success({
                coords: { latitude: 52.2297, longitude: 21.0122 }
            });
        });

        // Mock API response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                city: 'Warszawa',
                current: {
                    temp: 20.5,
                    feels_like: 19.8,
                    humidity: 65,
                    pressure: 1013,
                    wind: { speed: 3.5, direction: 180 },
                    description: 'bezchmurnie',
                    icon: '01d'
                },
                forecast: [],
                coordinates: { lat: 52.2297, lon: 21.0122 }
            })
        });

        render(<HomeWithRouter />);

        await waitFor(() => {
            expect(screen.getByText('Warszawa')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Sprawdź czy komponenty pogodowe się renderują
        expect(screen.getByTestId('weather-display')).toBeInTheDocument();
        expect(screen.getByTestId('hourly-forecast')).toBeInTheDocument();
    });

    test('handles geolocation error gracefully', async () => {
        mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
            error({ code: 1, message: 'Permission denied' });
        });

        render(<HomeWithRouter />);

        await waitFor(() => {
            expect(screen.getByTestId('error-popup')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Sprawdź czy popup z błędem się pojawił
        expect(screen.getByText(/Dostęp do lokalizacji został zablokowany/)).toBeInTheDocument();
    });

    test('searches for city weather', async () => {
        // Mock initial geolocation failure żeby nie interferował
        mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
            error({ code: 1, message: 'Permission denied' });
        });

        render(<HomeWithRouter />);

        // Poczekaj aż komponent się załaduje
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Wyszukaj miasto...')).toBeInTheDocument();
        });

        // Mock API response dla wyszukiwania
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                city: 'Kraków',
                current: {
                    temp: 18.0,
                    feels_like: 17.0,
                    humidity: 70,
                    pressure: 1010,
                    wind: { speed: 2.5, direction: 90 },
                    description: 'pochmurno',
                    icon: '04d'
                },
                forecast: [],
                coordinates: { lat: 50.0647, lon: 19.9450 }
            })
        });

        const searchInput = screen.getByPlaceholderText('Wyszukaj miasto...');
        const searchButton = screen.getByText('Szukaj');

        fireEvent.change(searchInput, { target: { value: 'Kraków' } });
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText('Kraków')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    test('toggles temperature units', async () => {
        // Mock geolocation success z danymi
        mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
            success({
                coords: { latitude: 52.2297, longitude: 21.0122 }
            });
        });

        // Setup initial weather data
        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                city: 'Warszawa',
                current: {
                    temp: 20.5,
                    feels_like: 19.8,
                    humidity: 65,
                    pressure: 1013,
                    wind: { speed: 3.5, direction: 180 },
                    description: 'bezchmurnie',
                    icon: '01d'
                },
                forecast: [],
                coordinates: { lat: 52.2297, lon: 21.0122 }
            })
        });

        render(<HomeWithRouter />);

        // Poczekaj aż dane się załadują
        await waitFor(() => {
            expect(screen.getByText('°C')).toBeInTheDocument();
        }, { timeout: 3000 });

        const unitsButton = screen.getByText('°C');
        fireEvent.click(unitsButton);

        expect(screen.getByText('°F')).toBeInTheDocument();
    });

    test('shows loading state', async () => {
        // Mock długie ładowanie
        mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
            setTimeout(() => {
                success({
                    coords: { latitude: 52.2297, longitude: 21.0122 }
                });
            }, 100);
        });

        render(<HomeWithRouter />);

        // Sprawdź czy loading indicator się pojawia
        expect(screen.getByText('Ładowanie danych pogodowych...')).toBeInTheDocument();
        expect(screen.getByText('🌀')).toBeInTheDocument();
    });

    test('shows welcome message when no data', () => {
        // Mock geolocation failure
        mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
            error({ code: 1, message: 'Permission denied' });
        });

        render(<HomeWithRouter />);

        // Sprawdź czy welcome message się pojawia
        expect(screen.getByText('Witaj w QuickWeather!')).toBeInTheDocument();
        expect(screen.getByText('🌤️')).toBeInTheDocument();
    });
});
