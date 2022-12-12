import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { TodoContext } from "./lib/todoContext";
import { TextFileView } from "obsidian";
import { TodoListView } from "./ui/todolist";

export const VIEW_TYPE_CSV = "todotxt-view";
export type TODO = {
  completed: boolean;
  completeDate?: string;
  priority: string;
  createDate?: string;
  description: string;
};

// x 2020-11-19 2020-11-16 Pay Amex Cash Card Bill (Due Dec 11th) t:2020-11-21 +Home @Bills
// (B) 2020-11-17 Update Mac systems +Home
const TODO_RE = RegExp(
  "^" +
    "((?<completed>x) )?" +
    "((?<completeDate>[0-9]{4}-[0-9]{2}-[0-9]{2}) )?" +
    "(\\((?<priority>[A-Z])\\) )?" +
    "((?<createDate>[0-9]{4}-[0-9]{2}-[0-9]{2}) )?" +
    "(?<description>.*?)" +
    "$"
);

export class CSVView extends TextFileView {
  todoData: TODO[];
  root: Root;

  // Convert from TODO[] to string before writing to disk
  getViewData() {
    return this.todoData
      .map((todo: TODO) =>
        [
          todo.completed,
          todo.completeDate,
          todo.priority,
          todo.createDate,
          todo.description,
        ]
          .filter((item) => item)
          .join(" ")
      )
      .join("\n");
  }

  // Convert string from disk to TODO[]
  setViewData(data: string, clear: boolean) {
    this.todoData = data
      .split("\n")
      .filter((line) => line)
      .map((line) => {
        const result = TODO_RE.exec(line);
        const groups = result?.groups;
        if (groups) {
          return {
            completed: !!groups.completed,
            priority: groups.priority ?? "",
            createDate: groups.createDate,
            completeDate: groups.completeDate,
            description: groups.description,
          };
        } else {
          console.error(`[TodoTxt] setViewData: cannot match todo`, line);
          return {
            completed: false,
            priority: "",
            description: `not parsed: ${line}`,
          };
        }
      });
    console.log(`[TodoTxt] setViewData:`, { todoData: this.todoData });

    this.refresh();
  }

  clear() {
    this.todoData = [];
  }

  async onOpen() {
    this.root = createRoot(this.containerEl.children[1]);
  }

  async onClose() {
    this.root.unmount();
  }

  getViewType() {
    return VIEW_TYPE_CSV;
  }

  refresh() {
    console.log(`[TodoTxt] refresh:`);

    const sorted = [...this.todoData].sort(sortTodo);

    this.root.render(
      <TodoContext.Provider value={sorted}>
        <TodoListView />
      </TodoContext.Provider>
    );
  }
}

function sortTodo(a: TODO, b: TODO) {
  if (a.completed < b.completed) return -1;
  if (a.completed > b.completed) return 1;
  if ((a.priority || "X") < (b.priority || "X")) return -1;
  if ((a.priority || "X") > (b.priority || "X")) return 1;
  if (a.description < b.description) return -1;
  if (a.description > b.description) return 1;
  return 0;
}
