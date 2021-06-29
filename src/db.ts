import { Task } from "./types";

export class DB {
  getTasks(): Task[] {
    const tasks = window.localStorage.getItem("tasks");
    if (null === tasks || "undefined" === tasks) return [];
    return JSON.parse(tasks);
  }
  setTasks(tasks: Task[]) {
    window.localStorage.setItem(
      "tasks",
      JSON.stringify(tasks)
    );
  }
}
