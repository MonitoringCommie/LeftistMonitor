import { useMemo } from "react";
import {
  Sankey,
  Tooltip,
  Layer,
  Rectangle,
  ResponsiveContainer,
} from "recharts";

interface SankeyNode {
  name: string;
}

interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface SankeyDiagramProps {
  data: SankeyData;
  title?: string;
  height?: number;
}

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
];

// Custom node component
const CustomNode = ({ x, y, width, height, index, payload }: any) => {
  const color = COLORS[index % COLORS.length];
  return (
    <Layer key={`node-${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        fillOpacity={0.9}
      />
      <text
        x={x < 200 ? x + width + 6 : x - 6}
        y={y + height / 2}
        textAnchor={x < 200 ? "start" : "end"}
        dominantBaseline="middle"
        fill="#e5e7eb"
        fontSize={12}
      >
        {payload.name}
      </text>
    </Layer>
  );
};

// Custom link component
const CustomLink = ({ sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index }: any) => {
  const color = COLORS[index % COLORS.length];
  const gradientId = `gradient-${index}`;
  
  return (
    <Layer key={`link-${index}`}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={0.5} />
          <stop offset="100%" stopColor={color} stopOpacity={0.2} />
        </linearGradient>
      </defs>
      <path
        d={`
          M${sourceX},${sourceY}
          C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
          L${targetX},${targetY + linkWidth}
          C${targetControlX},${targetY + linkWidth} ${sourceControlX},${sourceY + linkWidth} ${sourceX},${sourceY + linkWidth}
          Z
        `}
        fill={`url(#${gradientId})`}
        stroke={color}
        strokeWidth={0.5}
        strokeOpacity={0.3}
      />
    </Layer>
  );
};

export default function SankeyDiagram({ 
  data, 
  title = "Flow Diagram",
  height = 500 
}: SankeyDiagramProps) {
  // Calculate totals for display
  const totalFlow = useMemo(() => {
    return data.links.reduce((sum, link) => sum + link.value, 0);
  }, [data.links]);

  if (!data.nodes.length || !data.links.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
        <span className="text-sm text-gray-400">
          Total: {totalFlow.toLocaleString()}
        </span>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <Sankey
          data={data}
          node={<CustomNode />}
          link={<CustomLink />}
          nodePadding={50}
          nodeWidth={10}
          margin={{ top: 20, right: 200, bottom: 20, left: 20 }}
        >
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#e5e7eb" }}
            formatter={(value: number | undefined) => value ? [value.toLocaleString(), "Flow"] : ["N/A", "Flow"]}
          />
        </Sankey>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {data.nodes.slice(0, 10).map((node, i) => (
          <div key={i} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-xs text-gray-400">{node.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
