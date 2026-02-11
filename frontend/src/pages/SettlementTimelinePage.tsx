import React from 'react';
import SettlementTimeline from '../components/visualizations/SettlementTimeline';

const SettlementTimelinePage: React.FC = () => {
  // Sample settlement data - West Bank settlements
  const settlements = [
    { id: '1', name: 'Kfar Etzion', year_established: 1967, latitude: 31.6547, longitude: 35.1089, population: 450, type: 'settlement' as const, status: 'active' as const },
    { id: '2', name: 'Hebron (Kiryat Arba)', year_established: 1968, latitude: 31.5242, longitude: 35.1089, population: 7000, type: 'settlement' as const, status: 'active' as const },
    { id: '3', name: 'Merom Golan', year_established: 1967, latitude: 33.1339, longitude: 35.7731, population: 1800, type: 'settlement' as const, status: 'active' as const },
    { id: '4', name: 'Katzrin', year_established: 1977, latitude: 32.9917, longitude: 35.6869, population: 8000, type: 'settlement' as const, status: 'active' as const },
    { id: '5', name: 'Ariel', year_established: 1978, latitude: 32.1047, longitude: 35.1731, population: 20000, type: 'settlement' as const, status: 'active' as const },
    { id: '6', name: "Ma'ale Adumim", year_established: 1975, latitude: 31.7781, longitude: 35.3039, population: 38000, type: 'settlement' as const, status: 'active' as const },
    { id: '7', name: 'Beitar Illit', year_established: 1985, latitude: 31.6969, longitude: 35.1189, population: 60000, type: 'settlement' as const, status: 'active' as const },
    { id: '8', name: "Modi'in Illit", year_established: 1996, latitude: 31.9333, longitude: 35.0500, population: 77000, type: 'settlement' as const, status: 'active' as const },
    { id: '9', name: 'Elon Moreh', year_established: 1980, latitude: 32.1992, longitude: 35.3078, population: 2000, type: 'settlement' as const, status: 'active' as const },
    { id: '10', name: 'Kedumim', year_established: 1975, latitude: 32.1714, longitude: 35.1625, population: 4500, type: 'settlement' as const, status: 'active' as const },
    { id: '11', name: 'Efrat', year_established: 1983, latitude: 31.6544, longitude: 35.1478, population: 10000, type: 'settlement' as const, status: 'active' as const },
    { id: '12', name: 'Givat Zeev', year_established: 1983, latitude: 31.8583, longitude: 35.1667, population: 18000, type: 'settlement' as const, status: 'active' as const },
    // Outposts (unauthorized settlements)
    { id: '13', name: 'Migron', year_established: 1999, latitude: 31.9047, longitude: 35.2528, population: 300, type: 'outpost' as const, status: 'evacuated' as const },
    { id: '14', name: 'Amona', year_established: 1995, latitude: 31.9333, longitude: 35.2833, population: 200, type: 'outpost' as const, status: 'evacuated' as const },
    { id: '15', name: 'Havat Gilad', year_established: 2002, latitude: 32.2167, longitude: 35.1500, population: 150, type: 'outpost' as const, status: 'active' as const },
    // Industrial zones
    { id: '16', name: 'Barkan Industrial Zone', year_established: 1981, latitude: 32.0833, longitude: 35.1000, population: 0, type: 'industrial_zone' as const, status: 'active' as const },
    { id: '17', name: 'Mishor Adumim', year_established: 1985, latitude: 31.7667, longitude: 35.3000, population: 0, type: 'industrial_zone' as const, status: 'active' as const },
    { id: '18', name: 'Atarot Industrial Zone', year_established: 1970, latitude: 31.8500, longitude: 35.2167, population: 0, type: 'industrial_zone' as const, status: 'active' as const },
    // Military installations
    { id: '19', name: 'Ofer Military Camp', year_established: 1967, latitude: 31.8833, longitude: 35.1167, population: 0, type: 'military' as const, status: 'active' as const },
    { id: '20', name: 'Beit El Military Base', year_established: 1970, latitude: 31.9428, longitude: 35.2278, population: 0, type: 'military' as const, status: 'active' as const },
    // More settlements by decade
    { id: '21', name: 'Shilo', year_established: 1978, latitude: 32.0536, longitude: 35.2903, population: 3500, type: 'settlement' as const, status: 'active' as const },
    { id: '22', name: 'Ofra', year_established: 1975, latitude: 31.9611, longitude: 35.2639, population: 3500, type: 'settlement' as const, status: 'active' as const },
    { id: '23', name: 'Beit El', year_established: 1977, latitude: 31.9428, longitude: 35.2278, population: 6500, type: 'settlement' as const, status: 'active' as const },
    { id: '24', name: 'Neve Yaakov', year_established: 1972, latitude: 31.8383, longitude: 35.2392, population: 21000, type: 'settlement' as const, status: 'active' as const },
    { id: '25', name: 'Pisgat Zeev', year_established: 1982, latitude: 31.8292, longitude: 35.2444, population: 50000, type: 'settlement' as const, status: 'active' as const },
    { id: '26', name: 'Ramot', year_established: 1974, latitude: 31.8083, longitude: 35.1917, population: 45000, type: 'settlement' as const, status: 'active' as const },
    { id: '27', name: 'Gilo', year_established: 1971, latitude: 31.7333, longitude: 35.1833, population: 40000, type: 'settlement' as const, status: 'active' as const },
    { id: '28', name: 'French Hill', year_established: 1969, latitude: 31.7983, longitude: 35.2350, population: 7000, type: 'settlement' as const, status: 'active' as const },
    { id: '29', name: 'Tekoa', year_established: 1977, latitude: 31.6331, longitude: 35.2267, population: 3500, type: 'settlement' as const, status: 'active' as const },
    { id: '30', name: 'Alfei Menashe', year_established: 1983, latitude: 32.1639, longitude: 35.0033, population: 8000, type: 'settlement' as const, status: 'active' as const },
    // 1990s settlements
    { id: '31', name: 'Har Homa', year_established: 1997, latitude: 31.7269, longitude: 35.2286, population: 25000, type: 'settlement' as const, status: 'active' as const },
    { id: '32', name: 'Ramat Shlomo', year_established: 1995, latitude: 31.8083, longitude: 35.2167, population: 20000, type: 'settlement' as const, status: 'active' as const },
    // 2000s and later
    { id: '33', name: 'Leshem', year_established: 2013, latitude: 32.1000, longitude: 35.0833, population: 500, type: 'settlement' as const, status: 'active' as const },
    { id: '34', name: 'Nofei Nehemia', year_established: 2015, latitude: 32.5500, longitude: 35.5500, population: 200, type: 'outpost' as const, status: 'active' as const },
    { id: '35', name: 'Amichai', year_established: 2017, latitude: 31.9333, longitude: 35.2833, population: 300, type: 'settlement' as const, status: 'active' as const },
  ];

  return (
    <div className="min-h-screen py-8" style={{ background: '#FFF5F6' }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>
            Settlement Expansion Timeline
          </h1>
          <p style={{ color: '#8B7355', fontFamily: 'Georgia, serif' }}>
            Visualizing the growth of Israeli settlements in the Occupied Palestinian
            Territories from 1967 to the present day.
          </p>
        </div>

        {/* Context Panel */}
        <div className="p-6 mb-8" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>Historical Context</h2>
          <div className="grid md:grid-cols-2 gap-6" style={{ color: '#5C3D2E' }}>
            <div>
              <h3 className="font-medium mb-2" style={{ color: '#2C1810' }}>International Law</h3>
              <p className="text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                The Fourth Geneva Convention prohibits the transfer of civilian population
                into occupied territory. UN Security Council Resolution 2334 (2016) reaffirmed
                that settlements have "no legal validity" and constitute a "flagrant violation
                under international law."
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2" style={{ color: '#2C1810' }}>Current Status</h3>
              <p className="text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                As of 2024, there are approximately 150 settlements and 128 outposts in the
                West Bank, housing over 700,000 Israeli settlers. East Jerusalem settlements
                house an additional 220,000 settlers.
              </p>
            </div>
          </div>
        </div>

        {/* Main Timeline Component */}
        <SettlementTimeline
          settlements={settlements}
          startYear={1967}
          endYear={2024}
          title="West Bank & East Jerusalem Settlements"
          mapCenter={[31.9, 35.2]}
          mapZoom={9}
        />

        {/* Decade Summary */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>1967-1979</h3>
            <p className="text-sm" style={{ color: '#8B7355', fontFamily: 'Georgia, serif' }}>
              Initial settlement wave following the Six-Day War. Focus on strategic
              locations and areas of religious significance.
            </p>
            <div className="mt-2 text-2xl font-bold" style={{ color: '#C41E3A' }}>
              ~25 settlements
            </div>
          </div>
          <div className="p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>1980-1999</h3>
            <p className="text-sm" style={{ color: '#8B7355', fontFamily: 'Georgia, serif' }}>
              Rapid expansion during Likud governments. Development of large
              suburban settlements near Jerusalem.
            </p>
            <div className="mt-2 text-2xl font-bold" style={{ color: '#C41E3A' }}>
              ~100 settlements
            </div>
          </div>
          <div className="p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>2000-Present</h3>
            <p className="text-sm" style={{ color: '#8B7355', fontFamily: 'Georgia, serif' }}>
              Continued growth despite Oslo Accords. Proliferation of outposts
              and legalization efforts.
            </p>
            <div className="mt-2 text-2xl font-bold" style={{ color: '#C41E3A' }}>
              ~280 sites total
            </div>
          </div>
        </div>

        {/* Sources */}
        <div className="mt-8 p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderRadius: '10px' }}>
          <h3 className="text-sm font-medium mb-2" style={{ color: '#8B7355' }}>Data Sources</h3>
          <ul className="text-xs space-y-1" style={{ color: '#8B7355' }}>
            <li>* Peace Now Settlement Watch</li>
            <li>* B'Tselem - The Israeli Information Center for Human Rights in the Occupied Territories</li>
            <li>* UN Office for the Coordination of Humanitarian Affairs (OCHA)</li>
            <li>* Foundation for Middle East Peace</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SettlementTimelinePage;
