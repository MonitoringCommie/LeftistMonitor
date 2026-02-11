import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface HeatmapPoint {
  lat: number;
  lon: number;
  intensity?: number;
  category?: string;
  name?: string;
  year?: number;
}

interface HeatmapLayerProps {
  points: HeatmapPoint[];
  title?: string;
  colorScheme?: "violence" | "protest" | "neutral";
  initialZoom?: number;
  initialCenter?: [number, number];
}

const COLOR_SCHEMES = {
  violence: [
    "interpolate",
    ["linear"],
    ["heatmap-density"],
    0, "rgba(0,0,0,0)",
    0.2, "rgba(178,24,43,0.4)",
    0.4, "rgba(214,96,77,0.6)",
    0.6, "rgba(244,165,130,0.7)",
    0.8, "rgba(253,219,199,0.8)",
    1, "rgba(255,255,255,0.9)"
  ],
  protest: [
    "interpolate",
    ["linear"],
    ["heatmap-density"],
    0, "rgba(0,0,0,0)",
    0.2, "rgba(49,54,149,0.4)",
    0.4, "rgba(69,117,180,0.6)",
    0.6, "rgba(116,173,209,0.7)",
    0.8, "rgba(171,217,233,0.8)",
    1, "rgba(224,243,248,0.9)"
  ],
  neutral: [
    "interpolate",
    ["linear"],
    ["heatmap-density"],
    0, "rgba(0,0,0,0)",
    0.2, "rgba(255,237,160,0.4)",
    0.4, "rgba(254,217,118,0.6)",
    0.6, "rgba(254,178,76,0.7)",
    0.8, "rgba(253,141,60,0.8)",
    1, "rgba(252,78,42,0.9)"
  ],
};

export default function HeatmapLayer({
  points,
  title = "Heatmap",
  colorScheme = "neutral",
  initialZoom = 2,
  initialCenter = [0, 20],
}: HeatmapLayerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [heatmapIntensity, setHeatmapIntensity] = useState(1);
  const [heatmapRadius, setHeatmapRadius] = useState(20);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
      },
      center: initialCenter,
      zoom: initialZoom,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, [initialCenter, initialZoom]);

  useEffect(() => {
    if (!map.current || !loaded || points.length === 0) return;

    const geojsonData: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: points.map((p) => ({
        type: "Feature",
        properties: {
          intensity: p.intensity || 1,
          category: p.category,
          name: p.name,
          year: p.year,
        },
        geometry: {
          type: "Point",
          coordinates: [p.lon, p.lat],
        },
      })),
    };

    // Remove existing layers and source
    if (map.current.getLayer("heatmap-layer")) {
      map.current.removeLayer("heatmap-layer");
    }
    if (map.current.getLayer("point-layer")) {
      map.current.removeLayer("point-layer");
    }
    if (map.current.getSource("heatmap-data")) {
      map.current.removeSource("heatmap-data");
    }

    // Add source
    map.current.addSource("heatmap-data", {
      type: "geojson",
      data: geojsonData,
    });

    // Add heatmap layer
    map.current.addLayer({
      id: "heatmap-layer",
      type: "heatmap",
      source: "heatmap-data",
      paint: {
        "heatmap-weight": ["get", "intensity"],
        "heatmap-intensity": heatmapIntensity,
        "heatmap-color": COLOR_SCHEMES[colorScheme] as any,
        "heatmap-radius": heatmapRadius,
        "heatmap-opacity": 0.8,
      },
    });

    // Add point layer (visible at higher zoom)
    map.current.addLayer({
      id: "point-layer",
      type: "circle",
      source: "heatmap-data",
      minzoom: 7,
      paint: {
        "circle-radius": 6,
        "circle-color": colorScheme === "violence" ? "#dc2626" : 
                        colorScheme === "protest" ? "#3b82f6" : "#f59e0b",
        "circle-stroke-color": "#fff",
        "circle-stroke-width": 1,
        "circle-opacity": 0.8,
      },
    });

    // Add popup on click
    map.current.on("click", "point-layer", (e) => {
      if (!e.features?.[0]) return;
      const props = e.features[0].properties;
      const coords = (e.features[0].geometry as GeoJSON.Point).coordinates;
      
      new maplibregl.Popup()
        .setLngLat(coords as [number, number])
        .setHTML(`
          <div class="p-2">
            <strong>${props.name || "Unknown"}</strong>
            ${props.year ? `<br><span class="text-gray-600">${props.year}</span>` : ""}
            ${props.category ? `<br><span class="text-gray-500 text-sm">${props.category}</span>` : ""}
          </div>
        `)
        .addTo(map.current!);
    });

    map.current.on("mouseenter", "point-layer", () => {
      if (map.current) map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseleave", "point-layer", () => {
      if (map.current) map.current.getCanvas().style.cursor = "";
    });

  }, [points, loaded, colorScheme, heatmapIntensity, heatmapRadius]);

  // Update heatmap properties when controls change
  useEffect(() => {
    if (!map.current || !loaded) return;
    if (map.current.getLayer("heatmap-layer")) {
      map.current.setPaintProperty("heatmap-layer", "heatmap-intensity", heatmapIntensity);
      map.current.setPaintProperty("heatmap-layer", "heatmap-radius", heatmapRadius);
    }
  }, [heatmapIntensity, heatmapRadius, loaded]);

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-[600px] rounded-lg" />
      
      {/* Title overlay */}
      <div className="absolute top-4 left-4 bg-gray-900/90 rounded-lg px-4 py-2">
        <h3 className="text-white font-semibold">{title}</h3>
        <p className="text-gray-400 text-sm">{points.length} data points</p>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-16 bg-gray-900/90 rounded-lg p-4 space-y-4">
        <div>
          <label className="text-gray-300 text-sm block mb-1">Intensity</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={heatmapIntensity}
            onChange={(e) => setHeatmapIntensity(parseFloat(e.target.value))}
            className="w-32"
          />
        </div>
        <div>
          <label className="text-gray-300 text-sm block mb-1">Radius</label>
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={heatmapRadius}
            onChange={(e) => setHeatmapRadius(parseInt(e.target.value))}
            className="w-32"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 rounded-lg p-3">
        <p className="text-gray-300 text-xs mb-2">Density</p>
        <div className="flex items-center gap-1">
          <span className="text-gray-500 text-xs">Low</span>
          <div 
            className="w-24 h-3 rounded"
            style={{
              background: colorScheme === "violence" 
                ? "linear-gradient(to right, rgba(0,0,0,0), #b2182b, #d6604d, #f4a582, #fddbc7, #fff)"
                : colorScheme === "protest"
                ? "linear-gradient(to right, rgba(0,0,0,0), #313695, #4575b4, #74add1, #abd9e9, #e0f3f8)"
                : "linear-gradient(to right, rgba(0,0,0,0), #ffeda0, #fed976, #feb24c, #fd8d3c, #fc4e2a)"
            }}
          />
          <span className="text-gray-500 text-xs">High</span>
        </div>
      </div>
    </div>
  );
}
