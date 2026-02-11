import { useEffect, useRef, useState } from "react";
import * as d3 from "d3-force";
import * as d3Selection from "d3-selection";
import * as d3Drag from "d3-drag";
import * as d3Zoom from "d3-zoom";

interface NetworkNode {
  id: string;
  name: string;
  type: "person" | "event" | "movement" | "organization" | "book";
  group?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface NetworkLink {
  source: string | NetworkNode;
  target: string | NetworkNode;
  type: "influenced" | "participated" | "authored" | "founded" | "member" | "related";
  strength?: number;
}

interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

interface NetworkGraphProps {
  data: NetworkData;
  width?: number;
  height?: number;
  onNodeClick?: (node: NetworkNode) => void;
}

const NODE_COLORS: Record<NetworkNode["type"], string> = {
  person: "#ef4444",
  event: "#3b82f6",
  movement: "#22c55e",
  organization: "#f59e0b",
  book: "#8b5cf6",
};

const LINK_COLORS: Record<NetworkLink["type"], string> = {
  influenced: "#94a3b8",
  participated: "#60a5fa",
  authored: "#a78bfa",
  founded: "#4ade80",
  member: "#fbbf24",
  related: "#cbd5e1",
};

export default function NetworkGraph({
  data,
  width = 800,
  height = 600,
  onNodeClick,
}: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3Selection.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = svg.append("g");

    const zoom = d3Zoom.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<NetworkNode>(data.nodes)
      .force("link", d3.forceLink<NetworkNode, NetworkLink>(data.links)
        .id((d) => d.id)
        .distance(100)
        .strength((d) => d.strength || 0.5))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    const link = container.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", (d) => LINK_COLORS[d.type])
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.sqrt(d.strength || 1) * 2);

    const node = container.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call((selection: any) => {
        selection.call(d3Drag.drag<SVGGElement, NetworkNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }))
      });

    node.append("circle")
      .attr("r", 12)
      .attr("fill", (d) => NODE_COLORS[d.type])
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    node.append("text")
      .text((d) => d.name.length > 20 ? d.name.slice(0, 20) + "..." : d.name)
      .attr("x", 16)
      .attr("y", 4)
      .attr("font-size", "12px")
      .attr("fill", "#e5e7eb");

    node.on("click", (event, d) => {
      event.stopPropagation();
      setSelectedNode(d);
      onNodeClick?.(d);
    });

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as NetworkNode).x || 0)
        .attr("y1", (d) => (d.source as NetworkNode).y || 0)
        .attr("x2", (d) => (d.target as NetworkNode).x || 0)
        .attr("y2", (d) => (d.target as NetworkNode).y || 0);

      node.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    svg.on("click", () => setSelectedNode(null));

    return () => simulation.stop();
  }, [data, width, height, onNodeClick]);

  return (
    <div className="relative">
      <svg ref={svgRef} width={width} height={height} className="bg-gray-900 rounded-lg" />
      
      <div className="absolute top-4 left-4 bg-gray-800/90 rounded-lg p-3 text-sm">
        <h4 className="font-semibold text-gray-200 mb-2">Node Types</h4>
        <div className="space-y-1">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-gray-300 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedNode && (
        <div className="absolute bottom-4 right-4 bg-gray-800/90 rounded-lg p-4 max-w-xs">
          <h4 className="font-semibold text-gray-200">{selectedNode.name}</h4>
          <p className="text-gray-400 text-sm capitalize">{selectedNode.type}</p>
        </div>
      )}

      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
        Drag nodes to reposition | Scroll to zoom | Click for details
      </div>
    </div>
  );
}
