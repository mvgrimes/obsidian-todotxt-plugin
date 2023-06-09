import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { TextFileView, WorkspaceLeaf } from 'obsidian';
import { TodosView } from './ui/todosview';
import { parseTodo, stringifyTodo, type TODO } from './lib/todo';
import TodotxtPlugin from './main';

export const VIEW_TYPE_TODOTXT = 'todotxt-view';

export class TodotxtView extends TextFileView {
  todoData: TODO[];
  fileFormat: 'unix' | 'dos' = 'unix';
  root: Root;
  plugin: TodotxtPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: TodotxtPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  // Convert from TODO[] to string before writing to disk
  getViewData() {
    const lineSep = this.fileFormat === 'dos' ? '\r\n' : '\n';
    return this.todoData.map(stringifyTodo).join(lineSep);
  }

  // Convert string from disk to TODO[]
  setViewData(data: string, clear: boolean) {
    if (data.match(/\r\n/)) this.fileFormat = 'dos';

    this.todoData = data
      .split(/\r?\n/)
      .filter((line) => line)
      .map(parseTodo);

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
    return VIEW_TYPE_TODOTXT;
  }

  update(todos: TODO[]) {
    // console.log(`[TodoTxt] update`, { todos });
    this.todoData = todos;
    this.refresh();
    this.requestSave();
  }

  refresh() {
    this.root.render(
      <TodosView
        todos={this.todoData}
        onChange={this.update.bind(this)}
        defaultPriorityFilter={
          this.plugin?.settings?.defaultPriorityFilter || 'B'
        }
      />,
    );
  }
}
