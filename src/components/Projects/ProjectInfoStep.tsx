import { AlertTriangle, CheckCircle2, Clock, Folder, Info, PauseCircle, XCircle } from 'lucide-react'
import React from 'react'
import { Controller, Control, FieldErrors, UseFormHandleSubmit } from 'react-hook-form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Project, useProject } from '@/context/ProjectContext'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
interface ProjectInfoStepProps {
  onSubmit: (data: Project) => void;
  control: Control<Project>;
  errors: FieldErrors<Project>;
  handleSubmit: UseFormHandleSubmit<Project>;
}

const ProjectInfoStep = () => {
  const { onSubmit, control, errors, handleSubmit }: ProjectInfoStepProps = useProject()!;
    return (
      <div className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <Folder className="w-6 h-6" /> Project Information
          </CardTitle>
          <CardDescription>Fill in the details of your new project</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700 flex items-center gap-1">
                <Info className="w-4 h-4" /> Project Name
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter your project name"
                    className={`w-full ${errors.name ? 'border-destructive' : ''}`}
                  />
                )}
              />
              {errors.name && (
                <p className="text-destructive text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700 flex items-center gap-1">
                <Info className="w-4 h-4" /> Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Describe your project in detail"
                    className={`w-full ${errors.description ? 'border-destructive' : ''}`}
                    rows={4}
                  />
                )}
              />
              {errors.description && (
                <p className="text-destructive text-sm">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-700 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Priority
                </label>
                <Controller
                  name="priority"
                  control={control}
                  defaultValue='Medium'
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select the priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.priority && (
                  <p className="text-destructive text-sm">{errors.priority.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-700 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  defaultValue='Planning'
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select the status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Planning">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-500" />
                              Planning
                            </div>
                          </SelectItem>
                          <SelectItem value="In Progress">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              In Progress
                            </div>
                          </SelectItem>
                          <SelectItem value="Completed">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              Completed
                            </div>
                          </SelectItem>
                          <SelectItem value="On Hold">
                            <div className="flex items-center gap-2">
                              <PauseCircle className="w-4 h-4 text-orange-500" />
                              On Hold
                            </div>
                          </SelectItem>
                          <SelectItem value="Cancelled">
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-500" />
                              Cancelled
                            </div>
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-destructive text-sm">{errors.status.message}</p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </div>
  )
}

export default ProjectInfoStep