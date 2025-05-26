'use client';
import FilesStep from '@/components/Projects/FilesStep';
import ProjectInfoStep from '@/components/Projects/ProjectInfoStep';
import TasksStep from '@/components/Projects/TasksStep';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProject } from '@/context/ProjectContext';
import { FileUp, Layers, FolderPlus, ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';
import { Spinner } from '@heroui/spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const steps = [
  { id: 1, title: 'Project Info', icon: <FolderPlus className="w-6 h-6" /> },
  { id: 2, title: 'Tasks', icon: <Layers className="w-5 h-5" /> },
  { id: 3, title: 'Files', icon: <FileUp className="w-5 h-5" /> },
];

const PageContent = () => {
  const { currentStep, setCurrentStep, formik, isProjectCreating } = useProject()!;
  const [stepValidationAttempted, setStepValidationAttempted] = useState(new Set());

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ProjectInfoStep stepValidationAttempted={stepValidationAttempted.has(1)} />;
      case 2:
        return <TasksStep stepValidationAttempted={stepValidationAttempted.has(2)} />;
      case 3:
        return <FilesStep />;
      default:
        return null;
    }
  };

  const handleNext = async () => {
    let isValid = true;

    const newValidationAttempted = new Set(stepValidationAttempted);
    newValidationAttempted.add(currentStep);
    setStepValidationAttempted(newValidationAttempted);

    switch (currentStep) {
      case 1: {
        const errors = await formik.validateForm();

        formik.setTouched({
          ...formik.touched,
          name: true,
          description: true,
          priority: true,
          status: true,
        });

        isValid = !(errors.name || errors.description || errors.priority || errors.status);
        break;
      }
      case 2: {
        const taskErrors = await formik.validateForm();

        if (formik.values.tasks && formik.values.tasks.length > 0) {
          const touchedTasks = formik.values.tasks.map(() => ({
            title: true,
            description: true,
            priority: true,
            status: true,
            dueDate: true,
          }));

          formik.setTouched({
            ...formik.touched,
            tasks: touchedTasks,
          });
        }

        isValid = !taskErrors.tasks;
        break;
      }
      case 3:
        break;
    }

    if (isValid) {
      if (currentStep === steps.length) {
        formik.handleSubmit();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="theme-surface px-4 rounded-md py-2 h-full w-full"
    >
      {/* Content Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full overflow-hidden theme-shadow-lg theme-border theme-surface-elevated">
            <div className="max-h-[70vh] overflow-y-auto">{renderStepContent()}</div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="outline"
            disabled={currentStep === 1}
            onClick={handlePrevious}
            className="flex items-center gap-2 theme-transition hover:translate-x-[-4px] theme-shadow-sm theme-button-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={handleNext}
            disabled={isProjectCreating}
            className="flex items-center gap-2 theme-button-primary theme-transition hover:translate-x-[4px] theme-shadow-md"
          >
            {currentStep === steps.length ? (
              <>
                {isProjectCreating && <Spinner color="white" />}
                Finish
                <CheckCircle className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

const Page = () => {
  return <PageContent />;
};

export default Page;
