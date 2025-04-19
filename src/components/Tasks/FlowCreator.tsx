import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WorkflowState, WorkflowTransition } from '@/services/WorkflowSettings.service';
import { Plus, Save, Trash2, ArrowRight, ArrowRightCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface FlowCreatorProps {
  initialStates?: WorkflowState[];
  initialTransitions?: WorkflowTransition[];
  onSave: (
    states: WorkflowState[],
    transitions: WorkflowTransition[],
    name: string,
    description: string
  ) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

const FlowCreator: React.FC<FlowCreatorProps> = ({
  initialStates = [],
  initialTransitions = [],
  onSave,
  onCancel,
  isOpen,
}) => {
  // State for the flow creator
  const [states, setStates] = useState<WorkflowState[]>(
    initialStates.length > 0
      ? initialStates
      : [
          {
            id: 'state-1',
            name: 'To Do',
            color: '#6b7280',
            order: 0,
            description: 'Tasks that need to be started',
          },
          {
            id: 'state-2',
            name: 'In Progress',
            color: '#3b82f6',
            order: 1,
            description: 'Tasks currently being worked on',
          },
        ]
  );
  const [transitions, setTransitions] = useState<WorkflowTransition[]>(
    initialTransitions.length > 0
      ? initialTransitions
      : [
          {
            fromState: 'state-1',
            toState: 'state-2',
            name: 'Start Work',
            description: 'Begin working on the task',
          },
        ]
  );
  const [workflowName, setWorkflowName] = useState<string>('New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState<string>(
    'Custom workflow for tasks'
  );
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [selectedTransitionIndex, setSelectedTransitionIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingTransition, setIsAddingTransition] = useState(false);
  const [newTransition, setNewTransition] = useState<{ fromState: string; toState: string }>({
    fromState: '',
    toState: '',
  });

  // Refs for the flow canvas
  // const canvasRef = useRef<HTMLDivElement>(null);

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
    setSelectedStateId(newState.id);
  };

  // Update a state
  const handleUpdateState = (id: string, field: keyof WorkflowState, value: any) => {
    const updatedStates = states.map(state =>
      state.id === id ? { ...state, [field]: value } : state
    );
    setStates(updatedStates);
  };

  // Remove a state
  const handleRemoveState = (id: string) => {
    // Remove any transitions that involve this state
    const filteredTransitions = transitions.filter(t => t.fromState !== id && t.toState !== id);

    // Remove the state
    const updatedStates = states.filter(state => state.id !== id);

    // Update order for remaining states
    const reorderedStates = updatedStates.map((state, idx) => ({
      ...state,
      order: idx,
    }));

    setStates(reorderedStates);
    setTransitions(filteredTransitions);
    setSelectedStateId(null);
  };

  // Move a state in the order
  const handleMoveState = (id: string, direction: 'left' | 'right') => {
    const stateIndex = states.findIndex(s => s.id === id);
    if (
      (direction === 'left' && stateIndex === 0) ||
      (direction === 'right' && stateIndex === states.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'left' ? stateIndex - 1 : stateIndex + 1;
    const updatedStates = [...states];

    // Swap the states
    [updatedStates[stateIndex], updatedStates[newIndex]] = [
      updatedStates[newIndex],
      updatedStates[stateIndex],
    ];

    // Update order values
    const reorderedStates = updatedStates.map((state, idx) => ({
      ...state,
      order: idx,
    }));

    setStates(reorderedStates);
  };

  // Start adding a transition
  const handleStartAddTransition = () => {
    if (states.length < 2) {
      toast.error('You need at least two states to create a transition');
      return;
    }
    setIsAddingTransition(true);
    setNewTransition({ fromState: states[0].id, toState: states[1].id });
  };

  // Confirm adding a transition
  const handleConfirmAddTransition = () => {
    if (!newTransition.fromState || !newTransition.toState) {
      toast.error('Please select both from and to states');
      return;
    }

    // Check if this transition already exists
    const existingTransition = transitions.find(
      t => t.fromState === newTransition.fromState && t.toState === newTransition.toState
    );

    if (existingTransition) {
      toast.error('This transition already exists');
      return;
    }

    const newTransitionObj: WorkflowTransition = {
      fromState: newTransition.fromState,
      toState: newTransition.toState,
      name: `${states.find(s => s.id === newTransition.fromState)?.name} to ${states.find(s => s.id === newTransition.toState)?.name}`,
      description: '',
    };

    setTransitions([...transitions, newTransitionObj]);
    setIsAddingTransition(false);
    setNewTransition({ fromState: '', toState: '' });
  };

  // Cancel adding a transition
  const handleCancelAddTransition = () => {
    setIsAddingTransition(false);
    setNewTransition({ fromState: '', toState: '' });
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
    setSelectedTransitionIndex(null);
  };

  // Save the workflow
  const handleSave = async () => {
    if (states.length < 2) {
      toast.error('You need at least two states in your workflow');
      return;
    }

    if (transitions.length < 1) {
      toast.error('You need at least one transition in your workflow');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(states, transitions, workflowName, workflowDescription);
      toast.success('Workflow saved successfully');
    } catch (error) {
      toast.error('Failed to save workflow');
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

  // Get state by ID
  const getStateById = (id: string) => {
    return states.find(state => state.id === id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Create Workflow</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Left Panel - Workflow Info */}
          <div className="p-6 border-r">
            <div className="space-y-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  value={workflowName}
                  onChange={e => setWorkflowName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="workflow-description">Description</Label>
                <Textarea
                  id="workflow-description"
                  value={workflowDescription}
                  onChange={e => setWorkflowDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Separator />

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>States</Label>
                  <Button onClick={handleAddState} size="sm" variant="outline" className="h-8">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-2">
                    {states.map(state => (
                      <div
                        key={state.id}
                        className={`p-2 border rounded-md cursor-pointer flex items-center justify-between ${
                          selectedStateId === state.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedStateId(state.id)}
                      >
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: state.color }}
                          />
                          <span>{state.name}</span>
                        </div>
                        <Badge variant="outline">{state.order + 1}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Separator />

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Transitions</Label>
                  <Button
                    onClick={handleStartAddTransition}
                    size="sm"
                    variant="outline"
                    className="h-8"
                  >
                    <ArrowRightCircle className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-2">
                    {transitions.map((transition, index) => (
                      <div
                        key={`${transition.fromState}-${transition.toState}`}
                        className={`p-2 border rounded-md cursor-pointer ${
                          selectedTransitionIndex === index
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedTransitionIndex(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-sm">
                            <span>{getStateById(transition.fromState)?.name}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>{getStateById(transition.toState)?.name}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {transition.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* Right Panel - Editor */}
          <div className="col-span-2 p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
            {/* State Editor */}
            {selectedStateId && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Edit State</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const state = states.find(s => s.id === selectedStateId);
                    if (!state) return null;

                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="state-name">Name</Label>
                            <Input
                              id="state-name"
                              value={state.name}
                              onChange={e => handleUpdateState(state.id, 'name', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="state-color">Color</Label>
                            <div className="flex items-center mt-1 gap-2">
                              <div
                                className="w-6 h-6 rounded-full"
                                style={{ backgroundColor: state.color }}
                              />
                              <Input
                                id="state-color"
                                type="color"
                                value={state.color}
                                onChange={e => handleUpdateState(state.id, 'color', e.target.value)}
                                className="w-full h-8"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="state-description">Description</Label>
                          <Textarea
                            id="state-description"
                            value={state.description || ''}
                            onChange={e =>
                              handleUpdateState(state.id, 'description', e.target.value)
                            }
                            className="mt-1"
                            rows={3}
                          />
                        </div>

                        <div className="flex justify-between">
                          <div className="space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMoveState(state.id, 'left')}
                              disabled={state.order === 0}
                            >
                              ← Move Left
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMoveState(state.id, 'right')}
                              disabled={state.order === states.length - 1}
                            >
                              Move Right →
                            </Button>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveState(state.id)}
                            disabled={states.length <= 2}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Transition Editor */}
            {selectedTransitionIndex !== null && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Edit Transition</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const transition = transitions[selectedTransitionIndex];
                    if (!transition) return null;

                    const fromState = getStateById(transition.fromState);
                    const toState = getStateById(transition.toState);

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-2 py-2">
                          <Badge
                            className="px-3 py-1 text-white"
                            style={{ backgroundColor: fromState?.color }}
                          >
                            {fromState?.name}
                          </Badge>
                          <ArrowRight className="h-5 w-5" />
                          <Badge
                            className="px-3 py-1 text-white"
                            style={{ backgroundColor: toState?.color }}
                          >
                            {toState?.name}
                          </Badge>
                        </div>

                        <div>
                          <Label htmlFor="transition-name">Name</Label>
                          <Input
                            id="transition-name"
                            value={transition.name}
                            onChange={e =>
                              handleUpdateTransition(
                                selectedTransitionIndex,
                                'name',
                                e.target.value
                              )
                            }
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="transition-description">Description</Label>
                          <Textarea
                            id="transition-description"
                            value={transition.description || ''}
                            onChange={e =>
                              handleUpdateTransition(
                                selectedTransitionIndex,
                                'description',
                                e.target.value
                              )
                            }
                            className="mt-1"
                            rows={3}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveTransition(selectedTransitionIndex)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Add Transition Dialog */}
            {isAddingTransition && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Add Transition</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="from-state">From State</Label>
                        <select
                          id="from-state"
                          value={newTransition.fromState}
                          onChange={e =>
                            setNewTransition({ ...newTransition, fromState: e.target.value })
                          }
                          className="w-full mt-1 p-2 border rounded-md"
                        >
                          <option value="">Select a state</option>
                          {states.map(state => (
                            <option key={`from-${state.id}`} value={state.id}>
                              {state.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="to-state">To State</Label>
                        <select
                          id="to-state"
                          value={newTransition.toState}
                          onChange={e =>
                            setNewTransition({ ...newTransition, toState: e.target.value })
                          }
                          className="w-full mt-1 p-2 border rounded-md"
                        >
                          <option value="">Select a state</option>
                          {states.map(state => (
                            <option key={`to-${state.id}`} value={state.id}>
                              {state.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={handleCancelAddTransition}>
                        Cancel
                      </Button>
                      <Button onClick={handleConfirmAddTransition}>Add Transition</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Workflow Visualization */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Workflow Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8 overflow-x-auto">
                  {states
                    .sort((a, b) => a.order - b.order)
                    .map((state, index) => (
                      <React.Fragment key={state.id}>
                        <div className="flex flex-col items-center min-w-[100px]">
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-medium"
                            style={{ backgroundColor: state.color }}
                          >
                            {index + 1}
                          </div>
                          <span className="mt-2 text-sm font-medium">{state.name}</span>
                        </div>
                        {index < states.length - 1 && (
                          <ArrowRight className="h-6 w-6 text-gray-400 mx-2" />
                        )}
                      </React.Fragment>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2">
          <Button variant="outline" onClick={onCancel}>
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

export default FlowCreator;
