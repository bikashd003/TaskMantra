// eslint-disable-next-line @typescript-eslint/no-unused-vars
const projectManagementData = {
  projects: [
    {
      id: 1,
      name: "Project Alpha",
      description: "Develop a new marketing website",
      status: "In Progress", // "Planning", "In Progress", "Completed", "On Hold", "Cancelled"
      priority: "High", // "High", "Medium", "Low"
      tasks: [
        {
          id: 101,
          name: "Design Homepage Wireframe",
          description: "Create a low-fidelity wireframe for the homepage.",
          assignedTo: [2, 3], // User IDs
          status: "Completed", // "To Do", "In Progress", "Review", "Completed"
          priority: "High",
          dueDate: "2024-03-10",
          startDate: "2024-03-07",
          estimatedTime: 8, // Estimated time in hours
          loggedTime: 6.5, // Actual time spent in hours
          dependencies: [], // IDs of tasks this task depends on
          subtasks: [
            {
              id: 1011,
              name: "Research competitor homepages",
              completed: true,
            },
            {
              id: 1012,
              name: "Draft initial wireframe",
              completed: true,
            },
          ],
          comments: [
            {
              userId: 2,
              text: "Initial wireframes attached.",
              timestamp: "2024-03-08T14:30:00Z",
              attachments: [
                {
                  filename: "wireframes.pdf",
                  url: "/uploads/project-1/task-101/wireframes.pdf"
                }
              ]
            }
          ]
        },
        // ... more tasks
      ],
    },
    // ... more projects
  ],
  users: [
    {
      id: 1,
      name: "John Doe",
      role: "Backend Developer",
      availability: { // Availability for new tasks
        monday: true,
        tuesday: false,
        // ...
      }
    },
    // ... more users
  ],
  files: [
    {
      id: 1,
      name: "Project Plan",
      url: "/uploads/project-1/project-plan.pdf"
    },
    // ... more files
  ],
  calendar: [
    {
      date: "2024-03-10",
      events: [
        {
          taskId: 101,
          type: "deadline",
        },
        {
          type: "meeting",
          title: "Project Alpha Kickoff",
          startTime: "2024-03-10T09:00:00Z",
          endTime: "2024-03-10T10:00:00Z",
          participants: [1, 2, 3]
        }
      ],
    },
    // ... more calendar days
  ],
  activityLog: [
    // Log of actions taken in the system
    {
      timestamp: "2024-03-12T15:45:00Z",
      userId: 1,
      action: "created task",
      details: {
        projectId: 1,
        taskId: 103,
        taskName: "Implement user authentication"
      }
    }
  ]
};
