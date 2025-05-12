'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Task } from './types';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RefreshCw, PlusCircle, Info, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
interface TaskDependencyGraphProps {
  tasks: Task[];
  onTaskClick: (_taskId: string) => void;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  status: string;
  priority: string;
  color?: string;
  dueDate?: Date;
  description?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: Node | string;
  target: Node | string;
  id?: string;
}

// Helper function to generate a unique ID for links
const generateLinkId = (source: string, target: string) => `${source}-${target}`;

const TaskDependencyGraph: React.FC<TaskDependencyGraphProps> = ({ tasks, onTaskClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State for zoom and pan
  const [, setZoomLevel] = useState<number>(1);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isAddingDependency, setIsAddingDependency] = useState<boolean>(false);
  const [dependencySource, setDependencySource] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    // Create nodes and links
    const nodes: Node[] = tasks.map(task => ({
      id: task.id,
      name: task.name,
      status: task.status,
      priority: task.priority,
      description: task.description,
      dueDate: task.dueDate,
    }));

    const links: Link[] = [];
    tasks.forEach(task => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(dependencyId => {
          // Check if the dependency exists in our filtered tasks
          if (tasks.some(t => t.id === dependencyId)) {
            const sourceNode = nodes.find(n => n.id === dependencyId);
            const targetNode = nodes.find(n => n.id === task.id);
            if (sourceNode && targetNode) {
              links.push({
                source: sourceNode,
                target: targetNode,
                id: generateLinkId(sourceNode.id, targetNode.id),
              });
            }
          }
        });
      }
    });

    // If no dependencies, show a message
    if (links.length === 0) {
      d3.select(svgRef.current)
        .append('text')
        .attr('x', '50%')
        .attr('y', '50%')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'text-muted-foreground text-sm')
        .text('No task dependencies found');
      return;
    }

    // Set up the SVG dimensions
    const width = svgRef.current.clientWidth || 800;
    const height = 500;

    // Create a force simulation
    const simulation = d3
      .forceSimulation<Node>()
      .force(
        'link',
        d3
          .forceLink<Node, Link>(links)
          .id(d => d.id)
          .distance(150)
      )
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(70))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));

    // Create the SVG elements with zoom support
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Create a container group for all elements that will be transformed
    const g = svg.append('g').attr('class', 'graph-container');

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', event => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    // Add a background rect to catch zoom events
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all');

    // Define arrow marker for links
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Create links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)')
      .attr('id', d => `link-${d.id}`);

    // Create node groups
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('id', d => `node-${d.id}`)
      .call(
        d3.drag<any, any>().on('start', dragstarted).on('drag', dragged).on('end', dragended) as any
      )
      .on('click', (event, d) => {
        // If we're adding a dependency
        if (isAddingDependency && dependencySource) {
          if (dependencySource !== d.id) {
            // Add dependency logic would go here
            setIsAddingDependency(false);
            setDependencySource(null);
          }
        } else {
          // Normal click behavior
          setSelectedTask(d.id);
          onTaskClick(d.id);
        }

        // Stop propagation to prevent zoom behavior
        event.stopPropagation();
      });

    // Add task cards with improved styling
    node
      .append('rect')
      .attr('width', 140)
      .attr('height', 60)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', d => {
        if (d.color) return `${d.color}20`;

        switch (d.status) {
          case 'To Do':
            return '#f1f5f9';
          case 'In Progress':
            return '#dbeafe';
          case 'Review':
            return '#fef3c7';
          case 'Completed':
            return '#dcfce7';
          default:
            return '#f1f5f9';
        }
      })
      .attr('stroke', d => {
        if (d.color) return d.color;

        switch (d.status) {
          case 'To Do':
            return '#cbd5e1';
          case 'In Progress':
            return '#3b82f6';
          case 'Review':
            return '#f59e0b';
          case 'Completed':
            return '#10b981';
          default:
            return '#cbd5e1';
        }
      })
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .attr('filter', 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1))')
      .attr('class', d => {
        return selectedTask === d.id ? 'selected-task' : '';
      })
      .on('mouseover', function () {
        d3.select(this).attr('stroke-width', 3);
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke-width', 2);
      });

    // Add task names
    node
      .append('text')
      .attr('x', 70)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('class', 'text-sm font-medium')
      .attr('fill', '#1e293b')
      .text(d => (d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name));

    // Add status indicators
    node
      .append('text')
      .attr('x', 70)
      .attr('y', 42)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('class', 'text-xs text-muted-foreground')
      .attr('fill', '#64748b')
      .text(d => d.status);

    // Add priority indicators with improved styling
    const priorityColors = {
      High: '#ef4444',
      Medium: '#f59e0b',
      Low: '#10b981',
    };

    // Add priority badge
    node
      .append('rect')
      .attr('x', 110)
      .attr('y', 8)
      .attr('width', 22)
      .attr('height', 14)
      .attr('rx', 7)
      .attr('ry', 7)
      .attr('fill', d => priorityColors[d.priority as keyof typeof priorityColors] || '#94a3b8')
      .attr('opacity', 0.8);

    // Add priority text
    node
      .append('text')
      .attr('x', 121)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('class', 'text-[8px] font-bold')
      .attr('fill', 'white')
      .text(d => d.priority.charAt(0));

    // Update positions on simulation tick
    simulation.nodes(nodes).on('tick', () => {
      // Keep nodes within bounds
      nodes.forEach(d => {
        d.x = Math.max(70, Math.min(width - 70, d.x || 0));
        d.y = Math.max(30, Math.min(height - 30, d.y || 0));
      });

      // Update link positions
      link
        .attr('x1', d => {
          const source = d.source as Node;
          return source.x || 0;
        })
        .attr('y1', d => {
          const source = d.source as Node;
          return source.y || 0;
        })
        .attr('x2', d => {
          const target = d.target as Node;
          return target.x || 0;
        })
        .attr('y2', d => {
          const target = d.target as Node;
          return target.y || 0;
        });

      // Update node positions
      node.attr('transform', d => `translate(${(d.x || 0) - 70}, ${(d.y || 0) - 30})`);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Add a legend if enabled
    if (showLegend) {
      const legend = svg
        .append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 150}, 20)`);

      // Legend background
      legend
        .append('rect')
        .attr('width', 130)
        .attr('height', 120)
        .attr('rx', 6)
        .attr('ry', 6)
        .attr('fill', 'white')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1)
        .attr('opacity', 0.9);

      // Legend title
      legend
        .append('text')
        .attr('x', 65)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('font-size', '12px')
        .text('Legend');

      // Status legend
      const statusLegend = legend.append('g').attr('transform', 'translate(10, 35)');

      // Status colors
      const statusColors = [
        { status: 'To Do', color: '#cbd5e1' },
        { status: 'In Progress', color: '#3b82f6' },
        { status: 'Review', color: '#f59e0b' },
        { status: 'Completed', color: '#10b981' },
      ];

      statusColors.forEach((item, i) => {
        statusLegend
          .append('rect')
          .attr('x', 0)
          .attr('y', i * 18)
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', item.color);

        statusLegend
          .append('text')
          .attr('x', 20)
          .attr('y', i * 18 + 10)
          .attr('font-size', '10px')
          .text(item.status);
      });
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [tasks, onTaskClick, selectedTask, isAddingDependency, dependencySource, showLegend]);

  const handleZoomIn = () => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const currentZoom = d3.zoomTransform(svg.node() as Element);
    const newScale = Math.min(currentZoom.k * 1.3, 4);

    svg
      .transition()
      .duration(300)
      .call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        d3.zoomIdentity.translate(currentZoom.x, currentZoom.y).scale(newScale)
      );
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const currentZoom = d3.zoomTransform(svg.node() as Element);
    const newScale = Math.max(currentZoom.k / 1.3, 0.1);

    svg
      .transition()
      .duration(300)
      .call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        d3.zoomIdentity.translate(currentZoom.x, currentZoom.y).scale(newScale)
      );
  };

  const handleResetZoom = () => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(500)
      .call(d3.zoom<SVGSVGElement, unknown>().transform as any, d3.zoomIdentity);
  };

  // No minimap toggle needed

  // Toggle legend
  const toggleLegend = () => {
    setShowLegend(prev => !prev);
  };

  // Start adding dependency
  const startAddDependency = () => {
    setIsAddingDependency(true);
    setDependencySource(null);
  };

  // Cancel adding dependency
  const cancelAddDependency = () => {
    setIsAddingDependency(false);
    setDependencySource(null);
  };

  return (
    <div className="border rounded-lg p-4 bg-white/80 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Task Dependencies</h3>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0">
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom In</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0">
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom Out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetZoom}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset View</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Toggle Legend */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={toggleLegend} className="h-8 w-8 p-0">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showLegend ? 'Hide' : 'Show'} Legend</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Add Dependency Button */}
          {isAddingDependency ? (
            <Button variant="destructive" size="sm" onClick={cancelAddDependency} className="h-8">
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={startAddDependency} className="h-8">
                    <PlusCircle className="h-4 w-4 mr-1" /> Add Dependency
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add a new dependency between tasks</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Dependency Adding Instructions */}
      {isAddingDependency && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md text-sm">
          {!dependencySource ? (
            <p>Click on a task to select it as the dependency source.</p>
          ) : (
            <p>Now click on another task to create a dependency from the selected task.</p>
          )}
        </div>
      )}

      {/* Graph Container */}
      <div className="w-full overflow-hidden border rounded-md" ref={containerRef}>
        <svg ref={svgRef} className="w-full" style={{ minHeight: '500px' }}></svg>
      </div>

      {/* Task Count */}
      <div className="mt-2 text-sm text-muted-foreground">
        Showing {tasks.length} of {tasks.length} tasks
      </div>
    </div>
  );
};

export default TaskDependencyGraph;
