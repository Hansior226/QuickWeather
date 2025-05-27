import React, { useEffect, useState } from 'react';

const cities = [
  { name: 'Bielsko-Biała', country: 'PL' },
  { name: 'Katowice', country: 'PL' },
  { name: 'Warszawa', country: 'PL' },
];

export default function CityList({ units }) {
  const [list, setList] = useState([]);

  useEffect(() => {
    Promise.all(
      cities.map(c =>
        fetch(`http://localhost:5000/api/weather?city=${c.name}&units=${units}`)
          .then(r => r.json())
      )
    ).then(setList);
  }, [units]);

  return (
    <>
      <h3 className="text-xl font-semibold mb-2">Inne duże miasta</h3>
      {list.map((d, i) => (
    <div className="bg-gray-800 rounded-2xl p-6 m-3 shadow-xl space-y-4">
        <div key={i} className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img
              src={`http://openweathermap.org/img/wn/${d.current.icon}@2x.png`}
              alt={d.current.description}
              className="w-10 h-10"
            />
            <div>
              <p>{d.city}</p>
              <p className="text-sm text-gray-400 capitalize">{d.current.description}</p>
            </div>
          </div>
          <p className="text-2xl font-bold">{Math.round(d.current.temp)}°</p>
        </div>
    </div>
      ))}
    </>
  );
}
