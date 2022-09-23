/* eslint-disable react/style-prop-object */
import React, { useEffect, useState } from "react";

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

import { Task, Setter } from "./types";
import { DB } from "./db";
import { getYMD, changing } from "./util";
import { TASK_GROUPS } from "./constants";

import TaskCreator from "./components/TaskCreator";
import TaskList from "./components/TaskList";
import TaskView from "./components/TaskView";

const DbContext = React.createContext<DB>(undefined);

export default function Main() {
  const [tasks, setTasks] =
    React.useState<Task[] | undefined>(undefined);
  const [db] = useState<DB>(new DB());

  useEffect(() => {
    (async () => {
      setTasks(await db.getTasks());
    })();
  }, [setTasks, db]);

  const smartUpdateTask = async (
    t: Task
  ): Promise<Task> => {
    const newTask = await db.updateTask(t);
    if (newTask._id !== t._id)
      setTasks((ts) => ts.concat([newTask]));
    else
      setTasks((ts) =>
        ts.map((t) => (t._id === newTask._id ? newTask : t))
      );
    return newTask;
  };

  const transformTask = async (
    task: Task,
    f: (x: Task) => Task
  ): Promise<Task> => {
    const newTask = f(task);
    return JSON.stringify(task) === JSON.stringify(newTask)
      ? newTask
      : await smartUpdateTask(newTask);
  };

  if ("undefined" === typeof tasks) return null;

  /**
   * The given function is applied to each task and must construct a
   * new task from it. A new full task list is built and replaces the
   * current one.
   */
  const mapTasks = async (f: (t: Task) => Task) => {
    const newTasks = [];
    for (const task of tasks)
      newTasks.push(await transformTask(task, f));
    return newTasks;
  };

  const clearToDoing = () =>
    mapTasks((t) =>
      "in progress" === t.state
        ? {
            ...t,
            state:
              t.completed_on === null
                ? "pending"
                : "complete",
          }
        : { ...t }
    );

  const clearDid = () =>
    mapTasks((t) =>
      "complete" === t.state && !t.deleted
        ? { ...t, deleted: true }
        : { ...t }
    );

  const tasksWhere = (
    tasks,
    predicate
  ): Array<readonly [Task, Setter<Task>]> =>
    tasks.flatMap((t, index) =>
      predicate(t)
        ? ([
            [t, (f) => transformTask(t, f)] as const,
          ] as const)
        : []
    );

  const tasksOfState = (tasks, state) =>
    tasksWhere(tasks, (t) => t.state === state);

  return (
    <>
      <h2 id="header">Tasky</h2>
      <Grid
        className="task-grid"
        columns={4}
        centered={true}
      >
        <Grid.Column
          widths="3"
          floated="left"
          id="todo-panel"
        >
          <h4 className="panel-header">Tasks</h4>
          <div id="task-adder">
            <TaskCreator
              groups={TASK_GROUPS}
              updateTask={smartUpdateTask}
              tasks={tasks}
            />
          </div>
          <TaskList
            tasks={tasksOfState(tasks, "pending")}
          />
        </Grid.Column>
        <Grid.Column widths="3" id="doing-panel">
          <h4 className="panel-header">
            Today's to do
            <Button onClick={clearToDoing} floated="right">
              CLEAR
            </Button>
          </h4>
          <TaskList
            tasks={tasksOfState(tasks, "in progress")}
          />
        </Grid.Column>
        <Grid.Column
          widths="3"
          floated="right"
          id="done-panel"
        >
          <h4 className="panel-header">
            Did
            <Button onClick={clearDid} floated="right">
              CLEAR
            </Button>
          </h4>
          <TaskList
            tasks={tasksWhere(
              tasks,
              (t) => t.state === "complete" && !t.deleted
            )}
          />
        </Grid.Column>
      </Grid>
    </>
  );
}
