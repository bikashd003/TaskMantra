'use client';

import React, { useEffect, useRef } from 'react';
import { Task } from './types';
import * as d3 from 'd3';

interface TaskDependencyGraphProps {
  tasks: Task[];
  onTaskClick: (_taskId: string) => void;
}

interface Node {
  id: string;
  name: string;
  status: string;
  priority: string;
  color?: string;
}

interface Link {
  source: Node;
  target: Node;
}

const TaskDependencyGraph: React.FC<TaskDependencyGraphProps> = ({ tasks, onTaskClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || tasks.length === 0) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    // Create nodes and links
    const nodes: Node[] = tasks.map(task => ({
      id: task.id,
      name: task.name,
      status: task.status,
      priority: task.priority,
      color: task.color,
    }));

    const links: Link[] = [];
    tasks.forEach(task => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(dependencyId => {
          // Check if the dependency exists in our tasks
          if (tasks.some(t => t.id === dependencyId)) {
            const sourceNode = nodes.find(n => n.id === dependencyId);
            const targetNode = nodes.find(n => n.id === task.id);
            if (sourceNode && targetNode) {
              links.push({
                source: sourceNode,
                target: targetNode,
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
    const width = svgRef.current.clientWidth;
    const height = 400;

    // Create a force simulation
    const simulation = d3
      .forceSimulation<any, any>()
      .force(
        'link',
        d3
          .forceLink()
          .id((d: any) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    // Create the SVG elements
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Define arrow marker for links
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Create links
    const link = svg
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    // Create node groups
    const node = svg
      .append('g')
      .selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(d3.drag<any, any>().on('start', dragstarted).on('drag', dragged).on('end', dragended))
      .on('click', (_event, d) => onTaskClick(d.id));

    // Add task cards
    node
      .append('rect')
      .attr('width', 120)
      .attr('height', 50)
      .attr('rx', 6)
      .attr('ry', 6)
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
      .attr('cursor', 'pointer');

    // Add task names
    node
      .append('text')
      .attr('x', 60)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('class', 'text-xs font-medium')
      .text(d => (d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name));

    // Add status indicators
    node
      .append('text')
      .attr('x', 60)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('class', 'text-[10px] text-muted-foreground')
      .text(d => d.status);

    // Add priority indicators
    node
      .append('circle')
      .attr('cx', 110)
      .attr('cy', 10)
      .attr('r', 4)
      .attr('fill', d => {
        switch (d.priority) {
          case 'High':
            return '#ef4444';
          case 'Medium':
            return '#f59e0b';
          case 'Low':
            return '#10b981';
          default:
            return '#94a3b8';
        }
      });

    // Update positions on simulation tick
    simulation.nodes(nodes).on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node.attr('transform', d => `translate(${(d as any).x - 60}, ${(d as any).y - 25})`);
    });

    simulation.force<d3.ForceLink<any, any>>('link')!.links(links);

    // Drag functions
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [tasks, onTaskClick]);

  return (
    <div className="border rounded-lg p-4 bg-white/80 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Task Dependencies</h3>
      <div className="w-full overflow-x-auto">
        <svg ref={svgRef} className="w-full" style={{ minHeight: '400px' }}></svg>
      </div>
    </div>
  );
};

export default TaskDependencyGraph;
