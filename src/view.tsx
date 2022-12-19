import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { TextFileView } from 'obsidian';
import { TodosView } from './ui/todosview';
import { parseTodo, stringifyTodo, type TODO } from './lib/todo';

export const VIEW_TYPE_CSV = 'todotxt-view';

export class CSVView extends TextFileView {
  todoData: TODO[];
  root: Root;

  // Convert from TODO[] to string before writing to disk
  getViewData() {
    console.log(`[TodoTxt] getViewData`);
    return this.todoData.map(stringifyTodo).join('\n');
  }

  // Convert string from disk to TODO[]
  setViewData(data: string, clear: boolean) {
    console.log(`[TodoTxt] setViewData`);

    this.todoData = data
      .split('\n')
      .filter((line) => line)
      .map(parseTodo);

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

  update(todos: TODO[]) {
    console.log(`[TodoTxt] update`, { todos });
    this.todoData = todos;
    this.refresh();
    this.requestSave();
  }

  refresh() {
    console.log(`[TodoTxt] refresh:`);
    this.root.render(
      <TodosView todos={this.todoData} onChange={this.update.bind(this)} />,
    );
  }
}
