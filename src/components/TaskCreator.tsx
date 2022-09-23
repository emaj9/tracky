import React from "react";
import { Button, Accordion, Form } from "semantic-ui-react";
import { getYMD } from "../util";

export default function TaskCreator({
  groups,
  updateTask,
  tasks,
}) {
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
  const handleSubmit = async (event) => {
    const constructTask = {
      ...newTask,
      assignee: null,
      state: "pending",
      created_on: getYMD(),
      assigned_on: null,
      completed_on: null,
      deleted: false,
    };
    await updateTask(constructTask);
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
            <Form.Group widths="10" grouped={true}>
              {groups.map((group) => (
                <Form.Radio
                  checked={newTask.tag === group}
                  name="tag"
                  key={group}
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
