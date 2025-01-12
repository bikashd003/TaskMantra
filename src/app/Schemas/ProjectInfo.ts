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
    tasks: yup.array().default([]),
    history: yup.array().default([])
})
