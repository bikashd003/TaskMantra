import React from 'react';
import { Card, CardContent } from '../ui/card';
import { BarChart2 } from 'lucide-react';
import { Badge } from '../ui/badge';

const TaskStatiestics = ({ taskStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Total Tasks</p>
            <p className="text-2xl font-bold">{taskStats.total}</p>
          </div>
          <BarChart2 className="h-8 w-8 text-blue-500 opacity-70" />
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-2xl font-bold">{taskStats.inProgress}</p>
          </div>
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
            {Math.round((taskStats.inProgress / taskStats.total) * 100) || 0}%
          </Badge>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold">{taskStats.completed}</p>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
            {Math.round((taskStats.completed / taskStats.total) * 100) || 0}%
          </Badge>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">To Review</p>
            <p className="text-2xl font-bold">{taskStats.review}</p>
          </div>
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
            {Math.round((taskStats.review / taskStats.total) * 100) || 0}%
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskStatiestics;
