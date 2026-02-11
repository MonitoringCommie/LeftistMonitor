import React, { useState } from 'react';
import { Link } from 'react-router-dom';

type ResourceCategory = 'reading-list' | 'documentary' | 'course' | 'archive' | 'organization' | 'podcast';
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  difficulty: DifficultyLevel;
  topics: string[];
  url?: string;
  author?: string;
  year?: number;
  duration?: string;
  language: string;
  isFree: boolean;
}

const EducationalResourcesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { value: ResourceCategory; label: string; icon: string }[] = [
    { value: 'reading-list', label: 'Reading Lists', icon: '📚' },
    { value: 'documentary', label: 'Documentaries', icon: '🎬' },
    { value: 'course', label: 'Courses', icon: '🎓' },
    { value: 'archive', label: 'Archives', icon: '🗄️' },
    { value: 'organization', label: 'Organizations', icon: '🏛️' },
    { value: 'podcast', label: 'Podcasts', icon: '🎙️' },
  ];

  const topics = [
    'Labor History', 'Anti-Colonialism', 'Civil Rights', 'Feminist Movements',
    'Indigenous Rights', 'Revolutionary Movements', 'Economic Justice',
    'Environmental Justice', 'LGBTQ+ History', 'Anti-Fascism'
  ];

  const resources: Resource[] = [
    {
      id: '1',
      title: 'A People\'s History of the United States',
      description: 'Howard Zinn\'s classic work presenting American history from the perspective of those traditionally left out of conventional narratives.',
      category: 'reading-list',
      difficulty: 'beginner',
      topics: ['Labor History', 'Civil Rights', 'Anti-Colonialism'],
      author: 'Howard Zinn',
      year: 1980,
      language: 'en',
      isFree: false
    },
    {
      id: '2',
      title: 'The Wretched of the Earth',
      description: 'Frantz Fanon\'s influential work on decolonization and the psychological effects of colonialism.',
      category: 'reading-list',
      difficulty: 'intermediate',
      topics: ['Anti-Colonialism', 'Revolutionary Movements'],
      author: 'Frantz Fanon',
      year: 1961,
      language: 'en',
      isFree: false
    },
    {
      id: '3',
      title: 'Eyes on the Prize',
      description: 'Award-winning documentary series covering the American civil rights movement from 1954-1985.',
      category: 'documentary',
      difficulty: 'beginner',
      topics: ['Civil Rights'],
      year: 1987,
      duration: '14 hours',
      language: 'en',
      isFree: false
    },
    {
      id: '4',
      title: 'The Battle of Chile',
      description: 'Patricio Guzmán\'s three-part documentary chronicling the political tensions in Chile leading up to and following the 1973 coup.',
      category: 'documentary',
      difficulty: 'intermediate',
      topics: ['Revolutionary Movements', 'Anti-Colonialism'],
      author: 'Patricio Guzmán',
      year: 1975,
      duration: '4.5 hours',
      language: 'es',
      isFree: true
    },
    {
      id: '5',
      title: 'Marxists Internet Archive',
      description: 'Comprehensive online archive of Marxist writings, including works by Marx, Engels, Lenin, and many others.',
      category: 'archive',
      difficulty: 'intermediate',
      topics: ['Revolutionary Movements', 'Economic Justice', 'Labor History'],
      url: 'https://www.marxists.org',
      language: 'en',
      isFree: true
    },
    {
      id: '6',
      title: 'Revolutions Podcast',
      description: 'Mike Duncan\'s podcast covering major revolutions throughout history, from the English Civil War to the Russian Revolution.',
      category: 'podcast',
      difficulty: 'beginner',
      topics: ['Revolutionary Movements'],
      author: 'Mike Duncan',
      duration: '300+ episodes',
      language: 'en',
      isFree: true
    },
    {
      id: '7',
      title: 'Freedom Dreams: The Black Radical Imagination',
      description: 'Robin D.G. Kelley explores the history of Black radical movements and their visions for a transformed society.',
      category: 'reading-list',
      difficulty: 'intermediate',
      topics: ['Civil Rights', 'Revolutionary Movements'],
      author: 'Robin D.G. Kelley',
      year: 2002,
      language: 'en',
      isFree: false
    },
    {
      id: '8',
      title: 'An Indigenous Peoples\' History of the United States',
      description: 'Roxanne Dunbar-Ortiz challenges the founding narrative of the US through Indigenous perspectives.',
      category: 'reading-list',
      difficulty: 'beginner',
      topics: ['Indigenous Rights', 'Anti-Colonialism'],
      author: 'Roxanne Dunbar-Ortiz',
      year: 2014,
      language: 'en',
      isFree: false
    },
    {
      id: '9',
      title: 'Labor and Working-Class History Association',
      description: 'Academic organization promoting the study of labor history with resources, conferences, and publications.',
      category: 'organization',
      difficulty: 'advanced',
      topics: ['Labor History'],
      url: 'https://lawcha.org',
      language: 'en',
      isFree: true
    },
    {
      id: '10',
      title: 'The Jakarta Method',
      description: 'Vincent Bevins traces how the US-backed mass killings in Indonesia became a model for anti-communist violence worldwide.',
      category: 'reading-list',
      difficulty: 'intermediate',
      topics: ['Anti-Colonialism', 'Revolutionary Movements'],
      author: 'Vincent Bevins',
      year: 2020,
      language: 'en',
      isFree: false
    },
    {
      id: '11',
      title: 'Liberation School',
      description: 'Free online courses covering topics from Marxist economics to the history of socialist movements.',
      category: 'course',
      difficulty: 'beginner',
      topics: ['Revolutionary Movements', 'Economic Justice'],
      url: 'https://liberationschool.org',
      language: 'en',
      isFree: true
    },
    {
      id: '12',
      title: 'Caliban and the Witch',
      description: 'Silvia Federici\'s groundbreaking analysis of the witch hunts as a tool of primitive accumulation and the subjugation of women.',
      category: 'reading-list',
      difficulty: 'advanced',
      topics: ['Feminist Movements', 'Economic Justice'],
      author: 'Silvia Federici',
      year: 2004,
      language: 'en',
      isFree: false
    }
  ];

  const filteredResources = resources.filter(resource => {
    if (selectedCategory !== 'all' && resource.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && resource.difficulty !== selectedDifficulty) return false;
    if (selectedTopic !== 'all' && !resource.topics.includes(selectedTopic)) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.author?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty];
  };

  const getCategoryIcon = (category: ResourceCategory) => {
    return categories.find(c => c.value === category)?.icon || '📖';
  };

  return (
    <div className="min-h-screen" style={{ background: '#FFF5F6', fontFamily: 'Georgia, serif' }}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Educational Resources</h1>
          <p className="text-xl text-red-100 max-w-3xl">
            Curated reading lists, documentaries, courses, and archives to deepen your
            understanding of liberation struggles and progressive history.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="rounded-lg shadow p-6 mb-8" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2C1810' }}>Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg" style={{ border: '1px solid #E8C8C8', color: '#2C1810' }}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Topic Tags */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2" style={{ color: '#2C1810' }}>Topics</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTopic('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTopic === 'all'
                    ? 'bg-red-600 text-white'
                    : ''
                }`}
                style={selectedTopic !== 'all' ? { background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' } : {}}
              >
                All Topics
              </button>
              {topics.map(topic => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTopic === topic
                      ? 'bg-red-600 text-white'
                      : ''
                  }`}
                  style={selectedTopic !== topic ? { background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' } : {}}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`p-4 rounded-lg text-center transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-red-600 text-white'
                  : ''
              }`}
              style={selectedCategory !== cat.value ? { background: '#FFFFFF', border: '1px solid #E8C8C8', color: '#2C1810' } : {}}
            >
              <span className="text-2xl block mb-1">{cat.icon}</span>
              <span className="text-sm">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Results Count */}
        <p className="mb-4" style={{ color: '#5C3D2E' }}>
          Showing {filteredResources.length} resources
        </p>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(resource => (
            <div
              key={resource.id}
              className="shadow hover:shadow-lg transition-shadow overflow-hidden"
              style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{getCategoryIcon(resource.category)}</span>
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyColor(resource.difficulty)}`}>
                      {resource.difficulty}
                    </span>
                    {resource.isFree && (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                        Free
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2" style={{ color: '#2C1810' }}>
                  {resource.title}
                </h3>

                {resource.author && (
                  <p className="text-sm mb-2" style={{ color: '#8B7355' }}>
                    by {resource.author} {resource.year && `(${resource.year})`}
                  </p>
                )}

                <p className="text-sm mb-4 line-clamp-3" style={{ color: '#5C3D2E' }}>
                  {resource.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.topics.slice(0, 3).map(topic => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                {resource.duration && (
                  <p className="text-xs mb-2" style={{ color: '#8B7355' }}>Duration: {resource.duration}</p>
                )}
              </div>

              <div className="px-6 py-3 flex justify-between items-center" style={{ background: 'rgba(196, 30, 58, 0.04)', borderTop: '1px solid #E8C8C8' }}>
                <span className="text-xs uppercase" style={{ color: '#8B7355' }}>{resource.language}</span>
                {resource.url ? (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:opacity-80"
                    style={{ color: '#C41E3A' }}
                  >
                    Visit Resource →
                  </a>
                ) : (
                  <button className="text-sm font-medium hover:opacity-80" style={{ color: '#C41E3A' }}>
                    Learn More →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderRadius: '10px' }}>
            <p className="mb-2" style={{ color: '#8B7355' }}>No resources found matching your criteria</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedTopic('all');
                setSearchQuery('');
              }}
              style={{ color: '#C41E3A' }}
              className="hover:opacity-80"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Contribute CTA */}
        <div className="mt-12 text-white rounded-lg p-8 text-center" style={{ background: 'linear-gradient(to right, #8B1A1A, #C41E3A)' }}>
          <h2 className="text-2xl font-bold mb-4">Know a Great Resource?</h2>
          <p className="mb-6 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Help expand our educational library by suggesting books, documentaries,
            courses, or archives that have been valuable in your learning journey.
          </p>
          <Link
            to="/contribute/new"
            className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Suggest a Resource
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EducationalResourcesPage;
