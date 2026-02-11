import { useState, useMemo } from "react";
import NetworkGraph from "../components/visualizations/NetworkGraph";

type NetworkFilter = "all" | "marxist" | "anarchist" | "feminist" | "anticolonial" | "labor";

// Sample data - in production this would come from the API
const SAMPLE_NETWORK_DATA = {
  nodes: [
    { id: "marx", name: "Karl Marx", type: "person" as const, group: "marxist" },
    { id: "engels", name: "Friedrich Engels", type: "person" as const, group: "marxist" },
    { id: "lenin", name: "Vladimir Lenin", type: "person" as const, group: "marxist" },
    { id: "luxemburg", name: "Rosa Luxemburg", type: "person" as const, group: "marxist" },
    { id: "gramsci", name: "Antonio Gramsci", type: "person" as const, group: "marxist" },
    { id: "fanon", name: "Frantz Fanon", type: "person" as const, group: "anticolonial" },
    { id: "guevara", name: "Che Guevara", type: "person" as const, group: "anticolonial" },
    { id: "castro", name: "Fidel Castro", type: "person" as const, group: "anticolonial" },
    { id: "mao", name: "Mao Zedong", type: "person" as const, group: "marxist" },
    { id: "ho", name: "Ho Chi Minh", type: "person" as const, group: "anticolonial" },
    { id: "bakunin", name: "Mikhail Bakunin", type: "person" as const, group: "anarchist" },
    { id: "kropotkin", name: "Peter Kropotkin", type: "person" as const, group: "anarchist" },
    { id: "goldman", name: "Emma Goldman", type: "person" as const, group: "anarchist" },
    { id: "beauvoir", name: "Simone de Beauvoir", type: "person" as const, group: "feminist" },
    { id: "davis", name: "Angela Davis", type: "person" as const, group: "feminist" },
    { id: "first_intl", name: "First International", type: "organization" as const, group: "labor" },
    { id: "paris_commune", name: "Paris Commune", type: "event" as const, group: "labor" },
    { id: "russian_rev", name: "Russian Revolution", type: "event" as const, group: "marxist" },
    { id: "cuban_rev", name: "Cuban Revolution", type: "event" as const, group: "anticolonial" },
    { id: "capital", name: "Das Kapital", type: "book" as const, group: "marxist" },
    { id: "manifesto", name: "Communist Manifesto", type: "book" as const, group: "marxist" },
    { id: "wretched", name: "Wretched of the Earth", type: "book" as const, group: "anticolonial" },
    { id: "second_sex", name: "The Second Sex", type: "book" as const, group: "feminist" },
    { id: "black_panthers", name: "Black Panther Party", type: "organization" as const, group: "anticolonial" },
  ],
  links: [
    { source: "marx", target: "engels", type: "related" as const, strength: 1 },
    { source: "marx", target: "capital", type: "authored" as const, strength: 1 },
    { source: "marx", target: "manifesto", type: "authored" as const, strength: 1 },
    { source: "engels", target: "manifesto", type: "authored" as const, strength: 1 },
    { source: "marx", target: "first_intl", type: "founded" as const, strength: 0.8 },
    { source: "bakunin", target: "first_intl", type: "member" as const, strength: 0.7 },
    { source: "marx", target: "lenin", type: "influenced" as const, strength: 0.9 },
    { source: "marx", target: "luxemburg", type: "influenced" as const, strength: 0.8 },
    { source: "marx", target: "gramsci", type: "influenced" as const, strength: 0.8 },
    { source: "lenin", target: "russian_rev", type: "participated" as const, strength: 1 },
    { source: "luxemburg", target: "russian_rev", type: "related" as const, strength: 0.5 },
    { source: "lenin", target: "mao", type: "influenced" as const, strength: 0.8 },
    { source: "mao", target: "ho", type: "influenced" as const, strength: 0.7 },
    { source: "fanon", target: "wretched", type: "authored" as const, strength: 1 },
    { source: "fanon", target: "guevara", type: "influenced" as const, strength: 0.7 },
    { source: "guevara", target: "cuban_rev", type: "participated" as const, strength: 1 },
    { source: "castro", target: "cuban_rev", type: "participated" as const, strength: 1 },
    { source: "guevara", target: "castro", type: "related" as const, strength: 0.9 },
    { source: "kropotkin", target: "bakunin", type: "influenced" as const, strength: 0.7 },
    { source: "kropotkin", target: "goldman", type: "influenced" as const, strength: 0.8 },
    { source: "beauvoir", target: "second_sex", type: "authored" as const, strength: 1 },
    { source: "beauvoir", target: "davis", type: "influenced" as const, strength: 0.6 },
    { source: "davis", target: "black_panthers", type: "member" as const, strength: 0.8 },
    { source: "fanon", target: "black_panthers", type: "influenced" as const, strength: 0.7 },
    { source: "marx", target: "paris_commune", type: "related" as const, strength: 0.6 },
  ],
};

export default function NetworkAnalysisPage() {
  const [filter, setFilter] = useState<NetworkFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    let nodes = SAMPLE_NETWORK_DATA.nodes;
    let links = SAMPLE_NETWORK_DATA.links;

    // Filter by group
    if (filter !== "all") {
      nodes = nodes.filter((n) => n.group === filter);
      const nodeIds = new Set(nodes.map((n) => n.id));
      links = links.filter(
        (l) => nodeIds.has(l.source as string) && nodeIds.has(l.target as string)
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      nodes = nodes.filter((n) => n.name.toLowerCase().includes(term));
      const nodeIds = new Set(nodes.map((n) => n.id));
      links = links.filter(
        (l) => nodeIds.has(l.source as string) || nodeIds.has(l.target as string)
      );
      // Add connected nodes back
      const connectedIds = new Set<string>();
      links.forEach((l) => {
        connectedIds.add(l.source as string);
        connectedIds.add(l.target as string);
      });
      nodes = SAMPLE_NETWORK_DATA.nodes.filter((n) => connectedIds.has(n.id));
    }

    return { nodes, links };
  }, [filter, searchTerm]);

  const filters: { id: NetworkFilter; label: string; color: string }[] = [
    { id: "all", label: "All", color: "gray" },
    { id: "marxist", label: "Marxist", color: "red" },
    { id: "anarchist", label: "Anarchist", color: "black" },
    { id: "feminist", label: "Feminist", color: "purple" },
    { id: "anticolonial", label: "Anti-Colonial", color: "green" },
    { id: "labor", label: "Labor", color: "amber" },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#FFF5F6', color: '#2C1810' }}>
      {/* Header */}
      <div className="py-12" style={{ background: 'linear-gradient(to right, #C41E3A, #8B1A1A)', borderBottom: '2px solid #E8C8C8' }}>
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2 text-white" style={{ fontFamily: 'Georgia, serif' }}>Network Analysis</h1>
          <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.85)', fontFamily: 'Georgia, serif' }}>
            Explore connections between revolutionaries, movements, events, and ideas
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', color: '#2C1810', fontFamily: 'Georgia, serif' }}
            />
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={
                  filter === f.id
                    ? { background: '#C41E3A', color: '#FFFFFF' }
                    : { background: '#FFFFFF', color: '#5C3D2E', border: '1px solid #E8C8C8' }
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-6 text-sm" style={{ color: '#8B7355' }}>
          <span>{filteredData.nodes.length} nodes</span>
          <span>{filteredData.links.length} connections</span>
        </div>

        {/* Graph */}
        <div className="rounded-xl p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderRadius: '10px' }}>
          <NetworkGraph
            data={filteredData}
            width={1200}
            height={700}
            onNodeClick={(node) => console.log("Clicked:", node)}
          />
        </div>

        {/* Legend for link types */}
        <div className="mt-6 p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>Connection Types</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5" style={{ background: '#8B7355' }}></div>
              <span className="text-sm" style={{ color: '#5C3D2E' }}>Influenced</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-400"></div>
              <span className="text-sm" style={{ color: '#5C3D2E' }}>Participated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-purple-400"></div>
              <span className="text-sm" style={{ color: '#5C3D2E' }}>Authored</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-green-400"></div>
              <span className="text-sm" style={{ color: '#5C3D2E' }}>Founded</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-amber-400"></div>
              <span className="text-sm" style={{ color: '#5C3D2E' }}>Member</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
