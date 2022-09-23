export type State = "complete" | "in progress" | "pending";
export type Assignee = "eric" | "jake";
export interface Task {
  task: string;
  assignee: Assignee | null;
  tag: string;
  state: State;
  created_on: string;
  assigned_on: string | null;
  completed_on: string | null;
  deleted: boolean;
  _id?: string;
  _rev?: string;
}

export type Setter<T> = (x: T | ((x: T) => T)) => void;
