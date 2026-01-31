import { Link } from 'react-router-dom'

interface TopicCard {
  title: string
  icon: string
  description: string
  path: string
  color: string
  bgColor: string
}

const topics: TopicCard[] = [
  {
    title: 'World Map',
    icon: '🗺️',
    description: 'Interactive map with historical borders, conflicts, and liberation struggles',
    path: '/map',
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100 border-red-200',
  },
  {
    title: 'Books',
    icon: '📚',
    description: 'Essential leftist literature, political texts, and revolutionary writings',
    path: '/books',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
  },
  {
    title: 'Conflicts',
    icon: '⚔️',
    description: 'Wars, frontlines, military data, and ongoing struggles worldwide',
    path: '/frontlines',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
  },
  {
    title: 'Statistics',
    icon: '📊',
    description: 'Global rankings, GDP, military spending, and demographic data',
    path: '/stats',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
  },
  {
    title: 'Glossary',
    icon: '📖',
    description: 'Political terminology, concepts, and leftist theory explained',
    path: '/glossary',
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100 border-green-200',
  },
  {
    title: 'Compare',
    icon: '⚖️',
    description: 'Compare countries side-by-side across various metrics',
    path: '/compare',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
  },
  {
    title: 'People',
    icon: '👥',
    description: 'Revolutionary figures, politicians, activists, and political theorists',
    path: '/people',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 hover:bg-pink-100 border-pink-200',
  },
  {
    title: 'About',
    icon: '🏛️',
    description: 'Project information, data sources, and how to contribute',
    path: '/about',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 hover:bg-gray-100 border-gray-200',
  },
]

export default function HubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="pt-16 pb-12 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          <span className="text-red-600">★</span> Leftist Monitor <span className="text-red-600">★</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Explore global political history, liberation struggles, and revolutionary movements
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          A comprehensive database of books, elections, conflicts, and political data from every country
        </p>
      </div>

      {/* Topic Cards Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topics.map((topic) => (
            <Link
              key={topic.path}
              to={topic.path}
              className={`
                block p-6 rounded-xl border-2 transition-all duration-200
                transform hover:scale-105 hover:shadow-lg
                ${topic.bgColor}
              `}
            >
              <div className="text-4xl mb-3">{topic.icon}</div>
              <h2 className={`text-xl font-bold mb-2 ${topic.color}`}>
                {topic.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {topic.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-center text-lg font-semibold text-gray-700 dark:text-gray-300 mb-8">
            Database Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-red-600">200+</div>
              <div className="text-sm text-gray-500">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600">20,000+</div>
              <div className="text-sm text-gray-500">Books</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">30,000+</div>
              <div className="text-sm text-gray-500">Elections</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">70,000+</div>
              <div className="text-sm text-gray-500">Events</div>
            </div>
          </div>
        </div>
      </div>

      {/* Liberation Struggles Highlight */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h3 className="text-center text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">
          Featured Liberation Struggles
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {['Palestine', 'Ireland', 'Kurdistan', 'Kashmir', 'Tibet', 'Western Sahara', 'West Papua'].map((struggle) => (
            <Link
              key={struggle}
              to="/map"
              className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition-colors"
            >
              {struggle}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
        <p>Data sourced from Wikidata, World Bank, UCDP, and other open sources</p>
        <p className="mt-1">Built for education and solidarity</p>
      </div>
    </div>
  )
}
