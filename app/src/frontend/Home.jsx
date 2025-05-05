import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col items-center justify-center p-4">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">QuickWeather</h1>
        <p className="text-lg text-blue-600">Sprawdź pogodę w dowolnym miejscu na świecie</p>
      </header>

      <main className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Wprowadź miasto, kod pocztowy lub współrzędne..."
            className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sprawdź pogodę
          </button>
        </form>
      </main>

      <footer className="mt-10 text-sm text-blue-700">
        &copy; {new Date().getFullYear()} QuickWeather
      </footer>
    </div>
  );
}
