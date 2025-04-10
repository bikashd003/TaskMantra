import React from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EmptyStateProps {
  searchQuery: string;
  onCreateTask: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery, onCreateTask }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-medium">No tasks found</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md">
        {searchQuery
          ? "Try adjusting your search or filters"
          : "Create your first task to get started"}
      </p>
      <Button 
        onClick={onCreateTask}
        className="transition-all hover:scale-105"
      >
        <Plus className="mr-2 h-4 w-4" /> New Task
      </Button>
    </motion.div>
  );
};

export default EmptyState;
