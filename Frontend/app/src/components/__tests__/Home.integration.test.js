import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../pages/Home';

jest.setTimeout(20000);

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

jest.mock('../../hooks/usePopup', () => {
    return function usePopup() {
        return {
            popup: { message: '', type: 'error', show: false },
            showPopup: jest.fn(),
            hidePopup: jest.fn(),
            showError: jest.fn(),
            showWarning: jest.fn(),
            showInfo: jest.fn(),
            showSuccess: jest.fn()
        };
    };
});

const mockGeolocation = {
    getCurrentPosition: jest.fn()
};
global.navigator.geolocation = mockGeolocation;

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
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    test('loads weather data on geolocation success', async () => {
        mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
            setTimeout(() => {
                success({
                    coords: { latitude: 52.2297, longitude: 21.0122 }
                });
            }, 100);
        });

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
        }, { timeout: 8000 });

        expect(screen.getByTestId('weather-display')).toBeInTheDocument();
        expect(screen.getByTestId('hourly-forecast')).toBeInTheDocument();
    }, 15000);

    test('handles geolocation error gracefully', async () => {
        mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
            setTimeout(() => {
                error({ code: 1, message: 'Permission denied' });
            }, 100);
        });

        render(<HomeWithRouter />);

        await waitFor(() => {
            expect(screen.getByText('Witaj w QuickWeather!')).toBeInTheDocument();
        }, { timeout: 8000 });

        expect(screen.getByText('🌤️')).toBeInTheDocument();
        expect(screen.getByText('Wyszukaj miasto lub użyj swojej lokalizacji, aby zobaczyć pogodę.')).toBeInTheDocument();
    }, 15000);

    test('shows welcome message when no data', async () => {
        mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
            setTimeout(() => {
                error({ code: 1, message: 'Permission denied' });
            }, 100);
        });

        render(<HomeWithRouter />);

        await waitFor(() => {
            expect(screen.getByText('Witaj w QuickWeather!')).toBeInTheDocument();
        }, { timeout: 8000 });

        expect(screen.getByText('🌤️')).toBeInTheDocument();
    }, 15000);

    test('searches for city weather', async () => {
        mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
            setTimeout(() => {
                error({ code: 1, message: 'Permission denied' });
            }, 100);
        });

        render(<HomeWithRouter />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Wyszukaj miasto...')).toBeInTheDocument();
            expect(screen.queryByText('Ładowanie danych pogodowych...')).not.toBeInTheDocument();
        }, { timeout: 8000 });

        const searchInput = screen.getByPlaceholderText('Wyszukaj miasto...');
        fireEvent.change(searchInput, { target: { value: 'Kraków' } });

        await waitFor(() => {
            const searchButton = screen.getByRole('button', { name: /szukaj/i });
            expect(searchButton).not.toBeDisabled();
        }, { timeout: 3000 });

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

        const searchButton = screen.getByRole('button', { name: /szukaj/i });
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText('Kraków')).toBeInTheDocument();
        }, { timeout: 8000 });
    }, 15000);

    test('shows loading state', () => {
        mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
        });

        render(<HomeWithRouter />);

        expect(screen.getByText('Ładowanie danych pogodowych...')).toBeInTheDocument();
        expect(screen.getByText('🌀')).toBeInTheDocument();
    });

    test('shows form elements after loading', async () => {
        mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
            setTimeout(() => {
                error({ code: 1, message: 'Permission denied' });
            }, 100);
        });

        render(<HomeWithRouter />);

        await waitFor(() => {
            expect(screen.queryByText('Ładowanie danych pogodowych...')).not.toBeInTheDocument();
        }, { timeout: 8000 });

        expect(screen.getByPlaceholderText('Wyszukaj miasto...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /moja lokalizacja/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /°c/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /szukaj/i })).toBeInTheDocument();
    }, 15000);

    test('button is disabled when input is empty', async () => {
        mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
            setTimeout(() => {
                error({ code: 1, message: 'Permission denied' });
            }, 100);
        });

        render(<HomeWithRouter />);

        await waitFor(() => {
            expect(screen.queryByText('Ładowanie danych pogodowych...')).not.toBeInTheDocument();
        }, { timeout: 8000 });

        const searchButton = screen.getByRole('button', { name: /szukaj/i });
        expect(searchButton).toBeDisabled();

        const searchInput = screen.getByPlaceholderText('Wyszukaj miasto...');
        fireEvent.change(searchInput, { target: { value: 'Kraków' } });

        expect(searchButton).not.toBeDisabled();
    }, 15000);
});