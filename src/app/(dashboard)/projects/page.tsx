"use client"
import FilesStep from "@/components/Projects/FilesStep"
import ProjectInfoStep from "@/components/Projects/ProjectInfoStep"
import TasksStep from "@/components/Projects/TasksStep"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProjectProvider, useProject } from "@/context/ProjectContext"
import { FileUp, Layers, FolderPlus, ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react'

const steps = [
    { id: 1, title: 'Project Info', icon: <FolderPlus className="w-6 h-6" /> },
    { id: 2, title: 'Tasks', icon: <Layers className="w-5 h-5" /> },
    { id: 3, title: 'Files', icon: <FileUp className="w-5 h-5" /> },
]

const PageContent = () => {
    const { currentStep, setCurrentStep, trigger, handleSubmit, onSubmit } = useProject()!;

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
                isValid = await trigger(['name', 'description', 'priority', 'status']);
                break;
            case 2:
                isValid = await trigger('tasks');
                break;
            case 3:
                break;
        }

        if (isValid) {
            if (currentStep === steps.length) {
                handleSubmit(onSubmit)();
            } else {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Card className="w-full h-full overflow-y-auto">{renderStepContent()}</Card>
            <div className="flex justify-between mt-6">
                <Button
                    variant="outline"
                    disabled={currentStep === 1}
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex items-center gap-2 transition-all hover:translate-x-[-4px]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                </Button>
                <Button
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all hover:translate-x-[4px]"
                >
                    {currentStep === steps.length ? (
                        <>
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