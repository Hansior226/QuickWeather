// Frontend/app/src/App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock wszystkich komponentów stron żeby test był szybki
jest.mock('./pages/Home', () => {
  return function MockHome() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

jest.mock('./pages/AirQuality', () => {
  return function MockAirQuality() {
    return <div data-testid="air-quality-page">Air Quality Page</div>;
  };
});

jest.mock('./components/Navbar', () => {
  return function MockNavbar() {
    return <nav data-testid="navbar">QuickWeather Navbar</nav>;
  };
});

describe('App', () => {
  test('renders without crashing', () => {
    render(<App />);

    // Sprawdź czy aplikacja się renderuje
    expect(document.body).toBeInTheDocument();
  });

  test('renders navbar', () => {
    render(<App />);

    // Sprawdź czy navbar się renderuje
    const navbar = screen.getByTestId('navbar');
    expect(navbar).toBeInTheDocument();
  });

  test('renders main content container', () => {
    render(<App />);

    // Sprawdź czy main container istnieje
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('container', 'mx-auto', 'px-4', 'py-6');
  });

  test('renders home page by default', () => {
    render(<App />);

    // Sprawdź czy strona główna się renderuje na route "/"
    const homePage = screen.getByTestId('home-page');
    expect(homePage).toBeInTheDocument();
  });

  test('has proper CSS classes for layout', () => {
    render(<App />);

    // Sprawdź czy główny div ma odpowiednie klasy
    const appContainer = document.querySelector('.min-h-screen');
    expect(appContainer).toBeInTheDocument();
    expect(appContainer).toHaveClass(
      'min-h-screen',
      'bg-gradient-to-br',
      'from-blue-900',
      'via-blue-800',
      'to-blue-700',
      'text-gray-100'
    );
  });

  test('has router functionality', () => {
    render(<App />);

    // Sprawdź czy Router działa - powinna być strona główna
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
