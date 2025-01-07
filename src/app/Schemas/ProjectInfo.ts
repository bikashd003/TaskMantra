import * as yup from 'yup'
export const projectInfoSchema = yup.object().shape({
    projectName: yup
        .string()
        .required('Project Name is required')
        .min(3, 'Project Name must be at least 3 characters'),
    description: yup
        .string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters'),
    startDate: yup.date().required('Start Date is required'),
    endDate: yup
        .date()
        .required('End Date is required')
        .min(
            yup.ref('startDate'),
            'End Date must be after Start Date'
        ),
})