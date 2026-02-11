import React, { useState } from 'react';

interface ExtractionData {
  id: string;
  region: string;
  colonizer: string;
  period: string;
  resource: string;
  resourceType: 'mineral' | 'agricultural' | 'labor' | 'artifact';
  estimatedValue: string;
  humanCost: string;
  description: string;
  modernImpact: string;
  sources: string[];
}

const ColonialExtractionPage: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedResource, setSelectedResource] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'flow' | 'timeline'>('list');

  const regions = [
    'Africa', 'South Asia', 'Southeast Asia', 'Latin America',
    'Caribbean', 'Middle East', 'Pacific Islands', 'North America'
  ];

  const resourceTypes = [
    { value: 'mineral', label: 'Minerals & Metals', icon: '⛏️' },
    { value: 'agricultural', label: 'Agricultural', icon: '🌾' },
    { value: 'labor', label: 'Forced Labor', icon: '⛓️' },
    { value: 'artifact', label: 'Cultural Artifacts', icon: '🏛️' }
  ];

  const extractionData: ExtractionData[] = [
    {
      id: '1',
      region: 'Africa',
      colonizer: 'Belgium',
      period: '1885-1960',
      resource: 'Rubber, Ivory, Minerals',
      resourceType: 'mineral',
      estimatedValue: '$220 billion (2024 USD)',
      humanCost: '10 million deaths under Leopold II',
      description: 'The Congo Free State under Leopold II was characterized by brutal exploitation. Rubber quotas led to systematic violence, including hand amputations for workers who failed to meet quotas.',
      modernImpact: 'DRC remains one of the poorest nations despite having vast mineral wealth. Colonial infrastructure was designed for extraction, not development.',
      sources: ['King Leopold\'s Ghost by Adam Hochschild', 'UN Development Reports']
    },
    {
      id: '2',
      region: 'South Asia',
      colonizer: 'Britain',
      period: '1757-1947',
      resource: 'Textiles, Tea, Spices, Opium',
      resourceType: 'agricultural',
      estimatedValue: '$45 trillion (Utsa Patnaik estimate)',
      humanCost: '35+ million famine deaths',
      description: 'British colonial rule systematically deindustrialized India, transforming it from a textile exporter to a raw material supplier. Deliberate policies contributed to devastating famines.',
      modernImpact: 'India\'s share of world GDP fell from 23% (1700) to 4% (1947). Post-colonial development required rebuilding destroyed industries.',
      sources: ['Inglorious Empire by Shashi Tharoor', 'Cambridge Economic History of India']
    },
    {
      id: '3',
      region: 'Latin America',
      colonizer: 'Spain',
      period: '1492-1824',
      resource: 'Silver, Gold',
      resourceType: 'mineral',
      estimatedValue: '$2.6 trillion (2024 USD)',
      humanCost: '8 million mining deaths at Potosí alone',
      description: 'The silver mines of Potosí (Bolivia) and Zacatecas (Mexico) funded the Spanish Empire. Indigenous and African slave labor was used under the mita and encomienda systems.',
      modernImpact: 'Colonial silver extraction funded European industrialization while leaving Latin America underdeveloped and dependent on commodity exports.',
      sources: ['Open Veins of Latin America by Eduardo Galeano', 'Silver, Trade, and War']
    },
    {
      id: '4',
      region: 'Caribbean',
      colonizer: 'Multiple European Powers',
      period: '1492-1900',
      resource: 'Sugar, Enslaved Labor',
      resourceType: 'labor',
      estimatedValue: '$14 trillion (slavery reparations estimates)',
      humanCost: '12+ million Africans transported, millions more died',
      description: 'The Atlantic slave trade and Caribbean plantation system formed the foundation of modern capitalism. Sugar profits funded banks, insurance companies, and industrial development.',
      modernImpact: 'Caribbean nations remain economically dependent. Calls for reparations continue, with CARICOM leading regional efforts.',
      sources: ['Capitalism and Slavery by Eric Williams', 'The Half Has Never Been Told']
    },
    {
      id: '5',
      region: 'Africa',
      colonizer: 'Britain',
      period: '1885-1960',
      resource: 'Gold, Diamonds, Copper',
      resourceType: 'mineral',
      estimatedValue: '$4.8 trillion (estimated)',
      humanCost: 'Millions in mining accidents, labor exploitation',
      description: 'Southern Africa\'s mineral wealth drove the scramble for Africa. Mining companies like De Beers used compound labor systems that prefigured apartheid.',
      modernImpact: 'Mining infrastructure serves export, not local development. Foreign corporations still dominate extraction.',
      sources: ['African Economic History', 'Mining in Africa']
    },
    {
      id: '6',
      region: 'Southeast Asia',
      colonizer: 'Netherlands',
      period: '1602-1949',
      resource: 'Spices, Rubber, Oil',
      resourceType: 'agricultural',
      estimatedValue: '$1.2 trillion (estimated)',
      humanCost: 'Millions in forced cultivation system',
      description: 'The Dutch East India Company (VOC) monopolized spice trade through violence. The Cultivation System (1830-1870) forced Javanese peasants to grow export crops instead of food.',
      modernImpact: 'Indonesia\'s economy remains dependent on primary commodity exports. Colonial-era land inequality persists.',
      sources: ['The VOC and Asia', 'Indonesian Economic History']
    },
    {
      id: '7',
      region: 'Middle East',
      colonizer: 'Britain/France',
      period: '1916-1971',
      resource: 'Oil',
      resourceType: 'mineral',
      estimatedValue: '$12 trillion+ (ongoing)',
      humanCost: 'Regional conflicts, displacement',
      description: 'The Sykes-Picot Agreement divided the Middle East. Oil concessions to Western companies extracted wealth while borders drawn without regard to populations created ongoing conflicts.',
      modernImpact: 'Resource curse, ongoing intervention, sectarian conflicts traced to colonial border-making.',
      sources: ['A Line in the Sand', 'Oil and the Middle East']
    },
    {
      id: '8',
      region: 'Africa',
      colonizer: 'Multiple',
      period: '1884-Present',
      resource: 'Cultural Artifacts',
      resourceType: 'artifact',
      estimatedValue: 'Priceless (Museum holdings)',
      humanCost: 'Cultural destruction, identity loss',
      description: 'European museums hold millions of African artifacts, including the Benin Bronzes looted in 1897. Repatriation efforts are ongoing but face resistance.',
      modernImpact: 'African nations must pay to see their own heritage in European museums. Cultural knowledge was disrupted.',
      sources: ['The Brutish Museums', 'Restitution Reports']
    },
    {
      id: '9',
      region: 'North America',
      colonizer: 'Britain/US',
      period: '1607-Present',
      resource: 'Land, Timber, Minerals',
      resourceType: 'mineral',
      estimatedValue: 'Incalculable (entire continental wealth)',
      humanCost: '90%+ Indigenous population decline',
      description: 'Settler colonialism dispossessed Indigenous nations of their lands through genocide, broken treaties, and forced removal. Land theft enabled agricultural and industrial development.',
      modernImpact: 'Reservations remain some of the poorest areas. Land back movements seek restoration of stolen territories.',
      sources: ['An Indigenous Peoples\' History of the United States', 'Native Land Digital']
    },
    {
      id: '10',
      region: 'Pacific Islands',
      colonizer: 'Multiple',
      period: '1800-1975',
      resource: 'Phosphate, Labor',
      resourceType: 'mineral',
      estimatedValue: '$100 billion+ (phosphate alone)',
      humanCost: 'Entire islands made uninhabitable',
      description: 'Nauru and other islands were mined for phosphate (fertilizer) until 80% of the surface was destroyed. Blackbirding (labor kidnapping) depopulated many islands.',
      modernImpact: 'Environmental destruction, statelessness, climate vulnerability built on colonial extraction.',
      sources: ['Pacific Island Studies', 'Nauru Environmental Reports']
    }
  ];

  const filteredData = extractionData.filter(data => {
    if (selectedRegion !== 'all' && data.region !== selectedRegion) return false;
    if (selectedResource !== 'all' && data.resourceType !== selectedResource) return false;
    return true;
  });

  // Calculate totals (simplified)
  const totalStats = {
    regions: new Set(extractionData.map(d => d.region)).size,
    colonizers: new Set(extractionData.map(d => d.colonizer)).size,
    timeSpan: '1492 - Present'
  };

  return (
    <div style={{ background: '#FFF5F6', fontFamily: 'Georgia, serif' }} className="min-h-screen">
      {/* Hero */}
      <div style={{ background: 'linear-gradient(to right, #8B1A1A, #C41E3A)' }} className="text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Colonial Extraction Database</h1>
          <p className="text-xl max-w-3xl" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Documenting the systematic extraction of wealth from colonized territories.
            Understanding this history is essential for addressing ongoing global inequalities.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-4 shadow text-center">
            <div className="text-3xl font-bold" style={{ color: '#C41E3A' }}>{totalStats.regions}</div>
            <div className="text-sm" style={{ color: '#8B7355' }}>Regions Documented</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-4 shadow text-center">
            <div className="text-3xl font-bold" style={{ color: '#C41E3A' }}>{extractionData.length}</div>
            <div className="text-sm" style={{ color: '#8B7355' }}>Extraction Records</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-4 shadow text-center">
            <div className="text-3xl font-bold" style={{ color: '#C41E3A' }}>500+</div>
            <div className="text-sm" style={{ color: '#8B7355' }}>Years Documented</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-4 shadow text-center">
            <div className="text-3xl font-bold" style={{ color: '#C41E3A' }}>$80T+</div>
            <div className="text-sm" style={{ color: '#8B7355' }}>Estimated Extraction</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg"
                style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              >
                <option value="all">All Regions</option>
                {regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>Resource Type</label>
              <select
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
                className="w-full px-3 py-2 rounded-lg"
                style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              >
                <option value="all">All Types</option>
                {resourceTypes.map(r => (
                  <option key={r.value} value={r.value}>{r.icon} {r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>View Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className="flex-1 px-3 py-2 rounded-lg"
                  style={viewMode === 'list' ? { background: '#C41E3A', color: '#FFFFFF' } : { background: 'rgba(196, 30, 58, 0.04)', color: '#2C1810', border: '1px solid #E8C8C8' }}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('flow')}
                  className="flex-1 px-3 py-2 rounded-lg"
                  style={viewMode === 'flow' ? { background: '#C41E3A', color: '#FFFFFF' } : { background: 'rgba(196, 30, 58, 0.04)', color: '#2C1810', border: '1px solid #E8C8C8' }}
                >
                  Flow
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Flow Visualization (simplified) */}
        {viewMode === 'flow' && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#2C1810' }}>Resource Flows: Colonized → Colonial Powers</h3>
            <div className="space-y-4">
              {[
                { from: 'India', to: 'Britain', resource: 'Textiles, Spices', width: 90 },
                { from: 'Congo', to: 'Belgium', resource: 'Rubber, Minerals', width: 70 },
                { from: 'Indonesia', to: 'Netherlands', resource: 'Spices, Rubber', width: 60 },
                { from: 'Latin America', to: 'Spain', resource: 'Silver, Gold', width: 85 },
                { from: 'Caribbean', to: 'Britain/France', resource: 'Sugar, Labor', width: 75 },
                { from: 'South Africa', to: 'Britain', resource: 'Gold, Diamonds', width: 65 },
                { from: 'Middle East', to: 'Britain/US', resource: 'Oil', width: 80 },
              ].map((flow, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-32 text-right text-sm font-medium" style={{ color: '#2C1810' }}>{flow.from}</div>
                  <div className="flex-1 relative h-8">
                    <div
                      className="absolute inset-y-0 left-0 rounded"
                      style={{ width: `${flow.width}%`, background: 'linear-gradient(to right, #C41E3A, #E8485C)' }}
                    >
                      <div className="h-full flex items-center justify-center text-white text-xs">
                        {flow.resource}
                      </div>
                    </div>
                  </div>
                  <div className="w-32 text-sm font-medium" style={{ color: '#2C1810' }}>{flow.to}</div>
                </div>
              ))}
            </div>
            <p className="text-xs mt-4" style={{ color: '#8B7355' }}>
              Bar width represents relative scale of extraction. Not to exact scale.
            </p>
          </div>
        )}

        {/* Data Cards */}
        {viewMode === 'list' && (
          <div className="space-y-6">
            {filteredData.map(data => (
              <div
                key={data.id}
                style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}
                className="shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {resourceTypes.find(r => r.value === data.resourceType)?.icon}
                        </span>
                        <span className="text-xs uppercase" style={{ color: '#8B7355' }}>{data.resourceType}</span>
                      </div>
                      <h3 className="text-xl font-semibold" style={{ color: '#2C1810' }}>
                        {data.region} → {data.colonizer}
                      </h3>
                      <p style={{ color: '#8B7355' }}>{data.period}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold" style={{ color: '#C41E3A' }}>{data.estimatedValue}</div>
                      <div className="text-xs" style={{ color: '#8B7355' }}>Estimated extraction</div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {data.resource.split(', ').map(r => (
                      <span
                        key={r}
                        className="px-2 py-1 rounded text-sm"
                        style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}
                      >
                        {r}
                      </span>
                    ))}
                  </div>

                  <p className="mt-4" style={{ color: '#5C3D2E' }}>
                    {data.description}
                  </p>

                  {/* Human Cost */}
                  <div className="mt-4 p-4 rounded-lg" style={{ background: 'rgba(196, 30, 58, 0.06)' }}>
                    <h4 className="font-medium mb-1" style={{ color: '#8B1A1A' }}>Human Cost</h4>
                    <p style={{ color: '#C41E3A' }}>{data.humanCost}</p>
                  </div>

                  {/* Modern Impact */}
                  <div className="mt-4 p-4 rounded-lg" style={{ background: 'rgba(196, 30, 58, 0.04)' }}>
                    <h4 className="font-medium mb-1" style={{ color: '#2C1810' }}>Modern Impact</h4>
                    <p style={{ color: '#5C3D2E' }}>{data.modernImpact}</p>
                  </div>

                  {/* Sources */}
                  <div className="mt-4 text-sm" style={{ color: '#8B7355' }}>
                    <strong>Sources:</strong> {data.sources.join('; ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredData.length === 0 && (
          <div className="text-center py-12" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderRadius: '10px' }}>
            <p style={{ color: '#8B7355' }}>No extraction data matches your filters</p>
          </div>
        )}

        {/* Context */}
        <div className="mt-12 rounded-lg p-8" style={{ background: 'linear-gradient(to right, #8B1A1A, #C41E3A)' }}>
          <h2 className="text-2xl font-bold mb-4 text-white">Why This Matters</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 text-white">Reparations Movements</h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Understanding the scale of colonial extraction is essential for reparations
                discussions. CARICOM, African Union, and other bodies have called for
                accounting of historical debts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 text-white">Ongoing Extraction</h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Neocolonial arrangements continue extraction through unfair trade deals,
                debt traps, and resource extraction by multinational corporations. The
                patterns established in the colonial era persist.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColonialExtractionPage;
