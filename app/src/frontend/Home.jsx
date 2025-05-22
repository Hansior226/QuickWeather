<<<<<<< Updated upstream
import React, { useState } from "react";

export default function Home() {
  const [city, setCity] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!city) return;

    try {
      const res = await fetch(`http://localhost:5000/api/weather?city=${city}`);
      const data = await res.json();

      if (res.ok && data.alert) {
        alert(`Miasto: ${data.city}\nKomunikat: ${data.alert}`);
      } else {
        alert("Nie udało się pobrać komunikatu.");
      }
    } catch (err) {
      alert("Błąd połączenia z serwerem");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col items-center justify-center p-4">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">QuickWeather</h1>
        <p className="text-lg text-blue-600">Sprawdź pogodę w dowolnym miejscu na świecie</p>
      </header>

      <main className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Wprowadź miasto, kod pocztowy lub współrzędne..."
            className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={city}
            onChange={(e) => setCity(e.target.value)}
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
=======
// import React, { useState, useEffect } from 'react';
// import LargeCard from './components/LargeCard.tsx';
// import SmallCard from './components/SmallCard.tsx';
// import SearchLocation from './components/SearchLocation.tsx';

// export default function Home() {
//   const [city, setCity] = useState('');
//   const [coords, setCoords] = useState(null);
//   const [data, setData] = useState(null);
//   const [units, setUnits] = useState('metric');

//   const fetchWeather = async (params = {}) => {
//     let url = `http://localhost:5000/api/weather?units=${units}`;

//     if (params.lat && params.lon) {
//       url += `&lat=${params.lat}&lon=${params.lon}`;
//     } else if (params.city) {
//       url += `&city=${encodeURIComponent(params.city)}`;
//     } else {
//       alert('Wprowadź miasto lub zezwól na lokalizację.');
//       return;
//     }

//     try {
//       const res = await fetch(url);
//       const json = await res.json();
//       if (res.ok) setData(json);
//       else alert(json.error);
//     } catch {
//       alert('Błąd połączenia z serwerem.');
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (coords) {
//       fetchWeather(coords);
//     } else if (city) {
//       fetchWeather({ city });
//     } else {
//       alert('Wprowadź miasto lub zezwól na lokalizację.');
//     }
//   };

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           const position = {
//             lat: pos.coords.latitude,
//             lon: pos.coords.longitude,
//           };
//           setCoords(position);
//           fetchWeather(position); // Automatyczne pobranie pogody
//         },
//         (err) => {
//           console.warn('Błąd geolokalizacji:', err);
//         }
//       );
//     }
//   }, [units]);

//   // Pobierz aktualną godzinę w formacie 09:43 PM
//   const currentTime = new Date().toLocaleTimeString('pl-PL', {
//     hour: '2-digit',
//     minute: '2-digit',
//     hour12: true,
//   });

//   return (
//     <div className="min-h-screen bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat flex flex-col items-center justify-start p-6">
//       <header className="text-center mb-10">
//         <h1 className="text-4xl font-bold text-blue-800 mb-2">QuickWeather</h1>
//         <p className="text-lg text-blue-600">Sprawdź pogodę w dowolnym miejscu na świecie</p>
//       </header>
//       <SearchLocation
//         city={city}
//         setCity={setCity}
//         coords={coords}
//         setCoords={setCoords}
//         units={units}
//         handleSubmit={handleSubmit}
//       />
//       {data && (
//         <div className="w-full max-w-6xl text-gray-150 p-10 flex-grow">
//           <div className="space-x-3 text-right mb-5">
//             <button
//               className="bg-gray-150 rounded-full w-10 h-10 text-darkblue font-bold text-xl"
//               onClick={() => {
//                 setUnits('metric');
//                 if (coords) fetchWeather(coords);
//                 else if (city) fetchWeather({ city });
//               }}
//             >
//               °C
//             </button>
//             <button
//               className="bg-[#585676] rounded-full w-10 h-10 text-gray-150 font-bold text-xl"
//               onClick={() => {
//                 setUnits('imperial');
//                 if (coords) fetchWeather(coords);
//                 else if (city) fetchWeather({ city });
//               }}
//             >
//               °F
//             </button>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 my-5 gap-10 justify-center">
//             {data.forecast?.daily?.slice(0, 2).map((day, index) => (
//               <SmallCard
//                 key={index}
//                 dayTitle={day.day || `Day ${index + 1}`}
//                 img={day.icon || 'Clear'}
//                 max={day.temp_max || 0}
//                 min={day.temp_min || 0}
//                 temp={units === 'metric' ? 'C' : 'F'}
//               />
//             ))}
//           </div>

//           <div className="my-10">
//             <h3 className="text-2xl font-bold mb-5">Today's Highlights</h3>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 justify-center">
//               <LargeCard
//                 title="Wind Status"
//                 num={data.current?.wind_speed || 0}
//                 desc={units === 'metric' ? 'm/s' : 'mph'}
//               >
//                 <div className="flex justify-between space-x-5 items-center">
//                   <div className="bg-gray-500 rounded-full w-[30px] h-[30px] flex justify-center items-center">
//                     <i className="fas fa-location-arrow"></i>
//                   </div>
//                   <p className="text-gray-150 text-sm">WSW</p>
//                 </div>
//               </LargeCard>

//               <LargeCard
//                 title="Humidity"
//                 num={data.current?.humidity || 0}
//                 desc="%"
//               >
//                 <div className="self-stretch text-gray-250 text-xs space-y-1">
//                   <div className="flex justify-between space-x-5 items-center px-1">
//                     <p>0</p>
//                     <p>50</p>
//                     <p>100</p>
//                   </div>
//                   <div className="w-full h-2 bg-gray-150 rounded-full overflow-hidden">
//                     <div
//                       className="bg-[#FFEC65] h-2"
//                       style={{ width: `${data.current?.humidity || 0}%` }}
//                     ></div>
//                   </div>
//                   <p className="text-right">%</p>
//                 </div>
//               </LargeCard>

//               <LargeCard
//                 title="Visibility"
//                 num={data.current?.visibility || 0}
//                 desc={units === 'metric' ? 'km' : 'miles'}
//               />

//               <LargeCard
//                 title="Air Pressure"
//                 num={data.current?.pressure || 0}
//                 desc="mb"
//               />
//             </div>
//           </div>
//         </div>
//       )}
//       <footer className="mt-10 text-sm text-blue-700">© {new Date().getFullYear()} QuickWeather</footer>
//     </div>
//   );
// }
>>>>>>> Stashed changes
