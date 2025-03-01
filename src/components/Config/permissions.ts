const permissions = {
    system: {
        Admin: ['manage_users', 'delete_organizations', 'view_all_projects'],
        User: ['create_organization', 'join_organization'],
    },
    organization: {
        Owner: ['delete_organization', 'manage_members', 'create_project'],
        Member: ['view_projects', 'join_projects'],
        Guest: ['view_projects'],
    },
    project: {
        'Project Admin': ['delete_project', 'manage_members', 'create_task'],
        Developer: ['edit_tasks', 'view_tasks'],
        Viewer: ['view_tasks'],
    },
    task: {
        Assignee: ['update_task_status', 'log_time'],
        Reviewer: ['review_task', 'add_comments'],
        Creator: ['edit_task', 'delete_task'],
    },
};
export default permissions;