import * as yup from 'yup'
export const projectInfoSchema = yup.object().shape({
    name: yup
        .string()
        .required('Project Name is required')
        .min(3, 'Project Name must be at least 3 characters'),
    description: yup
        .string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters'),
    priority: yup.string().oneOf(['High', 'Medium', 'Low']).required('Priority is required'),
    status: yup.string().oneOf(['Planning', 'In Progress', 'Completed', 'On Hold', 'Cancelled']).required('Status is required'),

    tasks: yup.array().of(yup.object().shape({
        name: yup.string().required('Task name is required').min(3, 'Task name must be at least 3 characters'),
        description: yup.string().default('').required('Description is required'),
        assignedTo: yup.array().default([]),
        status: yup.string().oneOf(['To Do', 'In Progress', 'Review', 'Completed']).required('Status is required'),
        priority: yup.string().oneOf(['High', 'Medium', 'Low']).required('Priority is required'),
        dueDate: yup.string().required('Due date is required'),
        startDate: yup.string().required('Start date is required'),
        estimatedTime: yup.number().min(0, 'Estimated time cannot be negative').required('Estimated time is required'),
        loggedTime: yup.number().min(0, 'Logged time cannot be negative'),
        subtasks: yup.array().default([]),
        comments: yup.array().default([]),
    })).default([]),
    history: yup.array().default([]),
    files: yup.array().default([])
})
