import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface QuickTaskFormProps {
  date: Date;
  onSubmit: (taskData: { name: string; startDate: Date; dueDate: Date }) => void;
  onCancel: () => void;
}

const QuickTaskForm: React.FC<QuickTaskFormProps> = ({ date, onSubmit, onCancel }) => {
  const [taskName, setTaskName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName.trim()) {
      onSubmit({
        name: taskName.trim(),
        startDate: date,
        dueDate: date,
      });
      setTaskName('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="p-3 bg-white border border-blue-200 rounded-lg shadow-md backdrop-blur-sm bg-white/90 relative"
    >
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="absolute top-0 right-0 h-7 w-7 hover:bg-blue-50 text-gray-400 hover:text-gray-600"
        onClick={onCancel}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-2 text-xs text-blue-600 font-medium mb-2">
        <Calendar className="h-3 w-3" />
        <span>{format(date, 'MMMM d, yyyy')}</span>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative">
          <Input
            ref={inputRef}
            value={taskName}
            onChange={e => setTaskName(e.target.value)}
            placeholder="Enter task name..."
            className="h-9 text-sm  border-blue-100 focus:border-blue-300 focus:ring-blue-200"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end">
          <Button
            type="submit"
            size="sm"
            className="h-8 px-3 bg-blue-500 hover:bg-blue-600 text-xs font-medium transition-all"
            disabled={!taskName.trim()}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Task
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default QuickTaskForm;
