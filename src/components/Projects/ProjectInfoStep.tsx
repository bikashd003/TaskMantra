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
    <div className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-700 flex items-center gap-2">
          <Folder className="w-6 h-6" /> Project Information
        </CardTitle>
        <CardDescription>Fill in the details of your new project</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-700 flex items-center gap-1">
              <Info className="w-4 h-4" /> Project Name
            </label>
            <Input
              id="name"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your project name"
              className={`w-full ${touched.name && errors.name ? 'border-destructive' : ''}`}
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
            <label className="text-sm font-medium text-blue-700 flex items-center gap-1">
              <Info className="w-4 h-4" /> Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Describe your project in detail"
              className={`w-full ${touched.description && errors.description ? 'border-destructive' : ''}`}
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
              <label className="text-sm font-medium text-blue-700 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Priority
              </label>
              <Select
                name="priority"
                value={values.priority}
                onValueChange={value => formik.setFieldValue('priority', value)}
              >
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
              <label className="text-sm font-medium text-blue-700 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Status
              </label>
              <Select
                name="status"
                value={values.status}
                onValueChange={value => formik.setFieldValue('status', value)}
              >
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
