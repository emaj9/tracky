import { Task } from "./types";

export class DB {
  async getTasks(): Promise<Task[]> {
    const response = await fetch(
      "/db/trasky/_all_docs?include_docs=true"
    );
    if (!response.ok)
      throw new Error(
        `CouchDB GET failed: ${await response.text()}`
      );
    const data = await response.json();
    return data.rows.map((row) => row.doc);
  }

  /**
   * Inserts or creates a task in the database.
   * @param task The task to update or create.
   * @returns The same task with ID and rev updated.
   */
  async updateTask(task: Task): Promise<Task> {
    const response = await fetch("/db/trasky", {
      method: "POST",
      body: JSON.stringify(task),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok)
      throw new Error(
        `CouchDB POST failed: ${await response.text()}`
      );
    const { ok, id, rev } = await response.json();
    if (!ok) throw new Error("oh no doc is not ok");
    return { ...task, _id: id, _rev: rev };
  }
}
