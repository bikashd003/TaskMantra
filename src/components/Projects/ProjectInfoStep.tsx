import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Folder,
  Info,
  PauseCircle,
  XCircle,
} from 'lucide-react';
import React from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useProject } from '@/context/ProjectContext';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const ProjectInfoStep = () => {
  const { formik } = useProject()!;
  const { values, handleChange, handleBlur, errors, touched } = formik;

  return (
    <div className="w-full theme-surface">
      <CardHeader>
        <CardTitle className="text-2xl font-bold theme-text-primary flex items-center gap-2">
          <Folder className="w-6 h-6" /> Project Information
        </CardTitle>
        <CardDescription className="theme-text-secondary">
          Fill in the details of your new project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium theme-text-primary flex items-center gap-1">
              <Info className="w-4 h-4" /> Project Name
            </label>
            <Input
              id="name"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your project name"
              className={`w-full theme-input theme-focus ${touched.name && errors.name ? 'border-destructive' : ''}`}
            />
            {touched.name && errors.name && (
              <motion.p
                className="text-destructive text-sm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                {errors.name}
              </motion.p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium theme-text-primary flex items-center gap-1">
              <Info className="w-4 h-4" /> Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Describe your project in detail"
              className={`w-full theme-input theme-focus ${touched.description && errors.description ? 'border-destructive' : ''}`}
              rows={4}
            />
            {touched.description && errors.description && (
              <motion.p
                className="text-destructive text-sm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                {errors.description}
              </motion.p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium theme-text-primary flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Priority
              </label>
              <Select
                name="priority"
                value={values.priority}
                onValueChange={value => formik.setFieldValue('priority', value)}
              >
                <SelectTrigger className="w-full theme-input theme-focus">
                  <SelectValue placeholder="Select the priority" />
                </SelectTrigger>
                <SelectContent className="theme-surface-elevated theme-border">
                  <SelectGroup>
                    <SelectItem value="High" className="interactive-hover theme-transition">
                      High
                    </SelectItem>
                    <SelectItem value="Medium" className="interactive-hover theme-transition">
                      Medium
                    </SelectItem>
                    <SelectItem value="Low" className="interactive-hover theme-transition">
                      Low
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {touched.priority && errors.priority && (
                <motion.p
                  className="text-destructive text-sm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  {errors.priority}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium theme-text-primary flex items-center gap-1">
                <Clock className="w-4 h-4" /> Status
              </label>
              <Select
                name="status"
                value={values.status}
                onValueChange={value => formik.setFieldValue('status', value)}
              >
                <SelectTrigger className="w-full theme-input theme-focus">
                  <SelectValue placeholder="Select the status" />
                </SelectTrigger>
                <SelectContent className="theme-surface-elevated theme-border">
                  <SelectGroup>
                    <SelectItem value="Planning" className="interactive-hover theme-transition">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Planning
                      </div>
                    </SelectItem>
                    <SelectItem value="In Progress" className="interactive-hover theme-transition">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        In Progress
                      </div>
                    </SelectItem>
                    <SelectItem value="Completed" className="interactive-hover theme-transition">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        Completed
                      </div>
                    </SelectItem>
                    <SelectItem value="On Hold" className="interactive-hover theme-transition">
                      <div className="flex items-center gap-2">
                        <PauseCircle className="w-4 h-4 text-warning" />
                        On Hold
                      </div>
                    </SelectItem>
                    <SelectItem value="Cancelled" className="interactive-hover theme-transition">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-destructive" />
                        Cancelled
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {touched.status && errors.status && (
                <motion.p
                  className="text-destructive text-sm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  {errors.status}
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      </CardContent>
    </div>
  );
};

export default ProjectInfoStep;
