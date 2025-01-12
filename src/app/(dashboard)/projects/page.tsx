"use client"
import FilesStep from "@/components/Projects/FilesStep"
import ProjectInfoStep from "@/components/Projects/ProjectInfoStep"
import TasksStep from "@/components/Projects/TasksStep"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProjectProvider, useProject } from "@/context/ProjectContext"
import { FileUp, Layers, FolderPlus } from 'lucide-react'

const steps = [
    { id: 1, title: 'Project Info', icon: <FolderPlus className="w-6 h-6" /> },
    { id: 2, title: 'Tasks', icon: <Layers className="w-5 h-5" /> },
    { id: 3, title: 'Files', icon: <FileUp className="w-5 h-5" /> },
]

const PageContent = () => {
    const { currentStep, setCurrentStep } = useProject()!;

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
        setCurrentStep(currentStep + 1);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Card className="shadow-lg p-6">{renderStepContent()}</Card>
            <div className="flex justify-between mt-6">
                <Button
                    variant="ghost"
                    disabled={currentStep === 1}
                    onClick={() => setCurrentStep(currentStep - 1)}
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
    );
};

const Page = () => {
    return (
        <ProjectProvider>
            <PageContent />
        </ProjectProvider>
    );
};

export default Page;