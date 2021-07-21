import React from "react";
import { Card, Checkbox, Button } from "semantic-ui-react";
import { Task } from "../types";
import { getYMD } from "../util";

export default function TaskView({ task, setTask }) {
  const handleClick = () => {
    if (task.state === "pending")
      setTask((t) => ({ ...t, state: "in progress" }));
  };
  const handleCompletionChange = (event) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    task.completed_on !== null
      ? setTask((t: Task) => ({
          ...t,
          completed_on: null,
        }))
      : setTask((t: Task) => ({
          ...t,
          completed_on: getYMD(),
        }));
  };
  const classes = ["card"];
  //if (task.deleted) classes.push("card-deleted");

  return (
    <Card fluid>
      <Card.Content className={classes.join(" ")}>
        <Checkbox
          className="checkbox"
          checked={task.completed_on !== null}
          onChange={handleCompletionChange}
          name="check"
          disabled={task.state !== "in progress"}
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
