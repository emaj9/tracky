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

import { Task, Setter } from "./types";
import { DB } from "./db";
import { getYMD, changing } from './util';
import { TASK_GROUPS } from './constants';

import TaskCreator from './components/TaskCreator';
import TaskList from './components/TaskList';
import TaskView from './components/TaskView';

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

  /**
   * The given function is applied to each task and must construct a
   * new task from it. A new full task list is built and replaces the
   * current one.
   */
  const mapTasks = (f: (t: Task) => Task) => {
    setTasks((tasks) => {
      const newTasks: Task[] = [];
      for (const t of tasks) {
        newTasks.push(f(t));
      }
      return newTasks;
    });
  }

  const clearToDoing = () =>
    mapTasks((t) =>
      'in progress' === t.state
      ? { ...t, state: t.completed_on === null ? 'pending' : 'complete' }
      : { ...t }
    );

  const clearDid = () =>
    mapTasks((t) =>
      'complete' === t.state && !t.deleted
      ? { ...t, deleted: true }
      : { ...t }
    );

  const tasksWhere = (tasks, predicate): Array<readonly [Task, Setter<Task>]> =>
    tasks.flatMap((t, index) =>
      predicate(t)
        ? ([
            [
              t,
              (f) =>
                setTasks((ts) => changing(ts, index, f)),
            ] as const,
          ] as const)
        : []
    );

  const tasksOfState = (tasks, state) =>
    tasksWhere(tasks, (t) => t.state === state);

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
          <TaskList tasks={tasksOfState(tasks, "pending")} />
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
              (t) => t.state === 'completed' && !t.deleted)
            } />
        </Grid.Column>
      </Grid>
    </>
  );
}
