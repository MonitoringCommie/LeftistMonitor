import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

type Tab = "current" | "historical" | "statistics" | "nobel";

interface Prisoner {
  name: string;
  country: string;
  birth_year?: number;
  death_year?: number;
  detention_start?: number;
  detention_end?: number;
  charge?: string;
  sentence?: string;
  status?: string;
  category?: string;
  awards?: string[];
  notes?: string;
  years_imprisoned?: number;
  outcome?: string;
}

export default function PoliticalPrisonersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("current");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  const { data: overview } = useQuery({
    queryKey: ["prisoners-overview"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/prisoners/`);
      return res.json();
    },
  });

  const { data: currentPrisoners } = useQuery({
    queryKey: ["prisoners-current", selectedCountry],
    queryFn: async () => {
      const url = selectedCountry
        ? `${API_BASE}/prisoners/current?country=${selectedCountry}`
        : `${API_BASE}/prisoners/current`;
      const res = await fetch(url);
      return res.json();
    },
  });

  const { data: historicalPrisoners } = useQuery({
    queryKey: ["prisoners-historical"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/prisoners/historical`);
      return res.json();
    },
  });

  const { data: nobelLaureates } = useQuery({
    queryKey: ["prisoners-nobel"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/prisoners/nobel-laureates`);
      return res.json();
    },
  });

  const { data: searchResults } = useQuery({
    queryKey: ["prisoners-search", searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return null;
      const res = await fetch(`${API_BASE}/prisoners/search?q=${encodeURIComponent(searchQuery)}`);
      return res.json();
    },
    enabled: searchQuery.length >= 2,
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: "current", label: "Currently Detained" },
    { id: "historical", label: "Historical" },
    { id: "nobel", label: "Nobel Laureates" },
    { id: "statistics", label: "Statistics" },
  ];

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      human_rights: "bg-blue-600",
      womens_rights: "bg-purple-600",
      press_freedom: "bg-amber-600",
      democracy: "bg-green-600",
      academic: "bg-cyan-600",
      political_opposition: "bg-red-600",
      uyghur_scholar: "bg-blue-500",
      anti_apartheid: "bg-orange-600",
      dissident: "bg-gray-600",
    };
    return colors[category || ""] || "bg-gray-500";
  };

  const getStatusBadge = (status?: string) => {
    if (status === "detained" || status === "Currently detained") {
      return <span className="px-2 py-1 text-xs rounded text-white" style={{ background: '#C41E3A' }}>Detained</span>;
    }
    if (status === "died_in_custody") {
      return <span className="px-2 py-1 text-xs rounded text-white" style={{ background: '#5C3D2E' }}>Died in Custody</span>;
    }
    if (status === "disappeared") {
      return <span className="px-2 py-1 text-xs rounded text-white" style={{ background: '#D4A017' }}>Disappeared</span>;
    }
    if (status === "released") {
      return <span className="px-2 py-1 text-xs rounded bg-green-600 text-white">Released</span>;
    }
    return null;
  };

  const PrisonerCard = ({ prisoner, showStatus = true }: { prisoner: Prisoner; showStatus?: boolean }) => (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-5 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-semibold" style={{ color: '#2C1810' }}>{prisoner.name}</h3>
          <p style={{ color: '#8B7355' }}>{prisoner.country}</p>
        </div>
        {showStatus && getStatusBadge(prisoner.status)}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        {prisoner.birth_year && (
          <div>
            <span style={{ color: '#8B7355' }}>Born:</span>{" "}
            <span style={{ color: '#5C3D2E' }}>{prisoner.birth_year}</span>
            {prisoner.death_year && <span style={{ color: '#8B7355' }}> - {prisoner.death_year}</span>}
          </div>
        )}
        {prisoner.detention_start && (
          <div>
            <span style={{ color: '#8B7355' }}>Detained:</span>{" "}
            <span style={{ color: '#5C3D2E' }}>{prisoner.detention_start}</span>
            {prisoner.detention_end && <span style={{ color: '#8B7355' }}> - {prisoner.detention_end}</span>}
          </div>
        )}
        {prisoner.years_imprisoned && (
          <div>
            <span style={{ color: '#8B7355' }}>Years:</span>{" "}
            <span style={{ color: '#5C3D2E' }}>{prisoner.years_imprisoned}</span>
          </div>
        )}
        {prisoner.charge && (
          <div className="col-span-2">
            <span style={{ color: '#8B7355' }}>Charge:</span>{" "}
            <span style={{ color: '#5C3D2E' }}>{prisoner.charge}</span>
          </div>
        )}
      </div>

      {prisoner.category && (
        <span className={`inline-block px-2 py-1 text-xs rounded ${getCategoryColor(prisoner.category)} text-white mr-2`}>
          {prisoner.category.replace(/_/g, " ")}
        </span>
      )}

      {prisoner.awards && prisoner.awards.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {prisoner.awards.map((award, i) => (
            <span key={i} className="px-2 py-1 text-xs rounded" style={{ background: 'rgba(212, 160, 23, 0.15)', color: '#D4A017', border: '1px solid rgba(212, 160, 23, 0.3)' }}>
              {award}
            </span>
          ))}
        </div>
      )}

      {prisoner.notes && (
        <p className="mt-3 text-sm" style={{ color: '#8B7355' }}>{prisoner.notes}</p>
      )}
    </div>
  );

  return (
    <div style={{ background: '#FFF5F6', fontFamily: 'Georgia, serif' }} className="min-h-screen">
      {/* Header */}
      <div style={{ background: 'linear-gradient(to right, #8B1A1A, #C41E3A, #8B1A1A)' }} className="text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Political Prisoners</h1>
          <p className="text-xl max-w-3xl" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Documenting prisoners of conscience, political detainees, and those
            imprisoned for their beliefs, activism, or identity worldwide.
          </p>

          {/* Stats */}
          {overview && (
            <div className="flex gap-8 mt-8">
              <div>
                <p className="text-3xl font-bold" style={{ color: '#E8485C' }}>{overview.current_count}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Currently Detained</p>
              </div>
              <div>
                <p className="text-3xl font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>{overview.historical_count}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Historical Records</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
            style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', color: '#2C1810', '--tw-ring-color': '#C41E3A' } as React.CSSProperties}
          />
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
            style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', color: '#2C1810', '--tw-ring-color': '#C41E3A' } as React.CSSProperties}
          >
            <option value="">All Countries</option>
            <option value="China">China</option>
            <option value="Iran">Iran</option>
            <option value="Russia">Russia</option>
            <option value="Belarus">Belarus</option>
            <option value="Turkey">Turkey</option>
            <option value="Myanmar">Myanmar</option>
          </select>
        </div>

        {/* Search Results */}
        {searchResults && searchResults.data?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#2C1810' }}>Search Results ({searchResults.total})</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {searchResults.data.map((prisoner: Prisoner, i: number) => (
                <PrisonerCard key={i} prisoner={prisoner} />
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        {!searchQuery && (
          <>
            <div className="mb-6" style={{ borderBottom: '1px solid #E8C8C8' }}>
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                    style={
                      activeTab === tab.id
                        ? { borderColor: '#C41E3A', color: '#C41E3A' }
                        : { borderColor: 'transparent', color: '#8B7355' }
                    }
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "current" && (
              <div className="grid md:grid-cols-2 gap-4">
                {currentPrisoners?.data?.map((prisoner: Prisoner, i: number) => (
                  <PrisonerCard key={i} prisoner={prisoner} />
                ))}
              </div>
            )}

            {activeTab === "historical" && (
              <div className="grid md:grid-cols-2 gap-4">
                {historicalPrisoners?.data?.map((prisoner: Prisoner, i: number) => (
                  <PrisonerCard key={i} prisoner={prisoner} showStatus={false} />
                ))}
              </div>
            )}

            {activeTab === "nobel" && (
              <div>
                <p className="mb-6" style={{ color: '#8B7355' }}>
                  Political prisoners who have been awarded the Nobel Peace Prize for their
                  courage and commitment to human rights.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {nobelLaureates?.data?.map((prisoner: Prisoner, i: number) => (
                    <PrisonerCard key={i} prisoner={prisoner} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "statistics" && overview?.statistics && (
              <div className="grid md:grid-cols-3 gap-6">
                <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#2C1810' }}>By Country</h3>
                  <div className="space-y-2">
                    {Object.entries(overview.statistics.by_country || {}).map(([country, count]) => (
                      <div key={country} className="flex justify-between">
                        <span style={{ color: '#5C3D2E' }}>{country}</span>
                        <span style={{ color: '#8B7355' }}>{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#2C1810' }}>By Category</h3>
                  <div className="space-y-2">
                    {Object.entries(overview.statistics.by_category || {}).map(([cat, count]) => (
                      <div key={cat} className="flex justify-between">
                        <span style={{ color: '#5C3D2E' }}>{cat.replace(/_/g, " ")}</span>
                        <span style={{ color: '#8B7355' }}>{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-6">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#2C1810' }}>By Status</h3>
                  <div className="space-y-2">
                    {Object.entries(overview.statistics.by_status || {}).map(([status, count]) => (
                      <div key={status} className="flex justify-between">
                        <span style={{ color: '#5C3D2E' }}>{status.replace(/_/g, " ")}</span>
                        <span style={{ color: '#8B7355' }}>{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer note */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="rounded-lg p-4 text-sm" style={{ background: 'rgba(196, 30, 58, 0.04)', border: '1px solid #E8C8C8', color: '#8B7355' }}>
          <p>
            Data compiled from Amnesty International, Human Rights Watch, PEN International,
            and other human rights organizations. This database is for educational and
            advocacy purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
