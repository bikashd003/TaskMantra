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

const steps = [
  { id: 1, title: 'Project Info', icon: <FolderPlus className="w-6 h-6" /> },
  { id: 2, title: 'Tasks', icon: <Layers className="w-5 h-5" /> },
  { id: 3, title: 'Files', icon: <FileUp className="w-5 h-5" /> },
];

const PageContent = () => {
  const { currentStep, setCurrentStep, formik, isProjectCreating } = useProject()!;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ProjectInfoStep />;
      case 2:
        return <TasksStep />;
      case 3:
        return <FilesStep />;
      default:
        return null;
    }
  };

  const handleNext = async () => {
    let isValid = true;

    switch (currentStep) {
      case 1:
        await formik.validateForm();
        isValid = !(
          formik.errors.name ||
          formik.errors.description ||
          formik.errors.priority ||
          formik.errors.status
        );
        break;
      case 2:
        await formik.validateForm();
        isValid = !formik.errors.tasks;
        break;
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

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center z-10
                                        ${
                                          currentStep === step.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                            : currentStep > step.id
                                              ? 'bg-green-500 text-white'
                                              : 'bg-white text-gray-400 border border-gray-200'
                                        }`}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    if (currentStep > step.id) {
                      setCurrentStep(step.id);
                    }
                  }}
                  style={{ cursor: currentStep > step.id ? 'pointer' : 'default' }}
                >
                  {step.icon}
                </motion.div>
                <p
                  className={`mt-2 text-sm font-medium ${currentStep === step.id ? 'text-blue-600' : 'text-gray-500'}`}
                >
                  {step.title}
                </p>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-6 left-12 w-[calc(100vw/4)] h-[2px] bg-gray-200 -z-10">
                    <motion.div
                      className="h-full bg-blue-500"
                      initial={{ width: '0%' }}
                      animate={{
                        width: currentStep > step.id ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-full overflow-hidden shadow-lg border-0">
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
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center gap-2 transition-all hover:translate-x-[-4px] shadow-sm"
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
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all hover:translate-x-[4px] shadow-md"
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
      </div>
    </div>
  );
};

const Page = () => {
  return <PageContent />;
};

export default Page;
