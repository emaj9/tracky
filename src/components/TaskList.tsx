import React from 'react';
import u from 'underscore';

import TaskView from './TaskView';

import { Task, Setter } from '../types';

//give list of tasks,
//returns the pretty html to display tasks grouped by tag
export default function TaskRenderer({
  tasks,
}: {
  tasks: Array<readonly [Task, Setter<Task>]>;
}) {
  const groupedTasksByTag = u.groupBy(
    tasks,
    ([t]) => t.tag
  ) as {
    [key: string]: Array<[Task, Setter<Task>]>;
  };
  const sortedGroupedTasksByTag = Object.entries(groupedTasksByTag).sort(([k1], [k2]) => k1.localeCompare(k2));

  return (
    <>
      {sortedGroupedTasksByTag.map(
        ([group, vs]) => (
          <div className={"task-group task-group-" + group}>
            <h4 className="task-header">{group}</h4>
            {vs.map(([task, setter]) => (
              <TaskView
                key={task.task}
                task={task}
                setTask={setter}
              />
            ))}
          </div>
        )
      )}
    </>
  );
}
