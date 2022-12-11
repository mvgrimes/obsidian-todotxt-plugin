import { TextFileView } from "obsidian";

export const VIEW_TYPE_CSV = "todotxt-view";
export type TODO = {
  completed?: boolean;
  completeDate?: string;
  priority?: string;
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
  listEl: HTMLElement;

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
    this.todoData = data.split("\n").map((line) => {
      const result = TODO_RE.exec(line);
      const groups = result?.groups;
      if (groups) {
        return {
          completed: !!groups.completed,
          priority: groups.priority,
          createDate: groups.createDate,
          completeDate: groups.completeDate,
          description: groups.description,
        };
      } else {
        console.error(`[TodoTxt] setViewData: cannot match todo`, line);
        return { description: `not parsed: ${line}` };
      }
    });

    this.refresh();
  }

  clear() {
    this.todoData = [];
  }

  async onOpen() {
    this.listEl = this.contentEl.createEl("ul");
  }

  async onClose() {
    this.contentEl.empty();
  }

  getViewType() {
    return VIEW_TYPE_CSV;
  }

  refresh() {
    // Remove previous data.
    this.listEl.empty();

    this.todoData.forEach((todo, i) => {
      this.listEl.createEl("li", { text: todo.description });
    });
  }
}
