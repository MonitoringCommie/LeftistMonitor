import React, { useState } from 'react';

interface GalleryItem {
  id: string;
  type: 'image' | 'document' | 'poster' | 'photograph' | 'map';
  title: string;
  description: string;
  date: string;
  source: string;
  sourceUrl?: string;
  imageUrl: string;
  thumbnailUrl: string;
  tags: string[];
  location?: string;
  people?: string[];
  movement?: string;
  license: string;
}

interface GalleryFilter {
  type: string;
  movement: string;
  decade: string;
  search: string;
}

const HistoricalGalleryPage: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [filters, setFilters] = useState<GalleryFilter>({
    type: 'all',
    movement: 'all',
    decade: 'all',
    search: ''
  });

  const movements = [
    'Labor Movement', 'Civil Rights', 'Anti-Colonial', 'Feminist',
    'Anti-Apartheid', 'Indigenous Rights', 'Anti-Fascism', 'Revolutionary'
  ];

  const decades = ['1800s', '1900s', '1910s', '1920s', '1930s', '1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s'];

  // Sample gallery items representing historical documents and images
  const galleryItems: GalleryItem[] = [
    {
      id: '1',
      type: 'poster',
      title: 'Workers of the World Unite',
      description: 'International Workers\' Day poster featuring the iconic slogan from the Communist Manifesto.',
      date: '1920',
      source: 'International Institute of Social History',
      imageUrl: '/images/gallery/workers-unite.jpg',
      thumbnailUrl: '/images/gallery/thumbs/workers-unite.jpg',
      tags: ['May Day', 'Labor', 'Solidarity'],
      movement: 'Labor Movement',
      license: 'Public Domain'
    },
    {
      id: '2',
      type: 'photograph',
      title: 'March on Washington',
      description: 'View from the Lincoln Memorial during the March on Washington for Jobs and Freedom, August 28, 1963.',
      date: '1963-08-28',
      source: 'National Archives',
      imageUrl: '/images/gallery/march-washington.jpg',
      thumbnailUrl: '/images/gallery/thumbs/march-washington.jpg',
      tags: ['Civil Rights', 'MLK', 'Washington DC'],
      location: 'Washington, D.C.',
      people: ['Martin Luther King Jr.', 'John Lewis', 'A. Philip Randolph'],
      movement: 'Civil Rights',
      license: 'Public Domain'
    },
    {
      id: '3',
      type: 'document',
      title: 'The Communist Manifesto - First Edition',
      description: 'Title page of the first German edition of the Communist Manifesto, published in London.',
      date: '1848-02-21',
      source: 'British Library',
      imageUrl: '/images/gallery/manifesto.jpg',
      thumbnailUrl: '/images/gallery/thumbs/manifesto.jpg',
      tags: ['Marxism', 'Socialism', 'Theory'],
      people: ['Karl Marx', 'Friedrich Engels'],
      movement: 'Revolutionary',
      license: 'Public Domain'
    },
    {
      id: '4',
      type: 'photograph',
      title: 'Haymarket Martyrs',
      description: 'Group portrait of the Haymarket Martyrs who were executed following the 1886 Haymarket affair.',
      date: '1887',
      source: 'Chicago History Museum',
      imageUrl: '/images/gallery/haymarket-martyrs.jpg',
      thumbnailUrl: '/images/gallery/thumbs/haymarket-martyrs.jpg',
      tags: ['Haymarket', 'Anarchism', 'Labor'],
      location: 'Chicago, Illinois',
      people: ['Albert Parsons', 'August Spies', 'Adolph Fischer', 'George Engel'],
      movement: 'Labor Movement',
      license: 'Public Domain'
    },
    {
      id: '5',
      type: 'poster',
      title: 'Viva Zapata',
      description: 'Revolutionary poster depicting Emiliano Zapata, leader of the Liberation Army of the South.',
      date: '1915',
      source: 'Mexican National Archives',
      imageUrl: '/images/gallery/zapata.jpg',
      thumbnailUrl: '/images/gallery/thumbs/zapata.jpg',
      tags: ['Mexican Revolution', 'Agrarian Reform', 'Zapatismo'],
      location: 'Mexico',
      people: ['Emiliano Zapata'],
      movement: 'Revolutionary',
      license: 'Public Domain'
    },
    {
      id: '6',
      type: 'photograph',
      title: 'Soweto Uprising',
      description: 'Students march during the Soweto uprising against Bantu Education, June 16, 1976.',
      date: '1976-06-16',
      source: 'South African History Archive',
      imageUrl: '/images/gallery/soweto.jpg',
      thumbnailUrl: '/images/gallery/thumbs/soweto.jpg',
      tags: ['Anti-Apartheid', 'South Africa', 'Student Movement'],
      location: 'Soweto, South Africa',
      movement: 'Anti-Apartheid',
      license: 'Creative Commons'
    },
    {
      id: '7',
      type: 'poster',
      title: 'Votes for Women',
      description: 'British suffragette poster demanding voting rights for women.',
      date: '1910',
      source: 'Museum of London',
      imageUrl: '/images/gallery/suffragette.jpg',
      thumbnailUrl: '/images/gallery/thumbs/suffragette.jpg',
      tags: ['Suffrage', 'Women\'s Rights', 'Voting'],
      location: 'United Kingdom',
      movement: 'Feminist',
      license: 'Public Domain'
    },
    {
      id: '8',
      type: 'photograph',
      title: 'Spanish Civil War - International Brigades',
      description: 'Members of the International Brigades defending the Spanish Republic against fascism.',
      date: '1937',
      source: 'Abraham Lincoln Brigade Archives',
      imageUrl: '/images/gallery/int-brigades.jpg',
      thumbnailUrl: '/images/gallery/thumbs/int-brigades.jpg',
      tags: ['Spanish Civil War', 'Fascism', 'International Solidarity'],
      location: 'Spain',
      movement: 'Anti-Fascism',
      license: 'Public Domain'
    },
    {
      id: '9',
      type: 'document',
      title: 'Declaration of Independence - Haiti',
      description: 'The Haitian Declaration of Independence, the first successful slave revolution in history.',
      date: '1804-01-01',
      source: 'Archives Nationales d\'Haiti',
      imageUrl: '/images/gallery/haiti-declaration.jpg',
      thumbnailUrl: '/images/gallery/thumbs/haiti-declaration.jpg',
      tags: ['Haiti', 'Slavery', 'Revolution'],
      location: 'Haiti',
      people: ['Jean-Jacques Dessalines'],
      movement: 'Anti-Colonial',
      license: 'Public Domain'
    },
    {
      id: '10',
      type: 'photograph',
      title: 'Standing Rock Protest',
      description: 'Water protectors at Standing Rock opposing the Dakota Access Pipeline.',
      date: '2016-11',
      source: 'Indigenous Environmental Network',
      imageUrl: '/images/gallery/standing-rock.jpg',
      thumbnailUrl: '/images/gallery/thumbs/standing-rock.jpg',
      tags: ['Standing Rock', 'DAPL', 'Water Protectors'],
      location: 'North Dakota, USA',
      movement: 'Indigenous Rights',
      license: 'Creative Commons'
    },
    {
      id: '11',
      type: 'map',
      title: 'Palestine Village Depopulation 1948',
      description: 'Map showing Palestinian villages depopulated during the 1948 Nakba.',
      date: '1948',
      source: 'Palestine Remembered',
      imageUrl: '/images/gallery/nakba-map.jpg',
      thumbnailUrl: '/images/gallery/thumbs/nakba-map.jpg',
      tags: ['Nakba', 'Palestine', 'Displacement'],
      location: 'Palestine',
      movement: 'Anti-Colonial',
      license: 'Creative Commons'
    },
    {
      id: '12',
      type: 'poster',
      title: 'Free Nelson Mandela',
      description: 'International campaign poster demanding the release of Nelson Mandela.',
      date: '1985',
      source: 'Anti-Apartheid Movement Archives',
      imageUrl: '/images/gallery/free-mandela.jpg',
      thumbnailUrl: '/images/gallery/thumbs/free-mandela.jpg',
      tags: ['Mandela', 'Political Prisoner', 'ANC'],
      people: ['Nelson Mandela'],
      movement: 'Anti-Apartheid',
      license: 'Creative Commons'
    }
  ];

  const filteredItems = galleryItems.filter(item => {
    if (filters.type !== 'all' && item.type !== filters.type) return false;
    if (filters.movement !== 'all' && item.movement !== filters.movement) return false;
    if (filters.decade !== 'all') {
      const year = parseInt(item.date.substring(0, 4));
      const decadeStart = parseInt(filters.decade.substring(0, 4));
      if (year < decadeStart || year >= decadeStart + 10) return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.tags.some(t => t.toLowerCase().includes(searchLower)) ||
        item.people?.some(p => p.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const getTypeIcon = (type: GalleryItem['type']) => {
    const icons = { image: '🖼️', document: '📄', poster: '📰', photograph: '📷', map: '🗺️' };
    return icons[type];
  };

  return (
    <div style={{ background: '#FFF5F6', fontFamily: 'Georgia, serif' }} className="min-h-screen">
      {/* Hero */}
      <div style={{ background: 'linear-gradient(to right, #8B1A1A, #C41E3A)' }} className="text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Historical Gallery</h1>
          <p className="text-xl max-w-3xl" style={{ color: 'rgba(255,255,255,0.85)' }}>
            A visual archive of liberation struggles, revolutionary movements,
            and people's history through photographs, posters, documents, and maps.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search gallery..."
                className="w-full px-3 py-2 rounded-lg"
                style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              >
                <option value="all">All Types</option>
                <option value="photograph">Photographs</option>
                <option value="poster">Posters</option>
                <option value="document">Documents</option>
                <option value="map">Maps</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>Movement</label>
              <select
                value={filters.movement}
                onChange={(e) => setFilters({ ...filters, movement: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              >
                <option value="all">All Movements</option>
                {movements.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>Decade</label>
              <select
                value={filters.decade}
                onChange={(e) => setFilters({ ...filters, decade: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              >
                <option value="all">All Periods</option>
                {decades.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="mb-4" style={{ color: '#5C3D2E' }}>
          Showing {filteredItems.length} items
        </p>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}
            >
              {/* Image placeholder */}
              <div className="aspect-[4/3] flex items-center justify-center" style={{ background: 'rgba(196, 30, 58, 0.04)' }}>
                <span className="text-6xl opacity-50">{getTypeIcon(item.type)}</span>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getTypeIcon(item.type)}</span>
                  <span className="text-xs uppercase" style={{ color: '#8B7355' }}>{item.type}</span>
                  <span className="text-xs" style={{ color: '#E8C8C8' }}>•</span>
                  <span className="text-xs" style={{ color: '#8B7355' }}>{item.date.substring(0, 4)}</span>
                </div>

                <h3 className="font-semibold mb-1" style={{ color: '#2C1810' }}>
                  {item.title}
                </h3>

                <p className="text-sm line-clamp-2" style={{ color: '#5C3D2E' }}>
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-1 mt-3">
                  {item.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderRadius: '10px' }}>
            <p style={{ color: '#8B7355' }}>No items match your filters</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            style={{ background: '#FFFFFF' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="aspect-[16/10] flex items-center justify-center" style={{ background: 'rgba(196, 30, 58, 0.04)' }}>
              <span className="text-8xl opacity-50">{getTypeIcon(selectedItem.type)}</span>
            </div>

            {/* Details */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#2C1810' }}>
                    {selectedItem.title}
                  </h2>
                  <p style={{ color: '#8B7355' }}>{selectedItem.date}</p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-2xl"
                  style={{ color: '#8B7355' }}
                >
                  ×
                </button>
              </div>

              <p className="mb-4" style={{ color: '#5C3D2E' }}>
                {selectedItem.description}
              </p>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {selectedItem.location && (
                  <div>
                    <span className="font-medium" style={{ color: '#8B7355' }}>Location:</span>
                    <span className="ml-2" style={{ color: '#2C1810' }}>{selectedItem.location}</span>
                  </div>
                )}

                {selectedItem.people && selectedItem.people.length > 0 && (
                  <div>
                    <span className="font-medium" style={{ color: '#8B7355' }}>People:</span>
                    <span className="ml-2" style={{ color: '#2C1810' }}>{selectedItem.people.join(', ')}</span>
                  </div>
                )}

                <div>
                  <span className="font-medium" style={{ color: '#8B7355' }}>Movement:</span>
                  <span className="ml-2" style={{ color: '#2C1810' }}>{selectedItem.movement}</span>
                </div>

                <div>
                  <span className="font-medium" style={{ color: '#8B7355' }}>Source:</span>
                  <span className="ml-2" style={{ color: '#2C1810' }}>{selectedItem.source}</span>
                </div>

                <div>
                  <span className="font-medium" style={{ color: '#8B7355' }}>License:</span>
                  <span className="ml-2" style={{ color: '#2C1810' }}>{selectedItem.license}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {selectedItem.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricalGalleryPage;
