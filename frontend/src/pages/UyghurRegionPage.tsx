import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

type Tab = "overview" | "timeline" | "facilities" | "figures" | "resources";

export default function UyghurRegionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: overview } = useQuery({
    queryKey: ["uyghur-overview"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/territories/uyghur-region/overview`);
      return res.json();
    },
  });

  const { data: events } = useQuery({
    queryKey: ["uyghur-events"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/territories/uyghur-region/historical-events`);
      return res.json();
    },
  });

  const { data: facilities } = useQuery({
    queryKey: ["uyghur-facilities"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/territories/uyghur-region/detention-facilities`);
      return res.json();
    },
  });

  const { data: figures } = useQuery({
    queryKey: ["uyghur-figures"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/territories/uyghur-region/key-figures`);
      return res.json();
    },
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "timeline", label: "Timeline" },
    { id: "facilities", label: "Detention Facilities" },
    { id: "figures", label: "Key Figures" },
    { id: "resources", label: "Resources" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF5F6' }}>
      <div className="py-16 border-b" style={{ background: 'linear-gradient(to right, rgba(196, 30, 58, 0.1), rgba(196, 30, 58, 0.03)), #FFFFFF', borderColor: '#E8C8C8' }}>
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#8B1A1A' }}>
            Uyghur Region / East Turkestan
          </h1>
          <p className="text-xl max-w-3xl" style={{ color: '#5C3D2E' }}>
            Documenting the human rights crisis and cultural suppression of Uyghurs
            and other Turkic Muslim peoples in Xinjiang, China.
          </p>
        </div>
      </div>

      <div className="border-l-4 p-4 max-w-7xl mx-auto mt-6" style={{ borderColor: '#C41E3A', background: 'rgba(196, 30, 58, 0.06)' }}>
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#C41E3A' }}>
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm" style={{ color: '#5C3D2E' }}>
              <strong style={{ color: '#C41E3A' }}>Sensitive Content:</strong> This page documents serious human rights violations
              including mass detention and cultural persecution. Information is compiled from UN reports,
              human rights organizations, and investigative journalism.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="border-b" style={{ borderColor: '#E8C8C8' }}>
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                style={{
                  borderColor: activeTab === tab.id ? '#D4A017' : 'transparent',
                  color: activeTab === tab.id ? '#C41E3A' : '#8B7355'
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-8">
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 rounded-lg" style={{
                  background: '#FFFFFF',
                  border: '1px solid #E8C8C8',
                  borderLeft: '4px solid #C41E3A',
                  borderRadius: '10px'
                }}>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#C41E3A' }}>Region</h3>
                  <p className="text-2xl font-bold" style={{ color: '#2C1810' }}>{overview?.region || "Xinjiang"}</p>
                </div>
                <div className="p-6 rounded-lg" style={{
                  background: '#FFFFFF',
                  border: '1px solid #E8C8C8',
                  borderLeft: '4px solid #C41E3A',
                  borderRadius: '10px'
                }}>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#C41E3A' }}>Population</h3>
                  <p className="text-2xl font-bold" style={{ color: '#2C1810' }}>{overview?.population || "~12 million Uyghurs"}</p>
                </div>
                <div className="p-6 rounded-lg" style={{
                  background: '#FFFFFF',
                  border: '1px solid #E8C8C8',
                  borderLeft: '4px solid #C41E3A',
                  borderRadius: '10px'
                }}>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#C41E3A' }}>Under Control Since</h3>
                  <p className="text-2xl font-bold" style={{ color: '#2C1810' }}>{overview?.occupation_since || 1949}</p>
                </div>
              </div>

              <div className="p-6 rounded-lg" style={{
                background: '#FFFFFF',
                border: '1px solid #E8C8C8',
                borderLeft: '4px solid #C41E3A',
                borderRadius: '10px'
              }}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#8B1A1A' }}>Background</h2>
                <p style={{ color: '#5C3D2E' }}>
                  {overview?.description || "Loading..."}
                </p>
              </div>

              <div className="p-6 rounded-lg" style={{
                background: '#FFFFFF',
                border: '1px solid #E8C8C8',
                borderLeft: '4px solid #C41E3A',
                borderRadius: '10px'
              }}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#8B1A1A' }}>Key Facts</h2>
                <ul className="space-y-3">
                  {overview?.key_facts?.map((fact: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-3" style={{ color: '#C41E3A' }}>•</span>
                      <span style={{ color: '#5C3D2E' }}>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 rounded-lg" style={{
                background: '#FFFFFF',
                border: '1px solid #E8C8C8',
                borderLeft: '4px solid #C41E3A',
                borderRadius: '10px'
              }}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#8B1A1A' }}>International Response</h2>
                <ul className="space-y-3">
                  {overview?.international_response?.map((response: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-3" style={{ color: '#C41E3A' }}>›</span>
                      <span style={{ color: '#5C3D2E' }}>{response}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#8B1A1A' }}>Historical Timeline</h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ backgroundColor: '#E8C8C8' }}></div>
                {events?.map((event: any, i: number) => (
                  <div key={i} className="relative pl-12 pb-8">
                    <div className="absolute left-2 w-5 h-5 rounded-full border-4" style={{ backgroundColor: '#C41E3A', borderColor: '#FFF5F6' }}></div>
                    <div className="p-4 rounded-lg" style={{
                      background: '#FFFFFF',
                      border: '1px solid #E8C8C8',
                      borderLeft: '4px solid #C41E3A',
                      borderRadius: '10px'
                    }}>
                      <span className="text-lg font-bold" style={{ color: '#C41E3A' }}>{event.year}</span>
                      <h3 className="text-xl font-semibold mt-1" style={{ color: '#2C1810' }}>{event.event}</h3>
                      <p className="mt-2" style={{ color: '#5C3D2E' }}>{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "facilities" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#8B1A1A' }}>Documented Detention Facilities</h2>
              <p style={{ color: '#5C3D2E' }} className="mb-6">
                Based on satellite imagery analysis by ASPI, BuzzFeed News, and other investigative sources.
                Estimated 380+ facilities identified across the region.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {facilities?.map((facility: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg" style={{
                    background: '#FFFFFF',
                    border: '1px solid #E8C8C8',
                    borderLeft: '4px solid #C41E3A',
                    borderRadius: '10px'
                  }}>
                    <h3 className="font-semibold text-lg" style={{ color: '#2C1810' }}>{facility.name}</h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span style={{ color: '#8B7355' }}>Type:</span> <span style={{ color: '#C41E3A' }} className="capitalize">{facility.type}</span></p>
                      <p><span style={{ color: '#8B7355' }}>Est. Capacity:</span> <span style={{ color: '#C41E3A' }}>{facility.capacity_est?.toLocaleString()}</span></p>
                      <p style={{ color: '#8B7355' }}><span>Identified:</span> {facility.year_identified}</p>
                      <p style={{ color: '#8B7355' }}><span>Coordinates:</span> {facility.lat?.toFixed(2)}, {facility.lon?.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "figures" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#8B1A1A' }}>Key Figures</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {figures?.map((person: any, i: number) => (
                  <div key={i} className="p-6 rounded-lg" style={{
                    background: '#FFFFFF',
                    border: '1px solid #E8C8C8',
                    borderLeft: '4px solid #C41E3A',
                    borderRadius: '10px'
                  }}>
                    <h3 className="text-xl font-bold" style={{ color: '#C41E3A' }}>{person.name}</h3>
                    <p className="mt-1" style={{ color: '#8B7355' }}>{person.role}</p>
                    <p className={`mt-2 text-sm font-medium`} style={{ color: person.status.includes("Imprisoned") ? '#C41E3A' : '#4ade80' }}>
                      {person.status}
                    </p>
                    <p className="mt-3" style={{ color: '#5C3D2E' }}>{person.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#8B1A1A' }}>Sources & Resources</h2>

              <div className="p-6 rounded-lg" style={{
                background: '#FFFFFF',
                border: '1px solid #E8C8C8',
                borderLeft: '4px solid #C41E3A',
                borderRadius: '10px'
              }}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: '#2C1810' }}>Primary Sources</h3>
                <ul className="space-y-3">
                  {overview?.sources?.map((source: string, i: number) => (
                    <li key={i} style={{ color: '#5C3D2E' }}>• {source}</li>
                  ))}
                </ul>
              </div>

              <div className="p-6 rounded-lg" style={{
                background: '#FFFFFF',
                border: '1px solid #E8C8C8',
                borderLeft: '4px solid #C41E3A',
                borderRadius: '10px'
              }}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: '#2C1810' }}>Key Reports</h3>
                <ul className="space-y-3" style={{ color: '#5C3D2E' }}>
                  <li>• UN OHCHR Assessment of Human Rights Concerns (2022)</li>
                  <li>• ASPI Xinjiang Data Project - Mapping detention facilities</li>
                  <li>• Xinjiang Police Files (2022) - Leaked internal documents</li>
                  <li>• China Cables (2019) - Leaked operational manuals</li>
                  <li>• Human Rights Watch Reports on Xinjiang</li>
                  <li>• Amnesty International: Like We Were Enemies in a War</li>
                </ul>
              </div>

              <div className="p-6 rounded-lg" style={{
                background: '#FFFFFF',
                border: '1px solid #E8C8C8',
                borderLeft: '4px solid #C41E3A',
                borderRadius: '10px'
              }}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: '#2C1810' }}>Organizations</h3>
                <ul className="space-y-3" style={{ color: '#5C3D2E' }}>
                  <li>• World Uyghur Congress</li>
                  <li>• Uyghur Human Rights Project</li>
                  <li>• Campaign for Uyghurs</li>
                  <li>• Uyghur Tribunal</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="p-4 rounded-lg text-sm" style={{
          background: 'rgba(196, 30, 58, 0.04)',
          color: '#8B7355'
        }}>
          <p>
            This page is for educational and human rights documentation purposes.
            Data compiled from UN reports, academic research, investigative journalism,
            and human rights organizations. Facility locations are approximate based on
            satellite imagery analysis.
          </p>
        </div>
      </div>
    </div>
  );
}
