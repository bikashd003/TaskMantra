import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import React from 'react';

const QuickTaskCreateForm = ({ setIsAddingTask, newTaskName, setNewTaskName, handleAddTask }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="px-3 py-2 mx-3 mb-2 border border-dashed border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">Add New Task</h4>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
            onClick={() => {
              setIsAddingTask(false);
              setNewTaskName('');
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
      <Input
        placeholder="Task name"
        value={newTaskName}
        onChange={e => setNewTaskName(e.target.value)}
        className="mb-2 border-gray-300 focus:ring-2 focus:ring-primary/30"
        autoFocus
        onKeyDown={e => {
          if (e.key === 'Enter' && newTaskName.trim()) {
            handleAddTask();
          }
        }}
      />
      <div className="flex justify-end space-x-2">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsAddingTask(false);
              setNewTaskName('');
            }}
            className="border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            size="sm"
            onClick={handleAddTask}
            disabled={!newTaskName.trim()}
            className="shadow-sm"
          >
            Add Task
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QuickTaskCreateForm;
