'use client'

import { useState } from 'react'
import { FileUp, Layers, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ProjectInfoStep from '@/components/Projects/ProjectInfoStep'
import TasksStep from '@/components/Projects/TasksStep'
import FilesStep from '@/components/Projects/FilesStep'
import { ProjectProvider } from '@/context/ProjectContext'

const steps = [
    { id: 1, title: 'Project Info', icon: <FolderPlus className="w-6 h-6" /> },
    { id: 2, title: 'Tasks', icon: <Layers className="w-5 h-5" /> },
    { id: 3, title: 'Files', icon: <FileUp className="w-5 h-5" /> },
]

export default function NewProject() {
    const [currentStep, setCurrentStep] = useState(1)

    const handleNext = async () => {
        switch (currentStep) {
            case 1:
                // ProjectInfoStep validation will be handled by the component
                break;
            case 2:
                // Add validation for TasksStep
                break;
            case 3:
                // Add validation for FilesStep
                break;
        }
    };
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <ProjectInfoStep
                        onNext={() => setCurrentStep(prev => prev + 1)}
                    />
                );
            case 2:
                return (
                    <TasksStep
                        onNext={() => setCurrentStep(prev => prev + 1)}
                    />
                );
            case 3:
                return (
                    <FilesStep
                        onNext={() => setCurrentStep(prev => prev + 1)}
                    />
                );
            default:
                return <ProjectInfoStep onNext={() => setCurrentStep(prev => prev + 1)} />;
        }
    };
    return (
        <ProjectProvider>
            <div className="min-h-screen bg-gray-50 p-8">
                {/* Step Indicator remains the same */}

                <Card className="shadow-lg p-6">{renderStepContent()}</Card>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <Button
                        variant="ghost"
                        disabled={currentStep === 1}
                        onClick={() => setCurrentStep((prev) => prev - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={currentStep === steps.length}
                    >
                        {currentStep === steps.length ? 'Finish' : 'Next'}
                    </Button>
                </div>
            </div>
        </ProjectProvider>
    );
}