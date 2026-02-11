import { useState, useEffect, useRef } from "react";

interface TimelineEvent {
  id: string;
  year: number;
  month?: number;
  day?: number;
  title: string;
  description?: string;
  category?: string;
  location?: string;
  image?: string;
}

interface AnimatedTimelineProps {
  events: TimelineEvent[];
  startYear?: number;
  endYear?: number;
  autoPlay?: boolean;
  playSpeed?: number; // milliseconds per year
  onEventSelect?: (event: TimelineEvent) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  revolution: "#ef4444",
  protest: "#3b82f6",
  war: "#dc2626",
  treaty: "#22c55e",
  founding: "#f59e0b",
  assassination: "#7c3aed",
  election: "#06b6d4",
  default: "#6b7280",
};

export default function AnimatedTimeline({
  events,
  startYear,
  endYear,
  autoPlay = false,
  playSpeed = 500,
  onEventSelect,
}: AnimatedTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate year range from events if not provided
  const minYear = startYear || Math.min(...events.map(e => e.year));
  const maxYear = endYear || Math.max(...events.map(e => e.year));
  
  const [currentYear, setCurrentYear] = useState(minYear);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);

  // Filter events up to current year for animation
  const visibleEvents = events.filter(e => e.year <= currentYear);
  
  // Get events for current year (for highlighting)
  const currentYearEvents = events.filter(e => e.year === currentYear);

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentYear(prev => {
        if (prev >= maxYear) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, maxYear, playSpeed]);

  // Calculate position on timeline
  const getPosition = (year: number) => {
    return ((year - minYear) / (maxYear - minYear)) * 100;
  };

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    onEventSelect?.(event);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentYear(parseInt(e.target.value));
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (currentYear >= maxYear) {
      setCurrentYear(minYear);
    }
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setCurrentYear(minYear);
    setIsPlaying(false);
    setSelectedEvent(null);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={togglePlay}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isPlaying
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          Reset
        </button>

        <div className="flex-1 flex items-center gap-4">
          <span className="text-gray-400 text-sm w-12">{minYear}</span>
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={currentYear}
            onChange={handleSliderChange}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-gray-400 text-sm w-12">{maxYear}</span>
        </div>

        <div className="text-2xl font-bold text-white min-w-[80px] text-center">
          {currentYear}
        </div>
      </div>

      {/* Current year events highlight */}
      {currentYearEvents.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
          <p className="text-yellow-400 text-sm font-medium mb-1">
            Events in {currentYear}:
          </p>
          <div className="flex flex-wrap gap-2">
            {currentYearEvents.map(event => (
              <span
                key={event.id}
                className="px-2 py-1 bg-yellow-600/30 rounded text-sm text-yellow-200 cursor-pointer hover:bg-yellow-600/50"
                onClick={() => handleEventClick(event)}
              >
                {event.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timeline visualization */}
      <div 
        ref={containerRef}
        className="relative h-32 bg-gray-900 rounded-lg overflow-hidden mb-4"
      >
        {/* Timeline line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-700 transform -translate-y-1/2" />
        
        {/* Progress indicator */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-red-600 transform -translate-y-1/2 transition-all duration-300"
          style={{ width: `${getPosition(currentYear)}%` }}
        />

        {/* Event markers */}
        {visibleEvents.map((event, index) => {
          const position = getPosition(event.year);
          const color = CATEGORY_COLORS[event.category || "default"];
          const isSelected = selectedEvent?.id === event.id;
          const isHovered = hoveredEvent?.id === event.id;
          const isCurrent = event.year === currentYear;
          
          return (
            <div
              key={event.id}
              className="absolute transform -translate-x-1/2 cursor-pointer transition-all duration-300"
              style={{ 
                left: `${position}%`,
                top: "50%",
                transform: `translate(-50%, -50%) scale(${isSelected || isHovered || isCurrent ? 1.3 : 1})`,
                zIndex: isSelected || isHovered ? 10 : index,
              }}
              onClick={() => handleEventClick(event)}
              onMouseEnter={() => setHoveredEvent(event)}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 border-white transition-all ${
                  isCurrent ? "animate-pulse" : ""
                }`}
                style={{ backgroundColor: color }}
              />
              
              {/* Tooltip on hover */}
              {(isHovered || isSelected) && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-700 rounded-lg whitespace-nowrap text-sm z-20">
                  <p className="font-semibold text-white">{event.title}</p>
                  <p className="text-gray-400">{event.year}</p>
                  {event.location && (
                    <p className="text-gray-500 text-xs">{event.location}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Year markers */}
        {Array.from({ length: Math.floor((maxYear - minYear) / 10) + 1 }, (_, i) => {
          const year = minYear + i * 10;
          return (
            <div
              key={year}
              className="absolute bottom-2 text-xs text-gray-500 transform -translate-x-1/2"
              style={{ left: `${getPosition(year)}%` }}
            >
              {year}
            </div>
          );
        })}
      </div>

      {/* Selected event detail */}
      {selectedEvent && (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-bold text-white">{selectedEvent.title}</h3>
              <p className="text-gray-400">
                {selectedEvent.year}
                {selectedEvent.month && `-${selectedEvent.month.toString().padStart(2, "0")}`}
                {selectedEvent.day && `-${selectedEvent.day.toString().padStart(2, "0")}`}
                {selectedEvent.location && ` • ${selectedEvent.location}`}
              </p>
            </div>
            {selectedEvent.category && (
              <span
                className="px-2 py-1 rounded text-xs text-white"
                style={{ backgroundColor: CATEGORY_COLORS[selectedEvent.category] }}
              >
                {selectedEvent.category}
              </span>
            )}
          </div>
          {selectedEvent.description && (
            <p className="text-gray-300 mt-2">{selectedEvent.description}</p>
          )}
          <button
            onClick={() => setSelectedEvent(null)}
            className="mt-3 text-sm text-gray-500 hover:text-gray-300"
          >
            Close
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {Object.entries(CATEGORY_COLORS).filter(([k]) => k !== "default").map(([category, color]) => (
          <div key={category} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-400 capitalize">{category}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Showing {visibleEvents.length} of {events.length} events
      </div>
    </div>
  );
}
