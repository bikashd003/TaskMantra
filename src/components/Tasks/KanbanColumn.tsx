import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KanbanColumnProps, Task } from './types';

import KanbanCard from './KanbanCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, Plus, Trash2, GripVertical } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import QuickTaskCreateForm from '../IndividualProject/QuickTaskCreateForm';

const defaultColumns = [
  { id: 'todo', title: 'To Do' },
  { id: 'inProgress', title: 'In Progress' },
  { id: 'completed', title: 'Done' },
  { id: 'review', title: 'Review' },
];

interface ExtendedKanbanColumnProps extends KanbanColumnProps {
  id: string;
  onTaskClick?: (taskId: string) => void;
  onAddTask?: (task: Partial<Task>) => void;
  onDeleteColumn?: () => void;
  columnWidth?: number;
  compactView?: boolean;
  isOverlay?: boolean;
  loadingAddTask?: boolean;
}

const KanbanColumn: React.FC<ExtendedKanbanColumnProps> = ({
  id,
  title,
  tasks,
  renderPriorityBadge,
  onAddTask,
  onDeleteColumn,
  columnWidth = 280,
  compactView = false,
  isOverlay = false,
  loadingAddTask = false,
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [assignedTo, setAssignedTo] = useState([]);

  const handleAddTask = () => {
    if (!newTaskName.trim() || !onAddTask) return;

    const newTask: Partial<Task> = {
      name: newTaskName.trim(),
      status: title as any, // Convert the column title to a TaskStatus
      priority: 'Medium', // Default priority
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default due date (1 week from now)
      subtasks: [],
      assignedTo: assignedTo.map((user: any) => user.value),
      comments: [],
      dependencies: [],
    };

    onAddTask(newTask);
    setNewTaskName('');
    setIsAddingTask(false);
  };

  // Create a stable column ID
  const columnDragId = `column-${id}`;

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: columnDragId,
    data: {
      type: 'column',
      id,
      column: { id, title },
    },
  });

  // Make the column droppable for tasks
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: id,
    data: {
      type: 'column',
      id,
      column: { id, title },
    },
    disabled: isColumnDragging, // Disable dropping when the column is being dragged
  });

  const columnTransform = transform
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
      }
    : {};

  return (
    <motion.div
      ref={setSortableRef}
      className={`flex flex-col select-none bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${
        isOverlay
          ? 'opacity-90 scale-105 z-50 rotate-1 shadow-xl ring-2 ring-primary'
          : isColumnDragging
            ? 'opacity-70 scale-105 z-50 rotate-1 shadow-xl'
            : ''
      }`}
      style={{
        ...columnTransform,
        width: `${columnWidth}px`,
        minWidth: '220px',
        flex: '0 0 auto',
        height: 'calc(100vh - 14rem)',
        borderTop: `4px solid ${
          title === 'To Do'
            ? '#94a3b8'
            : title === 'In Progress'
              ? '#3b82f6'
              : title === 'Review'
                ? '#f59e0b'
                : title === 'Completed'
                  ? '#22c55e'
                  : '#94a3b8'
        }`,
        transformOrigin: 'center',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...attributes}
    >
      {/* Column header */}
      <div className="flex items-center justify-between sticky top-0 backdrop-blur-sm bg-white/95 z-10 py-3 px-4 mb-3 rounded-t-lg border-b">
        <div className="font-medium flex items-center">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mr-2 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            )}
          </button>
          <span className="font-semibold text-gray-800">{title}</span>
          <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700 font-medium">
            {tasks.length}
          </Badge>
        </div>
        <div className="flex items-center space-x-1">
          {/* Column drag handle */}
          <motion.div
            className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-gray-500" />
          </motion.div>
          {onDeleteColumn && !defaultColumns.some(col => col.id === id) && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 text-gray-500 hover:text-red-500 transition-colors`}
                onClick={onDeleteColumn}
                title="Delete column"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
              onClick={() => setIsAddingTask(true)}
              title="Add task"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>

      {isAddingTask && (
        <QuickTaskCreateForm
          setIsAddingTask={setIsAddingTask}
          newTaskName={newTaskName}
          setNewTaskName={setNewTaskName}
          handleAddTask={handleAddTask}
          loadingAddTask={loadingAddTask}
          assignedTo={assignedTo}
          setAssignedTo={setAssignedTo}
        />
      )}

      {/* Main column content area - this is the droppable area */}
      {!isCollapsed && (
        <div
          ref={setDroppableRef}
          className={`flex-1 rounded-lg transition-all duration-300 mx-3 mb-4 overflow-hidden select-none ${
            isOver
              ? 'border-2 border-primary border-dashed bg-primary/5 shadow-inner scale-[1.01]'
              : 'bg-white/90'
          }`}
          data-column-id={id}
        >
          {/* Empty column state */}
          {tasks.length === 0 && !isAddingTask ? (
            <div className="h-full p-4 flex flex-col items-center justify-center text-center theme-text-secondary text-sm animate-in fade-in">
              <p className="mb-2">Drop tasks here</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-dashed border-gray-300 hover:bg-gray-50"
                  onClick={() => setIsAddingTask(true)}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Task
                </Button>
              </motion.div>
            </div>
          ) : (
            <ScrollArea className="h-full" type="always">
              <SortableContext
                items={tasks.map(
                  task => `task-${task.id}-${task.status.replace(/\s+/g, '-').toLowerCase()}`
                )}
                strategy={verticalListSortingStrategy}
              >
                <div className="p-2">
                  {tasks.map(task => (
                    <React.Fragment key={task.id}>
                      <div className="mb-3">
                        <KanbanCard
                          card={{
                            id: task.id,
                            title: task.name,
                            description: task.description,
                            priority: task.priority.toLowerCase() as any,
                            status: task.status,
                            dueDate: task.dueDate ? task.dueDate.toString() : undefined,
                            estimatedTime: task.estimatedTime,
                            loggedTime: task.loggedTime,
                            assignedTo: task.assignedTo,
                            subtasks: task.subtasks,
                          }}
                          renderPriorityBadge={renderPriorityBadge}
                          compactView={compactView}
                        />
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </SortableContext>
            </ScrollArea>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default KanbanColumn;
