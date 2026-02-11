import { useState, useMemo } from "react";
import HeatmapLayer from "../components/visualizations/HeatmapLayer";

type DataCategory = "protests" | "massacres" | "strikes" | "revolutions";

// Sample data - in production this would come from the API
const SAMPLE_DATA = {
  protests: [
    { lat: 40.7128, lon: -74.0060, name: "Stonewall Uprising", year: 1969, intensity: 0.9 },
    { lat: 48.8566, lon: 2.3522, name: "May 68 Protests", year: 1968, intensity: 1 },
    { lat: 52.5200, lon: 13.4050, name: "Berlin Wall Protests", year: 1989, intensity: 0.95 },
    { lat: 39.9042, lon: 116.4074, name: "Tiananmen Square", year: 1989, intensity: 1 },
    { lat: -33.8688, lon: 151.2093, name: "Sydney Anti-War March", year: 2003, intensity: 0.7 },
    { lat: 51.5074, lon: -0.1278, name: "Poll Tax Riots", year: 1990, intensity: 0.85 },
    { lat: 41.9028, lon: 12.4964, name: "Hot Autumn Strikes", year: 1969, intensity: 0.8 },
    { lat: 34.0522, lon: -118.2437, name: "LA Uprising", year: 1992, intensity: 0.9 },
    { lat: 19.4326, lon: -99.1332, name: "Tlatelolco Massacre", year: 1968, intensity: 1 },
    { lat: -23.5505, lon: -46.6333, name: "Diretas Ja Movement", year: 1984, intensity: 0.75 },
    { lat: 55.7558, lon: 37.6173, name: "Moscow Protests", year: 1991, intensity: 0.85 },
    { lat: 30.0444, lon: 31.2357, name: "Tahrir Square", year: 2011, intensity: 1 },
    { lat: 33.8886, lon: 35.4955, name: "Cedar Revolution", year: 2005, intensity: 0.8 },
    { lat: -34.6037, lon: -58.3816, name: "Argentinazo", year: 2001, intensity: 0.9 },
    { lat: 50.4501, lon: 30.5234, name: "Maidan Revolution", year: 2014, intensity: 0.95 },
  ],
  massacres: [
    { lat: 31.7683, lon: 35.2137, name: "Deir Yassin Massacre", year: 1948, intensity: 1 },
    { lat: 15.5007, lon: 32.5599, name: "Sharpeville Massacre", year: 1960, intensity: 0.9 },
    { lat: 12.9716, lon: 77.5946, name: "Jallianwala Bagh", year: 1919, intensity: 1 },
    { lat: -2.5, lon: 140.7, name: "Biak Massacre", year: 1998, intensity: 0.8 },
    { lat: 6.5244, lon: 3.3792, name: "Lekki Toll Gate", year: 2020, intensity: 0.85 },
    { lat: -6.2088, lon: 106.8456, name: "May 1998 Riots", year: 1998, intensity: 0.95 },
    { lat: 23.8103, lon: 90.4125, name: "Operation Searchlight", year: 1971, intensity: 1 },
    { lat: 13.7563, lon: 100.5018, name: "Thammasat Massacre", year: 1976, intensity: 0.9 },
  ],
  strikes: [
    { lat: 53.4084, lon: -2.9916, name: "Liverpool Dock Strike", year: 1995, intensity: 0.7 },
    { lat: 41.8781, lon: -87.6298, name: "Haymarket Affair", year: 1886, intensity: 1 },
    { lat: 51.4545, lon: -2.5879, name: "Bristol Bus Boycott", year: 1963, intensity: 0.65 },
    { lat: 54.5973, lon: -5.9301, name: "Belfast Shipyard Strike", year: 1919, intensity: 0.8 },
    { lat: 50.0647, lon: 19.9450, name: "Solidarity Strikes", year: 1980, intensity: 0.95 },
    { lat: 37.7749, lon: -122.4194, name: "SF General Strike", year: 1934, intensity: 0.9 },
    { lat: 45.4642, lon: 9.1900, name: "Milan General Strike", year: 1943, intensity: 0.85 },
    { lat: -33.9249, lon: 18.4241, name: "Cape Town Dockworkers", year: 1919, intensity: 0.75 },
  ],
  revolutions: [
    { lat: 59.9311, lon: 30.3609, name: "Russian Revolution", year: 1917, intensity: 1 },
    { lat: 23.1136, lon: -82.3666, name: "Cuban Revolution", year: 1959, intensity: 1 },
    { lat: 21.0285, lon: 105.8542, name: "August Revolution", year: 1945, intensity: 0.95 },
    { lat: 31.2304, lon: 121.4737, name: "Chinese Revolution", year: 1949, intensity: 1 },
    { lat: 14.5995, lon: 120.9842, name: "People Power", year: 1986, intensity: 0.9 },
    { lat: 35.6762, lon: 51.4241, name: "Iranian Revolution", year: 1979, intensity: 1 },
    { lat: 12.1150, lon: -86.2362, name: "Sandinista Revolution", year: 1979, intensity: 0.9 },
    { lat: 15.3694, lon: 44.1910, name: "North Yemen Revolution", year: 1962, intensity: 0.8 },
    { lat: 9.1450, lon: 40.4897, name: "Ethiopian Revolution", year: 1974, intensity: 0.85 },
  ],
};

export default function HeatmapPage() {
  const [category, setCategory] = useState<DataCategory>("protests");
  const [yearRange, setYearRange] = useState<[number, number]>([1900, 2024]);

  const filteredData = useMemo(() => {
    const data = SAMPLE_DATA[category];
    return data.filter((p) => {
      if (!p.year) return true;
      return p.year >= yearRange[0] && p.year <= yearRange[1];
    });
  }, [category, yearRange]);

  const categories: { id: DataCategory; label: string; color: string }[] = [
    { id: "protests", label: "Protests & Uprisings", color: "blue" },
    { id: "massacres", label: "Massacres & Violence", color: "red" },
    { id: "strikes", label: "Labor Strikes", color: "amber" },
    { id: "revolutions", label: "Revolutions", color: "green" },
  ];

  const colorScheme = category === "massacres" ? "violence" :
                      category === "protests" ? "protest" : "neutral";

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF5F6' }}>
      <div className="py-12 border-b" style={{ background: 'linear-gradient(to right, rgba(196, 30, 58, 0.08), #FFF5F6)', borderColor: '#E8C8C8' }}>
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#8B1A1A' }}>Global Resistance Heatmap</h1>
          <p className="text-lg" style={{ color: '#5C3D2E' }}>
            Visualize the geography of protests, strikes, and revolutionary movements
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center gap-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: category === c.id ? '#C41E3A' : 'rgba(196, 30, 58, 0.08)',
                  color: category === c.id ? '#FFFFFF' : '#C41E3A',
                  border: category === c.id ? '1px solid #C41E3A' : '1px solid rgba(196, 30, 58, 0.3)'
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm" style={{ color: '#5C3D2E' }}>Year Range:</label>
            <input
              type="number"
              min="1800"
              max="2024"
              value={yearRange[0]}
              onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
              className="w-20 px-2 py-1 rounded"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E8C8C8',
                color: '#2C1810'
              }}
            />
            <span style={{ color: '#8B7355' }}>-</span>
            <input
              type="number"
              min="1800"
              max="2024"
              value={yearRange[1]}
              onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
              className="w-20 px-2 py-1 rounded"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E8C8C8',
                color: '#2C1810'
              }}
            />
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8C8C8',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(139, 26, 26, 0.08)'
        }}>
          <HeatmapLayer
            points={filteredData}
            title={categories.find((c) => c.id === category)?.label || ""}
            colorScheme={colorScheme}
            initialZoom={2}
            initialCenter={[10, 30]}
          />
        </div>

        <div className="mt-6 rounded-lg overflow-hidden" style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8C8C8',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(139, 26, 26, 0.08)'
        }}>
          <div className="p-4 border-b" style={{ borderColor: '#E8C8C8' }}>
            <h3 className="text-lg font-semibold" style={{ color: '#8B1A1A' }}>Events ({filteredData.length})</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'rgba(196, 30, 58, 0.06)' }}>
                <tr>
                  <th className="px-4 py-2 text-left text-sm" style={{ color: '#8B1A1A' }}>Name</th>
                  <th className="px-4 py-2 text-left text-sm" style={{ color: '#8B1A1A' }}>Year</th>
                  <th className="px-4 py-2 text-left text-sm" style={{ color: '#8B1A1A' }}>Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: '1px solid #E8C8C8'
                    }}
                    className="hover:bg-red-50"
                  >
                    <td className="px-4 py-2" style={{ color: '#2C1810' }}>{item.name}</td>
                    <td className="px-4 py-2" style={{ color: '#5C3D2E' }}>{item.year}</td>
                    <td className="px-4 py-2 text-sm" style={{ color: '#8B7355' }}>
                      {item.lat.toFixed(2)}, {item.lon.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
