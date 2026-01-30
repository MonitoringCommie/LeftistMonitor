
import { useSelectedYear } from '../../stores/mapStore'

interface FeaturedItem {
  id: string
  type: 'country' | 'event' | 'person' | 'conflict'
  title: string
  subtitle: string
  year?: number
  link: string
  image?: string
}

// Curated featured items - can be expanded or made dynamic
const FEATURED_ITEMS: FeaturedItem[] = [
  {
    id: '1',
    type: 'event',
    title: 'Russian Revolution',
    subtitle: 'The October Revolution transforms Russia into the first socialist state',
    year: 1917,
    link: '/event/russian-revolution',
  },
  {
    id: '2',
    type: 'event',
    title: 'Spanish Civil War',
    subtitle: 'Republican forces battle Franco\'s Nationalists in a prelude to WWII',
    year: 1936,
    link: '/event/spanish-civil-war',
  },
  {
    id: '3',
    type: 'event',
    title: 'Cuban Revolution',
    subtitle: 'Fidel Castro and revolutionaries overthrow Batista\'s dictatorship',
    year: 1959,
    link: '/event/cuban-revolution',
  },
  {
    id: '4',
    type: 'event',
    title: 'Fall of the Berlin Wall',
    subtitle: 'The collapse of the Iron Curtain transforms Eastern Europe',
    year: 1989,
    link: '/event/berlin-wall-fall',
  },
]

const QUICK_JUMPS = [
  { year: 1917, label: 'Russian Revolution' },
  { year: 1936, label: 'Spanish Civil War' },
  { year: 1945, label: 'End of WWII' },
  { year: 1959, label: 'Cuban Revolution' },
  { year: 1968, label: 'Prague Spring' },
  { year: 1989, label: 'Fall of Berlin Wall' },
  { year: 1991, label: 'USSR Dissolution' },
]

const TYPE_COLORS = {
  country: 'bg-blue-100 text-blue-800 border-blue-200',
  event: 'bg-green-100 text-green-800 border-green-200',
  person: 'bg-purple-100 text-purple-800 border-purple-200',
  conflict: 'bg-red-100 text-red-800 border-red-200',
}

interface FeaturedContentProps {
  onYearSelect: (year: number) => void
}

export default function FeaturedContent({ onYearSelect }: FeaturedContentProps) {
  const selectedYear = useSelectedYear()

  return (
    <div className="absolute bottom-20 left-4 right-4 z-10 pointer-events-none">
      <div className="max-w-6xl mx-auto">
        {/* Quick Jump Years */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 mb-3 pointer-events-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Jump to Key Events
          </h3>
          <div className="flex flex-wrap gap-2">
            {QUICK_JUMPS.map((jump) => (
              <button
                key={jump.year}
                onClick={() => onYearSelect(jump.year)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  selectedYear === jump.year
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                }`}
              >
                {jump.year} - {jump.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Cards - Hidden on small screens */}
        <div className="hidden lg:grid grid-cols-4 gap-3 pointer-events-auto">
          {FEATURED_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => item.year && onYearSelect(item.year)}
              className={`bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 cursor-pointer hover:shadow-xl transition-all border-l-4 ${
                TYPE_COLORS[item.type]
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[item.type]}`}>
                  {item.type}
                </span>
                {item.year && (
                  <span className="text-xs text-gray-500">{item.year}</span>
                )}
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
              <p className="text-xs text-gray-600 line-clamp-2 mt-1">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
