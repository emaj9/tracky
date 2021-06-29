/* eslint-disable react/style-prop-object */
import React, { useEffect, useRef } from "react";
import "./style.css";
import "semantic-ui-css/semantic.min.css";
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
import u from "underscore";
import {
  isThisTypeNode,
  setSourceMapRange,
} from "typescript";
import { Task } from "./types";
import { DB } from "./db";

const TASK_GROUPS = [
  "house",
  "research",
  "selfcare",
  "relationship",
  "other",
];

//next: card actions
function CardMaker({ task, setTask }) {
  const [completed, setCompleted] = React.useState(
    task.state === "complete" ? true : false
  );
  const handleClick = () => {
    if (task.state === "pending")
      setTask((t) => ({ ...t, state: "in progress" }));
  };
  const handleCompletionChange = (event) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    completed
      ? (setCompleted(false),
        setTask((t: Task) => ({
          ...t,
          completed_on: null,
        })))
      : (setCompleted(true),
        setTask((t: Task) => ({
          ...t,
          completed_on: getYMD(),
        })));
  };
  return (
    <Card fluid>
      <Card.Content className="card">
        <Checkbox
          className="checkbox"
          checked={
            task.state === "complete" ? true : completed
          }
          onChange={handleCompletionChange}
          name="check"
          disabled={task.state === "pending"}
          label={task.task}
        />
        {task.group}
        {task.state === "pending" ? (
          <Button
            floated="right"
            size="mini"
            onClick={handleClick}
            compact={true}
          >
            +
          </Button>
        ) : (
          ""
        )}
      </Card.Content>
    </Card>
  );
}

//ex 2021-12-31
function getYMD() {
  const today = new Date();
  return (
    today.getFullYear() +
    "-" +
    (today.getMonth() + 1) +
    "-" +
    today.getDate()
  );
}

function FormMaker({ groups, setTasks, tasks }) {
  const [newTask, setNewTask] = React.useState({
    task: "",
    tag: "",
    assignee: null,
  });

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsOpen(!isOpen);
    }
  };

  const [isOpen, setIsOpen] = React.useState(false);

  const handleAssignmentChange = (event) => {
    setNewTask((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.checked,
    }));
  };
  const handleTaskChange = (event) => {
    setNewTask((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };
  const handleSubmit = (event) => {
    const constructTask = {
      ...newTask,
      assignee: null,
      state: "pending",
      created_on: getYMD(),
      assigned_on: null,
      completed_on: null,
      deleted: false,
    };
    setTasks(tasks.concat([constructTask]));
    setNewTask({
      task: "",
      tag: "",
      assignee: null,
    });
    event.preventDefault();
  };
  return (
    <div>
      <Button
        id="add-task-button"
        fluid
        onClick={() => setIsOpen(!isOpen)}
      >
        New Task
      </Button>
      <Accordion styled fluid id="addtask">
        <Accordion.Title id="emptytitle"></Accordion.Title>
        <Accordion.Content active={isOpen}>
          <Form onSubmit={handleSubmit}>
            <Form.Input
              value={newTask.task}
              onChange={handleTaskChange}
              name="task"
            />
            <Form.Group
              widths="10"
              grouped={true}
              inline={true}
            >
              {groups.map((group) => (
                <Form.Radio
                  checked={newTask.tag === group}
                  name="tag"
                  value={group}
                  label={group}
                  onChange={(e, { value }) =>
                    setNewTask((prevState) => ({
                      ...prevState,
                      tag: group,
                    }))
                  }
                />
              ))}
            </Form.Group>
            {
              //<RadioGroup
              //name="assignee"
              //onChange={handleTaskChange}
              //value={newTask.assignee}
              //>
              //{["eric", "jake"].map((potentialAssignee) => (
              //<FormControlLabel
              //value={potentialAssignee}
              //name="assignee"
              //control={<Radio />}
              //label={
              //potentialAssignee.charAt(0).toUpperCase() +
              //potentialAssignee.slice(1)
              //}
              ///>
              //))}
              //</RadioGroup>
            }
            <Form.Button content="Submit" />
          </Form>
        </Accordion.Content>
      </Accordion>
    </div>
  );
}

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

  return (
    <>
      {Object.entries(groupedTasksByTag).map(
        ([group, vs]) => (
          <div className={"task-group task-group-" + group}>
            <h4 className="task-header">{group}</h4>
            {vs.map(([task, setter]) => (
              <CardMaker
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
    const inProgs = tasksOfState("in progress");
    inProgs.map(([, setter]) =>
      setter((t) =>
        t.completed_on === null
          ? { ...t, state: "pending" }
          : { ...t, state: "complete" }
      )
    );
  };
  const tasksOfState = (
    state
  ): Array<readonly [Task, Setter<Task>]> =>
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
    <div id="main">
      <h2 id="header">Tasky</h2>
      <Grid columns={4} centered={true}>
        <Grid.Column
          widths="3"
          floated="left"
          id="todo-panel"
        >
          <h4 className="panel-header">Tasks</h4>
          <div id="task-adder">
            <FormMaker
              groups={TASK_GROUPS}
              setTasks={setTasks}
              tasks={tasks}
            />
          </div>
          <TaskRenderer tasks={tasksOfState("pending")} />
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
            tasks={tasksOfState("in progress")}
          />
        </Grid.Column>
        <Grid.Column
          widths="3"
          floated="right"
          id="done-panel"
        >
          <h4 className="panel-header"> Did </h4>
          <TaskRenderer tasks={tasksOfState("complete")} />
        </Grid.Column>
      </Grid>
    </div>
  );
}
