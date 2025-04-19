import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowState, WorkflowTransition } from '@/services/WorkflowSettings.service';
import { Plus, Trash2, ArrowRight, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface WorkflowEditorProps {
  isOpen: boolean;
  onClose: () => void;
  workflowStates: WorkflowState[];
  workflowTransitions: WorkflowTransition[];
  onSave: (states: WorkflowState[], transitions: WorkflowTransition[]) => Promise<void>;
}

const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  isOpen,
  onClose,
  workflowStates,
  workflowTransitions,
  onSave,
}) => {
  // State for the editor
  const [states, setStates] = useState<WorkflowState[]>(workflowStates);
  const [transitions, setTransitions] = useState<WorkflowTransition[]>(workflowTransitions);
  const [activeTab, setActiveTab] = useState('states');
  const [isSaving, setIsSaving] = useState(false);

  // Generate a unique ID for new states
  const generateStateId = () => {
    return `state-${Date.now()}`;
  };

  // Add a new state
  const handleAddState = () => {
    const newState: WorkflowState = {
      id: generateStateId(),
      name: `New State ${states.length + 1}`,
      color: getRandomColor(),
      description: '',
      order: states.length,
    };
    setStates([...states, newState]);
  };

  // Update a state
  const handleUpdateState = (index: number, field: keyof WorkflowState, value: any) => {
    const updatedStates = [...states];
    updatedStates[index] = { ...updatedStates[index], [field]: value };
    setStates(updatedStates);
  };

  // Remove a state
  const handleRemoveState = (index: number) => {
    const stateToRemove = states[index];

    // Remove any transitions that involve this state
    const filteredTransitions = transitions.filter(
      t => t.fromState !== stateToRemove.id && t.toState !== stateToRemove.id
    );

    // Remove the state
    const updatedStates = [...states];
    updatedStates.splice(index, 1);

    // Update order for remaining states
    const reorderedStates = updatedStates.map((state, idx) => ({
      ...state,
      order: idx,
    }));

    setStates(reorderedStates);
    setTransitions(filteredTransitions);
  };

  // Move a state up or down in the order
  const handleMoveState = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === states.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedStates = [...states];

    // Swap the states
    [updatedStates[index], updatedStates[newIndex]] = [
      updatedStates[newIndex],
      updatedStates[index],
    ];

    // Update order values
    const reorderedStates = updatedStates.map((state, idx) => ({
      ...state,
      order: idx,
    }));

    setStates(reorderedStates);
  };

  // Add a new transition
  const handleAddTransition = () => {
    if (states.length < 2) {
      toast.error('You need at least two states to create a transition');
      return;
    }

    const newTransition: WorkflowTransition = {
      fromState: states[0].id,
      toState: states[1].id,
      name: `Transition ${transitions.length + 1}`,
      description: '',
    };
    setTransitions([...transitions, newTransition]);
  };

  // Update a transition
  const handleUpdateTransition = (index: number, field: keyof WorkflowTransition, value: any) => {
    const updatedTransitions = [...transitions];
    updatedTransitions[index] = { ...updatedTransitions[index], [field]: value };
    setTransitions(updatedTransitions);
  };

  // Remove a transition
  const handleRemoveTransition = (index: number) => {
    const updatedTransitions = [...transitions];
    updatedTransitions.splice(index, 1);
    setTransitions(updatedTransitions);
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(states, transitions);
      toast.success('Workflow settings saved successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to save workflow settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate a random color for new states
  const getRandomColor = () => {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#6366f1', // indigo
      '#14b8a6', // teal
      '#f97316', // orange
      '#6b7280', // gray
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Workflow</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="states">States</TabsTrigger>
            <TabsTrigger value="transitions">Transitions</TabsTrigger>
          </TabsList>

          {/* States Tab */}
          <TabsContent value="states" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Workflow States</h3>
              <Button onClick={handleAddState} size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add State
              </Button>
            </div>

            <div className="space-y-4">
              {states.map((state, index) => (
                <Card key={state.id} className="border">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-5">
                        <Label htmlFor={`state-name-${index}`}>Name</Label>
                        <Input
                          id={`state-name-${index}`}
                          value={state.name}
                          onChange={e => handleUpdateState(index, 'name', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-3">
                        <Label htmlFor={`state-color-${index}`}>Color</Label>
                        <div className="flex items-center mt-1 gap-2">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: state.color }}
                          />
                          <Input
                            id={`state-color-${index}`}
                            type="color"
                            value={state.color}
                            onChange={e => handleUpdateState(index, 'color', e.target.value)}
                            className="w-full h-8"
                          />
                        </div>
                      </div>
                      <div className="col-span-4 flex items-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveState(index, 'up')}
                          disabled={index === 0}
                          className="flex-1"
                        >
                          ↑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveState(index, 'down')}
                          disabled={index === states.length - 1}
                          className="flex-1"
                        >
                          ↓
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveState(index)}
                          disabled={states.length <= 2}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="col-span-12">
                        <Label htmlFor={`state-desc-${index}`}>Description</Label>
                        <Textarea
                          id={`state-desc-${index}`}
                          value={state.description || ''}
                          onChange={e => handleUpdateState(index, 'description', e.target.value)}
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Transitions Tab */}
          <TabsContent value="transitions" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Workflow Transitions</h3>
              <Button onClick={handleAddTransition} size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add Transition
              </Button>
            </div>

            <div className="space-y-4">
              {transitions.map((transition, index) => (
                <Card
                  key={`${transition.fromState}-${transition.toState}-${index}`}
                  className="border"
                >
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-4">
                        <Label htmlFor={`transition-from-${index}`}>From State</Label>
                        <Select
                          value={transition.fromState}
                          onValueChange={value => handleUpdateTransition(index, 'fromState', value)}
                        >
                          <SelectTrigger id={`transition-from-${index}`} className="mt-1">
                            <SelectValue placeholder="Select a state" />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map(state => (
                              <SelectItem key={`from-${state.id}`} value={state.id}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1 flex items-center justify-center mt-6">
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="col-span-4">
                        <Label htmlFor={`transition-to-${index}`}>To State</Label>
                        <Select
                          value={transition.toState}
                          onValueChange={value => handleUpdateTransition(index, 'toState', value)}
                        >
                          <SelectTrigger id={`transition-to-${index}`} className="mt-1">
                            <SelectValue placeholder="Select a state" />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map(state => (
                              <SelectItem key={`to-${state.id}`} value={state.id}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3 flex items-end justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveTransition(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="col-span-12">
                        <Label htmlFor={`transition-name-${index}`}>Name</Label>
                        <Input
                          id={`transition-name-${index}`}
                          value={transition.name}
                          onChange={e => handleUpdateTransition(index, 'name', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-12">
                        <Label htmlFor={`transition-desc-${index}`}>Description</Label>
                        <Textarea
                          id={`transition-desc-${index}`}
                          value={transition.description || ''}
                          onChange={e =>
                            handleUpdateTransition(index, 'description', e.target.value)
                          }
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving && <span className="animate-spin">⏳</span>}
            <Save className="h-4 w-4" /> Save Workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowEditor;
