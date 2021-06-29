/* eslint-disable react/style-prop-object */
import React, { useEffect, useRef } from "react";

import "./style.css";
import "semantic-ui-css/semantic.min.css";
import u from "underscore";

import {
  Card,
  Checkbox,
  Button,
  Form,
  Container,
  Radio,
  Grid,
  Accordion,
  Icon,
  AccordionPanel,
} from "semantic-ui-react";

import data from "./exampleObj.json";

import { Task } from "./types";
import { DB } from "./db";
import { getYMD } from './util';

import TaskView from './TaskView';
import TaskCreator from './components/TaskCreator';

const TASK_GROUPS = [
  "house",
  "research",
  "selfcare",
  "relationship",
  "other",
];

type Setter<T> = (x: T | ((x: T) => T)) => void;

//give list of tasks,
//returns the pretty html to display tasks grouped by tag
function TaskRenderer({
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

const changing = (array, index, func) => {
  const copy = [...array];
  copy[index] = func(copy[index]);
  return copy;
};

export default function Main() {
  const [tasks, setTasksOriginal] =
    React.useState<Task[] | undefined>(undefined);

  const setTasks = (f) => {
    const db = new DB();
    const newTasks = "function" === typeof f ? f(tasks) : f;
    db.setTasks(newTasks);
    setTasksOriginal(newTasks);
  };

  useEffect(() => {
    const db = new DB();
    setTasksOriginal(() => db.getTasks());
  }, [setTasksOriginal]);

  if ("undefined" === typeof tasks) return null;

  const clearToDoing = () => {
      setTasks((tasks) => {
          const newTasks = tasks.slice();
          for (const task of newTasks) {
              if (task.state === 'in progress')
                  task.state = task.completed_on === null ? 'pending' : 'complete';

          }
          return newTasks;
      });
  };
  const tasksOfState = (tasks, state): Array<readonly [Task, Setter<Task>]> =>
    tasks.flatMap((t, index) =>
      t.state === state
        ? ([
            [
              t,
              (f) =>
                setTasks((ts) => changing(ts, index, f)),
            ] as const,
          ] as const)
        : []
    );

  return (
      <>
      <h2 id="header">Tasky</h2>
      <Grid className="task-grid" columns={4} centered={true}>
        <Grid.Column
          widths="3"
          floated="left"
          id="todo-panel"
        >
          <h4 className="panel-header">Tasks</h4>
          <div id="task-adder">
            <TaskCreator
              groups={TASK_GROUPS}
              setTasks={setTasks}
              tasks={tasks}
            />
          </div>
          <TaskRenderer tasks={tasksOfState(tasks, "pending")} />
        </Grid.Column>
        <Grid.Column widths="3" id="doing-panel">
          <h4 className="panel-header">
            {" "}
            Today's to do
            <Button onClick={clearToDoing} floated="right">
              CLEAR
            </Button>{" "}
          </h4>
          <TaskRenderer
            tasks={tasksOfState(tasks, "in progress")}
          />
        </Grid.Column>
        <Grid.Column
          widths="3"
          floated="right"
          id="done-panel"
        >
          <h4 className="panel-header"> Did </h4>
          <TaskRenderer tasks={tasksOfState(tasks, "complete")} />
        </Grid.Column>
      </Grid>
    </>
  );
}
