import * as React from 'react';
import { useState, type FormEvent } from 'react';
import type { TODO } from '../view';
import { TodoList } from './todolist';

type TodosViewProps = {
  todos: TODO[];
  onChange: (t: TODO[]) => void;
};
export const TodosView = (props: TodosViewProps) => {
  const [minPriority, setMinPriority] = useState('B');
  console.log(`TodosView: `, { todos: props.todos });

  const todoTags = ['+Default', ...props.todos.flatMap((todo) => todo.tags)]
    .sort()
    .unique();

  const todoLists = Object.fromEntries(
    todoTags.map((tag) => [tag, [] as TODO[]]),
  );

  props.todos.forEach((todo) => {
    if ((todo.priority || 'Z') > minPriority) return;

    if (todo.tags.length > 0) {
      todo.tags.forEach((tag) => {
        todoLists[tag] ||= [];
        todoLists[tag].push(todo);
      });
    } else {
      todoLists['+Default'] ||= [];
      todoLists['+Default'].push(todo);
    }
  });

  const handleChangePriorityFilter = (e: FormEvent<HTMLSelectElement>) => {
    setMinPriority(e.currentTarget.value);
  };

  const handleChange = (id: number) => {
    const newTodos = [...props.todos];
    const todo = newTodos.find((todo) => todo.id === id) as TODO;
    todo.completed = !todo?.completed;
    if (todo.completed) {
      todo.completedDate = new Date().toISOString().substring(0, 10);
    } else {
      todo.completedDate = undefined;
    }
    if (props.onChange) props.onChange(newTodos);
  };

  return (
    <div className="todos-view">
      <div className="todos-view-header">
        <h2>ToDo Lists</h2>
        <div>
          <label htmlFor="priority-selector">Filter Priority</label>
          <select
            id="priority-selector"
            onChange={handleChangePriorityFilter}
            value={minPriority}
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="Z">All</option>
          </select>
        </div>
      </div>
      <div className="todo-lists">
        {todoTags.map((tag) => (
          <section key={tag}>
            <h3>{tag}</h3>
            <TodoList todos={todoLists[tag]} onChange={handleChange} />
          </section>
        ))}
      </div>
    </div>
  );
};
// <TodoList todos={todoLists[tag]} onChange={this.update.bind(this)} />,
