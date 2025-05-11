import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrganizationService } from '@/services/Organization.service';
import { toast } from 'sonner';
import { MultiSelect } from '../Global/MultiSelect';

const QuickTaskCreateForm = ({
  setIsAddingTask,
  newTaskName,
  setNewTaskName,
  handleAddTask,
  loadingAddTask,
  assignedTo,
  setAssignedTo,
}) => {
  const { data: organization } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      try {
        return await OrganizationService.getOrganizations();
      } catch (error: any) {
        toast.error('Failed to fetch organization data', {
          description: error.message || 'Unknown error',
        });
        throw error;
      }
    },
  });
  const users = organization?.members
    ?.map((member: any) => member.userId)
    .map((user: any) => ({
      value: user._id,
      label: user.name,
      name: user.name,
      image: user.image,
    }));

  const userRenderer = option => (
    <div className="flex items-center">
      <span className="mr-2 text-lg">
        <img src={option.image} alt={option.name} className="w-6 h-6 rounded-full" />
      </span>
      <div>
        <div className="font-medium">{option.name}</div>
      </div>
    </div>
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="px-2 py-1 mx-3 mb-2 border border-border/40 rounded-xl bg-card/95 backdrop-blur-md shadow-lg relative"
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 rounded-full  bg-muted transition-colors absolute top-[-0.5rem] right-[-0.5rem]"
        onClick={() => {
          setIsAddingTask(false);
          setNewTaskName('');
          setAssignedTo([]);
        }}
      >
        <X className="h-5 w-5" />
      </Button>
      <Input
        placeholder="What needs to be done?"
        value={newTaskName}
        onChange={e => setNewTaskName(e.target.value)}
        className="my-2 bg-background/50 border-input/50 focus-visible:ring-2 focus-visible:ring-primary/30 transition-all"
        autoFocus
        onKeyDown={e => {
          if (e.key === 'Enter' && newTaskName.trim()) {
            handleAddTask();
          }
        }}
      />
      <MultiSelect
        options={users}
        selectedValues={assignedTo}
        onChange={setAssignedTo}
        placeholder="Select team members..."
        itemRenderer={userRenderer}
      />

      <div className="flex justify-end space-x-3 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsAddingTask(false);
            setNewTaskName('');
            setAssignedTo([]);
          }}
          className="border-input/50 hover:bg-muted transition-colors"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleAddTask}
          disabled={!newTaskName.trim() || loadingAddTask}
          className="shadow-sm bg-primary hover:bg-primary/90 transition-colors"
        >
          {loadingAddTask ? 'Adding...' : 'Add Task'}
        </Button>
      </div>
    </motion.div>
  );
};

export default QuickTaskCreateForm;
