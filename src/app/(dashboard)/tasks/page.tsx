"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Calendar,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    SortAsc,
    Tag,
    Trash,
    Edit,
    CheckCircle2,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

// Mock data for tasks
const mockTasks = [
    {
        id: "task-1",
        title: "Redesign landing page",
        description: "Update the landing page with new branding and messaging",
        status: "in-progress",
        priority: "high",
        dueDate: "2023-06-15",
        assignee: {
            name: "Alex Johnson",
            avatar: "/avatars/alex.png",
            initials: "AJ"
        },
        tags: ["design", "marketing"],
        project: "Website Redesign"
    },
    {
        id: "task-2",
        title: "Fix navigation bug",
        description: "The dropdown menu is not working correctly on mobile devices",
        status: "todo",
        priority: "medium",
        dueDate: "2023-06-20",
        assignee: {
            name: "Sam Wilson",
            avatar: "/avatars/sam.png",
            initials: "SW"
        },
        tags: ["bug", "frontend"],
        project: "Bug Fixes"
    },
    {
        id: "task-3",
        title: "Create user onboarding flow",
        description: "Design and implement a new user onboarding experience",
        status: "todo",
        priority: "high",
        dueDate: "2023-06-25",
        assignee: {
            name: "Taylor Kim",
            avatar: "/avatars/taylor.png",
            initials: "TK"
        },
        tags: ["ux", "frontend"],
        project: "User Experience"
    },
    {
        id: "task-4",
        title: "Update API documentation",
        description: "Review and update the API documentation with new endpoints",
        status: "completed",
        priority: "low",
        dueDate: "2023-06-10",
        assignee: {
            name: "Jordan Lee",
            avatar: "/avatars/jordan.png",
            initials: "JL"
        },
        tags: ["documentation", "api"],
        project: "API Development"
    },
    {
        id: "task-5",
        title: "Implement authentication system",
        description: "Set up OAuth2 authentication for the application",
        status: "in-progress",
        priority: "high",
        dueDate: "2023-06-18",
        assignee: {
            name: "Morgan Chen",
            avatar: "/avatars/morgan.png",
            initials: "MC"
        },
        tags: ["security", "backend"],
        project: "Authentication"
    }
];

// Task status options
const statusOptions = [
    { value: "todo", label: "To Do" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" }
];

// Priority options
const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" }
];

export default function TasksPage() {
    const [tasks, setTasks] = useState(mockTasks);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedPriority, setSelectedPriority] = useState("all");
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
        project: "",
        tags: ""
    });

    // Filter tasks based on search query, status, and priority
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;
        const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Group tasks by status for Kanban view
    const groupedTasks = {
        todo: filteredTasks.filter(task => task.status === "todo"),
        inProgress: filteredTasks.filter(task => task.status === "in-progress"),
        completed: filteredTasks.filter(task => task.status === "completed")
    };

    // Handle task creation
    const handleCreateTask = () => {
        const taskTags = newTask.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== "");

        const createdTask = {
            id: `task-${tasks.length + 1}`,
            title: newTask.title,
            description: newTask.description,
            status: newTask.status,
            priority: newTask.priority,
            dueDate: newTask.dueDate,
            assignee: {
                name: "You",
                avatar: "",
                initials: "YO"
            },
            tags: taskTags,
            project: newTask.project
        };

        setTasks([...tasks, createdTask]);
        setIsCreateTaskOpen(false);
        setNewTask({
            title: "",
            description: "",
            status: "todo",
            priority: "medium",
            dueDate: "",
            project: "",
            tags: ""
        });
    };

    // Handle task status change
    const handleStatusChange = (taskId, newStatus) => {
        setTasks(tasks.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
        ));
    };

    // Handle task deletion
    const handleDeleteTask = (taskId) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    // Render priority badge with appropriate color
    const renderPriorityBadge = (priority) => {
        const colors = {
            low: "bg-green-100 text-green-800 hover:bg-green-100",
            medium: "bg-blue-100 text-blue-800 hover:bg-blue-100",
            high: "bg-red-100 text-red-800 hover:bg-red-100"
        };

    return (
            <Badge className={`${colors[priority]} border-none`} variant="outline">
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>
        );
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
                    <p className="text-muted-foreground">
                        Manage and organize your tasks
                    </p>
                </div>
                <Button onClick={() => setIsCreateTaskOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Task
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <Filter className="mr-2 h-4 w-4" /> Filter
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSelectedStatus("all")}>
                            All
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedStatus("todo")}>
                            To Do
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedStatus("in-progress")}>
                            In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedStatus("completed")}>
                            Completed
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSelectedPriority("all")}>
                            All
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedPriority("low")}>
                            Low
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedPriority("medium")}>
                            Medium
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedPriority("high")}>
                            High
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <SortAsc className="mr-2 h-4 w-4" /> Sort
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem>
                            Date (Newest First)
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Date (Oldest First)
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Priority (High to Low)
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Priority (Low to High)
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Alphabetical (A-Z)
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Alphabetical (Z-A)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="kanban">Kanban View</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    {filteredTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="rounded-full bg-slate-100 p-3 mb-4">
                                <CheckCircle2 className="h-6 w-6 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium">No tasks found</h3>
                            <p className="text-sm text-muted-foreground mt-1 mb-4">
                                {searchQuery ? "Try adjusting your search or filters" : "Create your first task to get started"}
                            </p>
                            <Button onClick={() => setIsCreateTaskOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> New Task
                            </Button>
                        </div>
                    ) : (
                        filteredTasks.map(task => (
                            <Card key={task.id} className="overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={task.status === "completed"}
                                                onCheckedChange={(checked) => {
                                                    handleStatusChange(task.id, checked ? "completed" : "todo");
                                                }}
                                            />
                                            <CardTitle className={`text-lg ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                                                {task.title}
                                            </CardTitle>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleStatusChange(task.id, "todo")}>
                                                    Mark as To Do
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(task.id, "in-progress")}>
                                                    Mark as In Progress
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(task.id, "completed")}>
                                                    Mark as Completed
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                >
                                                    <Trash className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {task.tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                <Tag className="h-3 w-3 mr-1" /> {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                        <div className="flex items-center text-muted-foreground">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                        </div>
                                        <div>
                                            {renderPriorityBadge(task.priority)}
                                        </div>
                                        <div className="flex items-center">
                                            <Badge variant="outline" className="font-normal">
                                                {task.project}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t pt-4 flex justify-between">
                                    <div className="flex items-center">
                                        <Avatar className="h-6 w-6 mr-2">
                                            <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                                            <AvatarFallback>{task.assignee.initials}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm text-muted-foreground">{task.assignee.name}</span>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={
                                            task.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
                                                task.status === "in-progress" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                    "bg-slate-50 text-slate-700 border-slate-200"
                                        }
                        >
                            {task.status === "todo" ? "To Do" :
                                task.status === "in-progress" ? "In Progress" : "Completed"}
                        </Badge>
                    </CardFooter>
                </Card>
            ))
                  )}
              </TabsContent>

              <TabsContent value="kanban" className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* To Do Column */}
                      <div className="space-y-4">
                          <div className="flex items-center justify-between">
                              <h3 className="font-medium flex items-center">
                                  <span className="h-2 w-2 rounded-full bg-slate-400 mr-2"></span>
                                  To Do
                                  <Badge variant="secondary" className="ml-2">{groupedTasks.todo.length}</Badge>
                              </h3>
                          </div>

                          {groupedTasks.todo.length === 0 ? (
                              <div className="border border-dashed rounded-lg p-4 text-center text-muted-foreground text-sm">
                                  No tasks to do
                              </div>
                          ) : (
                              <div className="space-y-3">
                                  {groupedTasks.todo.map(task => (
                                      <Card key={task.id} className="shadow-sm">
                                          <CardHeader className="p-3 pb-0">
                                              <div className="flex justify-between items-start">
                                                  <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                                                  <DropdownMenu>
                                                      <DropdownMenuTrigger asChild>
                                                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                              <MoreHorizontal className="h-3 w-3" />
                                                          </Button>
                                                      </DropdownMenuTrigger>
                                                      <DropdownMenuContent align="end">
                                                          <DropdownMenuItem onClick={() => handleStatusChange(task.id, "in-progress")}>
                                                              Move to In Progress
                                                          </DropdownMenuItem>
                                                          <DropdownMenuItem onClick={() => handleStatusChange(task.id, "completed")}>
                                                              Move to Completed
                                                          </DropdownMenuItem>
                                                          <DropdownMenuSeparator />
                                                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTask(task.id)}>
                                                              Delete
                                                          </DropdownMenuItem>
                                                      </DropdownMenuContent>
                                                  </DropdownMenu>
                                              </div>
                                          </CardHeader>
                                          <CardContent className="p-3 pt-2">
                                              <div className="flex justify-between items-center mb-2">
                                                  <div className="flex items-center">
                                                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                                      <span className="text-xs text-muted-foreground">
                                                          {new Date(task.dueDate).toLocaleDateString()}
                                                      </span>
                                                  </div>
                                                  {renderPriorityBadge(task.priority)}
                                              </div>
                                              <div className="flex items-center justify-between">
                                                  <div className="flex -space-x-2">
                                                      <Avatar className="h-6 w-6 border-2 border-background">
                                                          <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                                                          <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                                                      </Avatar>
                                                  </div>
                                                  {task.tags.length > 0 && (
                                                      <Badge variant="secondary" className="text-xs">
                                                          {task.tags[0]}
                                                          {task.tags.length > 1 && `+${task.tags.length - 1}`}
                                                      </Badge>
                                                  )}
                                              </div>
                                          </CardContent>
                                      </Card>
                                  ))}
                              </div>
                          )}
                      </div>

                      {/* In Progress Column */}
                      <div className="space-y-4">
                          <div className="flex items-center justify-between">
                              <h3 className="font-medium flex items-center">
                                  <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                                  In Progress
                                  <Badge variant="secondary" className="ml-2">{groupedTasks.inProgress.length}</Badge>
                              </h3>
                          </div>

                          {groupedTasks.inProgress.length === 0 ? (
                              <div className="border border-dashed rounded-lg p-4 text-center text-muted-foreground text-sm">
                                  No tasks in progress
                              </div>
                          ) : (
                              <div className="space-y-3">
                                  {groupedTasks.inProgress.map(task => (
                                      <Card key={task.id} className="shadow-sm">
                                          <CardHeader className="p-3 pb-0">
                                              <div className="flex justify-between items-start">
                                                  <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                                                  <DropdownMenu>
                                                      <DropdownMenuTrigger asChild>
                                                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                              <MoreHorizontal className="h-3 w-3" />
                                                          </Button>
                                                      </DropdownMenuTrigger>
                                                      <DropdownMenuContent align="end">
                                                          <DropdownMenuItem onClick={() => handleStatusChange(task.id, "todo")}>
                                                              Move to To Do
                                                          </DropdownMenuItem>
                                                          <DropdownMenuItem onClick={() => handleStatusChange(task.id, "completed")}>
                                                              Move to Completed
                                                          </DropdownMenuItem>
                                                          <DropdownMenuSeparator />
                                                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTask(task.id)}>
                                                              Delete
                                                          </DropdownMenuItem>
                                                      </DropdownMenuContent>
                                                  </DropdownMenu>
                                              </div>
                                          </CardHeader>
                                          <CardContent className="p-3 pt-2">
                                              <div className="flex justify-between items-center mb-2">
                                                  <div className="flex items-center">
                                                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                                      <span className="text-xs text-muted-foreground">
                                                          {new Date(task.dueDate).toLocaleDateString()}
                                                      </span>
                                                  </div>
                                                  {renderPriorityBadge(task.priority)}
                                              </div>
                                              <div className="flex items-center justify-between">
                                                  <div className="flex -space-x-2">
                                                      <Avatar className="h-6 w-6 border-2 border-background">
                                                          <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                                                          <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                                                      </Avatar>
                                                  </div>
                                                  {task.tags.length > 0 && (
                                                      <Badge variant="secondary" className="text-xs">
                                                          {task.tags[0]}
                                                          {task.tags.length > 1 && `+${task.tags.length - 1}`}
                                                      </Badge>
                                                  )}
                                              </div>
                                          </CardContent>
                                      </Card>
                                  ))}
                              </div>
                          )}
                      </div>

                      {/* Completed Column */}
                      <div className="space-y-4">
                          <div className="flex items-center justify-between">
                              <h3 className="font-medium flex items-center">
                                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                  Completed
                                  <Badge variant="secondary" className="ml-2">{groupedTasks.completed.length}</Badge>
                              </h3>
                          </div>

                          {groupedTasks.completed.length === 0 ? (
                              <div className="border border-dashed rounded-lg p-4 text-center text-muted-foreground text-sm">
                                  No completed tasks
                              </div>
                          ) : (
                              <div className="space-y-3">
                                  {groupedTasks.completed.map(task => (
                                      <Card key={task.id} className="shadow-sm">
                                          <CardHeader className="p-3 pb-0">
                                              <div className="flex justify-between items-start">
                                                  <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                                                  <DropdownMenu>
                                                      <DropdownMenuTrigger asChild>
                                                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                              <MoreHorizontal className="h-3 w-3" />
                                                          </Button>
                                                      </DropdownMenuTrigger>
                                                      <DropdownMenuContent align="end">
                                                          <DropdownMenuItem onClick={() => handleStatusChange(task.id, "todo")}>
                                                              Move to To Do
                                                          </DropdownMenuItem>
                                                          <DropdownMenuItem onClick={() => handleStatusChange(task.id, "in-progress")}>
                                                              Move to In Progress
                                                          </DropdownMenuItem>
                                                          <DropdownMenuSeparator />
                                                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTask(task.id)}>
                                                              Delete
                                                          </DropdownMenuItem>
                                                      </DropdownMenuContent>
                                                  </DropdownMenu>
                                              </div>
                                          </CardHeader>
                                          <CardContent className="p-3 pt-2">
                                              <div className="flex justify-between items-center mb-2">
                                                  <div className="flex items-center">
                                                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                                      <span className="text-xs text-muted-foreground">
                                                          {new Date(task.dueDate).toLocaleDateString()}
                                                      </span>
                                                  </div>
                                                  {renderPriorityBadge(task.priority)}
                                              </div>
                                              <div className="flex items-center justify-between">
                                                  <div className="flex -space-x-2">
                                                      <Avatar className="h-6 w-6 border-2 border-background">
                                                          <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                                                          <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                                                      </Avatar>
                                                  </div>
                                                  {task.tags.length > 0 && (
                                                      <Badge variant="secondary" className="text-xs">
                                                          {task.tags[0]}
                                                          {task.tags.length > 1 && `+${task.tags.length - 1}`}
                                                      </Badge>
                                                  )}
                                              </div>
                                          </CardContent>
                                      </Card>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
              </TabsContent>
          </Tabs>

            {/* Create Task Dialog */}
            <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>
                            Add a new task to your project. Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="Task title"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Task description"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={newTask.status}
                                    onValueChange={(value) => setNewTask({ ...newTask, status: value })}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={newTask.priority}
                                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                                >
                                    <SelectTrigger id="priority">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorityOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={newTask.dueDate}
                                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="project">Project</Label>
                            <Input
                                id="project"
                                placeholder="Project name"
                                value={newTask.project}
                                onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tags">Tags</Label>
                            <Input
                                id="tags"
                                placeholder="Enter tags separated by commas"
                                value={newTask.tags}
                                onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Example: design, frontend, urgent
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateTask} disabled={!newTask.title}>
                            Create Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}