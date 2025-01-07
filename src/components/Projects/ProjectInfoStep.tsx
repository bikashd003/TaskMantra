'use client'

import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Folder, Info } from 'lucide-react'
import { projectInfoSchema } from '@/app/Schemas/ProjectInfo'
import { useProject } from '@/context/ProjectContext'



export default function ProjectInfoStep({ onNext }: { onNext: (data: unknown) => void }) {
    const { updateProjectData } = useProject();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(projectInfoSchema),
        defaultValues: {
            projectName: '',
            description: '',
            startDate: undefined,
            endDate: undefined,
        },
    });

    const onSubmit = (data: unknown) => {
        updateProjectData('projects', data);
        onNext(data);
    };
    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                <Folder className="w-6 h-6 text-blue-500" /> Project Info
            </h2>
            <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Project Name */}
                    <div>
                        <label className=" text-sm font-medium text-blue-700 flex items-center gap-1">
                            <Info className="w-4 h-4 text-blue-500" /> Project Name
                        </label>
                        <Controller
                            name="projectName"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    placeholder="Enter your project name"
                                    className={`mt-1 block w-full rounded-md shadow-sm ${errors.projectName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            )}
                        />
                        {errors.projectName && (
                            <p className="text-red-500 text-sm mt-1">{errors.projectName.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className=" text-sm font-medium text-blue-700 flex items-center gap-1">
                            <Info className="w-4 h-4 text-blue-500" /> Description
                        </label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="Describe your project in detail"
                                    className={`mt-1 block w-full rounded-md shadow-sm ${errors.description ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    rows={4}
                                />
                            )}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className=" text-sm font-medium text-blue-700 flex items-center gap-1">
                            <Info className="w-4 h-4 text-blue-500" /> Start Date
                        </label>
                        <Controller
                            name="startDate"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="date"
                                    value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                    className={`mt-1 block w-full rounded-md shadow-sm ${errors.startDate ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            )}
                        />
                        {errors.startDate && (
                            <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                        )}
                    </div>

                    {/* End Date */}
                    <div>
                        <label className=" text-sm font-medium text-blue-700 flex items-center gap-1">
                            <Info className="w-4 h-4 text-blue-500" /> End Date
                        </label>
                        <Controller
                            name="endDate"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="date"
                                    value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                    className={`mt-1 block w-full rounded-md shadow-sm ${errors.endDate ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            )}
                        />
                        {errors.endDate && (
                            <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
