import React from 'react'

const ProjectAnalytics = ({ project }: { project: any }) => {
  return (
    <div className='bg-green-300'>{project?.name}</div>
  )
}

export default ProjectAnalytics