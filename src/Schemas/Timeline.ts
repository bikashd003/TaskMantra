import * as Yup from 'yup';

export const timelineSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date().required('End date is required'),
  projectId: Yup.string().required('Project is required').typeError('Project is required'),
  status: Yup.string()
    .oneOf(['planned', 'in_progress', 'completed', 'delayed'], 'Invalid status')
    .required('Status is required')
    .typeError('Status must be a string'),
  progress: Yup.number().min(0).max(100),
  color: Yup.string().required(),
  users: Yup.array().of(Yup.string()),
});
