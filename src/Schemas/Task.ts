import * as Yup from 'yup';
export const taskSchema = Yup.object().shape({
  name: Yup.string().required('Task name is required'),
  description: Yup.string(),
  status: Yup.string()
    .oneOf(['To Do', 'In Progress', 'Review', 'Completed'])
    .required('Status is required'),
  priority: Yup.string().oneOf(['High', 'Medium', 'Low']).required('Priority is required'),
  dueDate: Yup.date(),
  startDate: Yup.date(),
  estimatedTime: Yup.number().min(0, 'Estimated time cannot be negative'),
  loggedTime: Yup.number().min(0, 'Logged time cannot be negative'),
  projectId: Yup.string(),
  subtasks: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required('Subtask name is required'),
      completed: Yup.boolean().default(false),
    })
  ),
  assignedTo: Yup.array().of(Yup.string()),
  dependencies: Yup.array().of(Yup.string()),
});
