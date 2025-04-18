import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Settings } from 'lucide-react';
import { Task } from './types';
import { Button } from '@/components/ui/button';
import { WorkflowState, WorkflowTransition } from '@/services/WorkflowSettings.service';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkflowViewProps {
  tasks: Task[];
  workflowStates: WorkflowState[];
  workflowTransitions: WorkflowTransition[];
  onEditWorkflow?: () => void;
  isCustomizable?: boolean;
}

const WorkflowView: React.FC<WorkflowViewProps> = ({
  tasks,
  workflowStates,
  workflowTransitions,
  onEditWorkflow,
  isCustomizable = false,
}) => {
  // Sort states by order
  const sortedStates = [...workflowStates].sort((a, b) => a.order - b.order);

  // Get transitions for visualization
  // const getTransitionsForState = (stateId: string) => {
  //   return workflowTransitions.filter(t => t.fromState === stateId);
  // };

  // Count tasks in each state
  const getTaskCountForState = (stateName: string) => {
    return tasks.filter(task => task.status === stateName).length;
  };

  return (
    <div className="p-4">
      <Card className="border border-blue-100">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Task Workflow</h3>
            {isCustomizable && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={onEditWorkflow} className="gap-2">
                      <Settings className="h-4 w-4" />
                      Customize Workflow
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit workflow states and transitions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="flex items-center justify-between max-w-4xl mx-auto py-8 overflow-x-auto">
            {sortedStates.map((state, index) => (
              <React.Fragment key={state.id}>
                <div className="flex flex-col items-center min-w-[100px]">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: state.color }}
                  >
                    {getTaskCountForState(state.name)}
                  </div>
                  <span className="mt-2 text-sm font-medium">{state.name}</span>
                </div>
                {index < sortedStates.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-gray-400 mx-2" />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            <h4 className="text-md font-medium">Task Status Transition Rules:</h4>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              {workflowTransitions.map(transition => {
                const fromState = workflowStates.find(s => s.id === transition.fromState);
                const toState = workflowStates.find(s => s.id === transition.toState);

                if (!fromState || !toState) return null;

                return (
                  <li key={`${transition.fromState}-${transition.toState}`}>
                    <span className="font-medium text-slate-700">
                      {fromState.name} → {toState.name}:
                    </span>{' '}
                    {transition.description || transition.name}
                  </li>
                );
              })}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowView;
