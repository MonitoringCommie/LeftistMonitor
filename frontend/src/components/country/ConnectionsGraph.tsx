import { useEffect, useRef, useCallback, memo } from 'react'
import { select } from 'd3-selection'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, type SimulationNodeDatum, type SimulationLinkDatum } from 'd3-force'
import { zoom } from 'd3-zoom'
import { drag } from 'd3-drag'
import type { ConnectionGraph, ConnectionGraphNode } from '../../types'

interface ConnectionsGraphProps {
  data: ConnectionGraph
  width?: number
  height?: number
  onNodeClick?: (nodeId: string) => void
}

const CONNECTION_COLORS: Record<string, string> = {
  influenced_by: '#3b82f6',
  influenced: '#3b82f6',
  collaborated_with: '#22c55e',
  opposed: '#ef4444',
  mentor_of: '#8b5cf6',
  student_of: '#8b5cf6',
  married_to: '#ec4899',
  parent_of: '#f97316',
  child_of: '#f97316',
  sibling_of: '#eab308',
  colleague_of: '#6b7280',
}

interface SimNode extends ConnectionGraphNode, SimulationNodeDatum {}

interface SimLink extends SimulationLinkDatum<SimNode> {
  type: string
  strength: number
}

const ConnectionsGraph = memo(function ConnectionsGraph({
  data,
  width = 400,
  height = 300,
  onNodeClick,
}: ConnectionsGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null)

  const handleNodeClick = useCallback((nodeId: string) => {
    onNodeClick?.(nodeId)
  }, [onNodeClick])

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return

    // Stop previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop()
    }

    const svg = select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg.append('g')

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoomBehavior)

    const nodes: SimNode[] = data.nodes.map(n => ({ ...n }))
    const links: SimLink[] = data.links.map(l => ({
      source: l.source,
      target: l.target,
      type: l.type,
      strength: l.strength,
    }))

    const simulation = forceSimulation<SimNode>(nodes)
      .force('link', forceLink<SimNode, SimLink>(links)
        .id(d => d.id)
        .distance(80)
        .strength(d => d.strength * 0.5)
      )
      .force('charge', forceManyBody().strength(-200))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collision', forceCollide().radius(30))
      .alphaDecay(0.02)  // Slower decay for smoother animation
      .velocityDecay(0.3) // Reduce velocity for stability

    simulationRef.current = simulation

    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => CONNECTION_COLORS[d.type] || '#9ca3af')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.max(1, d.strength * 2))

    const linkLabel = g.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('font-size', 8)
      .attr('fill', '#6b7280')
      .attr('text-anchor', 'middle')
      .text(d => d.type.replace('_', ' '))

    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, SimNode>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(drag<SVGGElement, SimNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
      )
      .on('click', (event, d) => {
        event.stopPropagation()
        handleNodeClick(d.id)
      })

    node.append('circle')
      .attr('r', 20)
      .attr('fill', '#fff')
      .attr('stroke', '#374151')
      .attr('stroke-width', 2)

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .attr('fill', '#374151')
      .text(d => d.name[0])

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 35)
      .attr('font-size', 10)
      .attr('fill', '#374151')
      .text(d => d.name.length > 15 ? d.name.slice(0, 15) + '...' : d.name)

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as SimNode).x ?? 0)
        .attr('y1', d => (d.source as SimNode).y ?? 0)
        .attr('x2', d => (d.target as SimNode).x ?? 0)
        .attr('y2', d => (d.target as SimNode).y ?? 0)

      linkLabel
        .attr('x', d => (((d.source as SimNode).x ?? 0) + ((d.target as SimNode).x ?? 0)) / 2)
        .attr('y', d => (((d.source as SimNode).y ?? 0) + ((d.target as SimNode).y ?? 0)) / 2)

      node.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    return () => {
      simulation.stop()
      simulationRef.current = null
    }
  }, [data, width, height, handleNodeClick])

  if (!data.nodes.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No connections to display
      </div>
    )
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-gray-50 rounded-lg"
      />

      <div className="absolute bottom-2 left-2 bg-white/90 rounded p-2 text-xs">
        <div className="font-medium mb-1">Connection Types</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          {Object.entries(CONNECTION_COLORS).slice(0, 6).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div className="w-3 h-0.5" style={{ backgroundColor: color }} />
              <span className="capitalize">{type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

export default ConnectionsGraph
