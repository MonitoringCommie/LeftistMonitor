import { useState, useMemo } from "react";
import SankeyDiagram from "../components/visualizations/SankeyDiagram";

type TimeRange = "2020s" | "2010s" | "2000s" | "1990s" | "historical";

// Sample refugee flow data
const REFUGEE_DATA = {
  "2020s": {
    nodes: [
      { name: "Ukraine" },
      { name: "Syria" },
      { name: "Afghanistan" },
      { name: "Venezuela" },
      { name: "Myanmar" },
      { name: "South Sudan" },
      { name: "Poland" },
      { name: "Germany" },
      { name: "Turkey" },
      { name: "Colombia" },
      { name: "Bangladesh" },
      { name: "Uganda" },
      { name: "USA" },
      { name: "Pakistan" },
    ],
    links: [
      { source: 0, target: 6, value: 1500000 },  // Ukraine -> Poland
      { source: 0, target: 7, value: 1100000 },  // Ukraine -> Germany
      { source: 1, target: 8, value: 3600000 },  // Syria -> Turkey
      { source: 1, target: 7, value: 800000 },   // Syria -> Germany
      { source: 2, target: 13, value: 1400000 }, // Afghanistan -> Pakistan
      { source: 2, target: 8, value: 120000 },   // Afghanistan -> Turkey
      { source: 3, target: 9, value: 2500000 },  // Venezuela -> Colombia
      { source: 3, target: 12, value: 500000 },  // Venezuela -> USA
      { source: 4, target: 10, value: 950000 },  // Myanmar -> Bangladesh
      { source: 5, target: 11, value: 900000 },  // South Sudan -> Uganda
    ],
    description: "Major refugee movements following the Ukraine war (2022), continued Syrian and Afghan displacement, and Venezuelan exodus."
  },
  "2010s": {
    nodes: [
      { name: "Syria" },
      { name: "Afghanistan" },
      { name: "Somalia" },
      { name: "South Sudan" },
      { name: "Myanmar" },
      { name: "Turkey" },
      { name: "Lebanon" },
      { name: "Jordan" },
      { name: "Germany" },
      { name: "Kenya" },
      { name: "Uganda" },
      { name: "Bangladesh" },
    ],
    links: [
      { source: 0, target: 5, value: 3500000 },  // Syria -> Turkey
      { source: 0, target: 6, value: 1000000 },  // Syria -> Lebanon
      { source: 0, target: 7, value: 660000 },   // Syria -> Jordan
      { source: 0, target: 8, value: 600000 },   // Syria -> Germany
      { source: 1, target: 5, value: 150000 },   // Afghanistan -> Turkey
      { source: 2, target: 9, value: 300000 },   // Somalia -> Kenya
      { source: 3, target: 10, value: 850000 },  // South Sudan -> Uganda
      { source: 4, target: 11, value: 900000 },  // Myanmar -> Bangladesh
    ],
    description: "The Syrian civil war created the largest refugee crisis since WWII, with millions fleeing to neighboring countries and Europe."
  },
  "2000s": {
    nodes: [
      { name: "Iraq" },
      { name: "Afghanistan" },
      { name: "Sudan" },
      { name: "Somalia" },
      { name: "DR Congo" },
      { name: "Syria" },
      { name: "Jordan" },
      { name: "Pakistan" },
      { name: "Iran" },
      { name: "Chad" },
      { name: "Kenya" },
      { name: "Tanzania" },
    ],
    links: [
      { source: 0, target: 5, value: 1200000 },  // Iraq -> Syria
      { source: 0, target: 6, value: 500000 },   // Iraq -> Jordan
      { source: 1, target: 7, value: 2000000 },  // Afghanistan -> Pakistan
      { source: 1, target: 8, value: 900000 },   // Afghanistan -> Iran
      { source: 2, target: 9, value: 250000 },   // Sudan -> Chad
      { source: 3, target: 10, value: 280000 },  // Somalia -> Kenya
      { source: 4, target: 11, value: 400000 },  // DR Congo -> Tanzania
    ],
    description: "Post-9/11 wars in Iraq and Afghanistan caused massive displacement, while conflicts in Africa continued to generate refugees."
  },
  "1990s": {
    nodes: [
      { name: "Rwanda" },
      { name: "Bosnia" },
      { name: "Kosovo" },
      { name: "Afghanistan" },
      { name: "DR Congo" },
      { name: "Tanzania" },
      { name: "Germany" },
      { name: "Albania" },
      { name: "Pakistan" },
      { name: "Iran" },
    ],
    links: [
      { source: 0, target: 5, value: 2000000 },  // Rwanda -> Tanzania (and Zaire)
      { source: 0, target: 4, value: 1500000 },  // Rwanda -> DR Congo
      { source: 1, target: 6, value: 350000 },   // Bosnia -> Germany
      { source: 2, target: 7, value: 450000 },   // Kosovo -> Albania
      { source: 3, target: 8, value: 2600000 },  // Afghanistan -> Pakistan
      { source: 3, target: 9, value: 1400000 },  // Afghanistan -> Iran
    ],
    description: "The Rwandan genocide, Yugoslav wars, and ongoing Afghan conflict defined refugee movements of the 1990s."
  },
  "historical": {
    nodes: [
      { name: "Palestine (1948)" },
      { name: "India/Pakistan (1947)" },
      { name: "Vietnam (1975)" },
      { name: "Cambodia (1979)" },
      { name: "WWII Europe" },
      { name: "Jordan/Lebanon" },
      { name: "India" },
      { name: "Pakistan" },
      { name: "USA" },
      { name: "Thailand" },
      { name: "Various Countries" },
    ],
    links: [
      { source: 0, target: 5, value: 700000 },   // Palestine -> Jordan/Lebanon
      { source: 1, target: 6, value: 7000000 },  // Partition -> India
      { source: 1, target: 7, value: 7000000 },  // Partition -> Pakistan
      { source: 2, target: 8, value: 130000 },   // Vietnam -> USA
      { source: 3, target: 9, value: 650000 },   // Cambodia -> Thailand
      { source: 4, target: 10, value: 40000000 }, // WWII displacement
    ],
    description: "Major historical displacement events including the Nakba, Indian Partition, and post-WWII refugee crisis."
  },
};

export default function RefugeeFlowsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("2020s");

  const currentData = useMemo(() => REFUGEE_DATA[timeRange], [timeRange]);

  const timeRanges: { id: TimeRange; label: string }[] = [
    { id: "2020s", label: "2020s" },
    { id: "2010s", label: "2010s" },
    { id: "2000s", label: "2000s" },
    { id: "1990s", label: "1990s" },
    { id: "historical", label: "Historical" },
  ];

  // Calculate total refugees for current period
  const totalRefugees = useMemo(() => {
    return currentData.links.reduce((sum, link) => sum + link.value, 0);
  }, [currentData]);

  return (
    <div style={{ background: '#FFF5F6', fontFamily: 'Georgia, serif' }} className="min-h-screen">
      {/* Header */}
      <div style={{ background: 'linear-gradient(to right, #8B1A1A, #C41E3A)' }} className="text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Global Refugee Flows
          </h1>
          <p className="text-xl max-w-3xl" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Visualizing forced displacement and refugee movements across decades.
            Understanding where people flee from and where they seek safety.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-4">
            <p className="text-3xl font-bold" style={{ color: '#C41E3A' }}>
              {(totalRefugees / 1000000).toFixed(1)}M
            </p>
            <p className="text-sm" style={{ color: '#8B7355' }}>People Displaced ({timeRange})</p>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-4">
            <p className="text-3xl font-bold" style={{ color: '#C41E3A' }}>108M+</p>
            <p className="text-sm" style={{ color: '#8B7355' }}>Forcibly Displaced (2023)</p>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-4">
            <p className="text-3xl font-bold" style={{ color: '#D4A017' }}>35.3M</p>
            <p className="text-sm" style={{ color: '#8B7355' }}>Refugees Worldwide</p>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-4">
            <p className="text-3xl font-bold" style={{ color: '#8B1A1A' }}>62.5M</p>
            <p className="text-sm" style={{ color: '#8B7355' }}>Internally Displaced</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {timeRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={
                timeRange === range.id
                  ? { background: '#C41E3A', color: '#FFFFFF' }
                  : { background: '#FFFFFF', border: '1px solid #E8C8C8', color: '#5C3D2E' }
              }
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="rounded-lg p-4 mb-6" style={{ background: 'rgba(196, 30, 58, 0.04)', border: '1px solid #E8C8C8' }}>
          <p style={{ color: '#5C3D2E' }}>{currentData.description}</p>
        </div>

        {/* Sankey Diagram */}
        <SankeyDiagram
          data={currentData}
          title={`Refugee Flows - ${timeRange}`}
          height={500}
        />

        {/* Data Table */}
        <div className="mt-8 overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderRadius: '10px' }}>
          <div className="p-4" style={{ borderBottom: '1px solid #E8C8C8' }}>
            <h3 className="text-lg font-semibold" style={{ color: '#2C1810' }}>Flow Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'rgba(196, 30, 58, 0.06)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm" style={{ color: '#2C1810' }}>Origin</th>
                  <th className="px-4 py-3 text-left text-sm" style={{ color: '#2C1810' }}>Destination</th>
                  <th className="px-4 py-3 text-right text-sm" style={{ color: '#2C1810' }}>Number</th>
                </tr>
              </thead>
              <tbody>
                {currentData.links.map((link, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #E8C8C8' }}>
                    <td className="px-4 py-3" style={{ color: '#2C1810' }}>{currentData.nodes[link.source].name}</td>
                    <td className="px-4 py-3" style={{ color: '#2C1810' }}>{currentData.nodes[link.target].name}</td>
                    <td className="px-4 py-3 text-right" style={{ color: '#8B7355' }}>
                      {link.value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Context */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-6">
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#2C1810' }}>Key Causes of Displacement</h3>
            <ul className="space-y-2" style={{ color: '#5C3D2E' }}>
              <li className="flex items-start gap-2">
                <span style={{ color: '#C41E3A' }}>•</span>
                Armed conflict and civil war
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: '#C41E3A' }}>•</span>
                Political persecution and oppression
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: '#C41E3A' }}>•</span>
                Ethnic cleansing and genocide
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: '#C41E3A' }}>•</span>
                Climate change and natural disasters
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: '#C41E3A' }}>•</span>
                Economic collapse and poverty
              </li>
            </ul>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-6">
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#2C1810' }}>Top Host Countries (2023)</h3>
            <div className="space-y-3">
              {[
                { country: "Turkey", refugees: "3.6M" },
                { country: "Iran", refugees: "3.4M" },
                { country: "Colombia", refugees: "2.5M" },
                { country: "Germany", refugees: "2.1M" },
                { country: "Pakistan", refugees: "1.7M" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span style={{ color: '#5C3D2E' }}>{item.country}</span>
                  <span className="font-semibold" style={{ color: '#C41E3A' }}>{item.refugees}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="rounded-lg p-4 text-sm" style={{ background: 'rgba(196, 30, 58, 0.04)', border: '1px solid #E8C8C8', color: '#8B7355' }}>
          <p>
            Data sources: UNHCR, Internal Displacement Monitoring Centre (IDMC),
            and historical records. Numbers are approximate and represent major
            documented movements.
          </p>
        </div>
      </div>
    </div>
  );
}
