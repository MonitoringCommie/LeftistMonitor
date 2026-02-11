import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Settlement {
  id: string;
  name: string;
  year_established: number;
  latitude: number;
  longitude: number;
  population?: number;
  type: 'settlement' | 'outpost' | 'industrial_zone' | 'military';
  status: 'active' | 'evacuated' | 'demolished';
}

interface SettlementTimelineProps {
  settlements: Settlement[];
  startYear: number;
  endYear: number;
  title?: string;
  mapCenter?: [number, number];
  mapZoom?: number;
}

const SettlementTimeline: React.FC<SettlementTimelineProps> = ({
  settlements,
  startYear,
  endYear,
  title = 'Settlement Expansion Timeline',
  mapCenter = [31.5, 35.0],
  mapZoom = 8
}) => {
  const [currentYear, setCurrentYear] = useState(startYear);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const visibleSettlements = settlements.filter(s => s.year_established <= currentYear);

  const getTypeColor = (type: Settlement['type']) => {
    const colors = {
      settlement: '#ef4444',      // red
      outpost: '#f97316',         // orange
      industrial_zone: '#8b5cf6', // purple
      military: '#064e3b'         // dark green
    };
    return colors[type];
  };

  const getTypeSize = (type: Settlement['type'], population?: number) => {
    const baseSizes = { settlement: 8, outpost: 5, industrial_zone: 10, military: 7 };
    const baseSize = baseSizes[type];
    if (population) {
      return Math.min(baseSize + Math.log10(population) * 2, 20);
    }
    return baseSize;
  };

  // Simple map projection (Mercator approximation)
  const projectToCanvas = useCallback((lat: number, lng: number, width: number, height: number) => {
    const [centerLat, centerLng] = mapCenter;
    const scale = Math.pow(2, mapZoom) * 0.5;
    
    const x = (lng - centerLng) * scale + width / 2;
    const y = (centerLat - lat) * scale * 1.2 + height / 2;
    
    return { x, y };
  }, [mapCenter, mapZoom]);

  // Draw settlements on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#2d2d44';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw settlements
    visibleSettlements.forEach(settlement => {
      const { x, y } = projectToCanvas(settlement.latitude, settlement.longitude, width, height);
      const size = getTypeSize(settlement.type, settlement.population);
      const color = getTypeColor(settlement.type);
      const yearsOld = currentYear - settlement.year_established;
      const opacity = Math.min(0.3 + yearsOld * 0.05, 1);

      // Glow effect
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      gradient.addColorStop(0, color + Math.round(opacity * 255).toString(16).padStart(2, '0'));
      gradient.addColorStop(1, color + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Pulse effect for new settlements
      if (yearsOld <= 2) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1 - yearsOld * 0.3;
        ctx.beginPath();
        ctx.arc(x, y, size + 5 + yearsOld * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    // Draw legend
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    const legendItems = [
      { type: 'settlement', label: 'Settlement' },
      { type: 'outpost', label: 'Outpost' },
      { type: 'industrial_zone', label: 'Industrial Zone' },
      { type: 'military', label: 'Military' }
    ];

    legendItems.forEach((item, i) => {
      const x = 20;
      const y = height - 80 + i * 20;
      ctx.fillStyle = getTypeColor(item.type as Settlement['type']);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(item.label, x + 15, y + 4);
    });

  }, [visibleSettlements, currentYear, projectToCanvas]);

  // Playback animation
  useEffect(() => {
    if (isPlaying) {
      const interval = 1000 / playbackSpeed;
      animationRef.current = window.setInterval(() => {
        setCurrentYear(prev => {
          if (prev >= endYear) {
            setIsPlaying(false);
            return endYear;
          }
          return prev + 1;
        });
      }, interval);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, endYear]);

  const handlePlayPause = () => {
    if (currentYear >= endYear) {
      setCurrentYear(startYear);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentYear(startYear);
  };

  // Statistics
  const stats = {
    total: visibleSettlements.length,
    byType: {
      settlement: visibleSettlements.filter(s => s.type === 'settlement').length,
      outpost: visibleSettlements.filter(s => s.type === 'outpost').length,
      industrial_zone: visibleSettlements.filter(s => s.type === 'industrial_zone').length,
      military: visibleSettlements.filter(s => s.type === 'military').length
    },
    totalPopulation: visibleSettlements.reduce((sum, s) => sum + (s.population || 0), 0)
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-gray-400 text-sm">
          Visualizing expansion from {startYear} to {endYear}
        </p>
      </div>

      {/* Canvas Map */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full"
        />
        
        {/* Year Display */}
        <div className="absolute top-4 right-4 bg-black/70 px-4 py-2 rounded">
          <span className="text-4xl font-bold text-white">{currentYear}</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="p-4 bg-gray-800 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400">Total Sites</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-500">{stats.byType.settlement}</div>
          <div className="text-xs text-gray-400">Settlements</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-orange-500">{stats.byType.outpost}</div>
          <div className="text-xs text-gray-400">Outposts</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-500">{stats.byType.industrial_zone}</div>
          <div className="text-xs text-gray-400">Industrial</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-500">{stats.totalPopulation.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Est. Population</div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4">
        {/* Timeline Slider */}
        <div>
          <input
            type="range"
            min={startYear}
            max={endYear}
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{startYear}</span>
            <span>{endYear}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
            title="Reset"
          >
            ⏮
          </button>
          
          <button
            onClick={handlePlayPause}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xl"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
          </select>
        </div>
      </div>

      {/* Timeline Events */}
      <div className="p-4 border-t border-gray-800 max-h-40 overflow-y-auto">
        <h4 className="text-sm font-medium text-gray-400 mb-2">New in {currentYear}</h4>
        <div className="space-y-1">
          {settlements
            .filter(s => s.year_established === currentYear)
            .map(s => (
              <div key={s.id} className="flex items-center gap-2 text-sm">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getTypeColor(s.type) }}
                />
                <span className="text-white">{s.name}</span>
                <span className="text-gray-500">({s.type})</span>
              </div>
            ))}
          {settlements.filter(s => s.year_established === currentYear).length === 0 && (
            <span className="text-gray-500 text-sm">No new sites this year</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettlementTimeline;
