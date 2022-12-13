import * as React from 'react';
import type { TODO } from '../view';
import cn from '../lib/classNames';

type TodoListProps = {
  todos: TODO[];
  onChange: (t: TODO[]) => void;
};
export const TodoListView = (props: TodoListProps) => {
  console.log(`TodoListView: `, { todos: props.todos });
  const sorted = [...props.todos].sort(sortTodo);

  const handleClick = (id: number) => {
    const newTodos = [...props.todos];
    const todo = newTodos.find((todo) => todo.id === id) as TODO;
    todo.completed = !todo?.completed;
    if (todo.completed) {
      todo.completedDate = new Date().toISOString().substring(0, 10);
    } else {
      todo.completedDate = undefined;
    }
    if (props.onChange) props.onChange(newTodos);

    return newTodos;
  };

  return (
    <div className="todos">
      <h4>TODO List</h4>
      {sorted?.map((todo) => (
        <div
          className={cn(
            'todo',
            todo.priority === 'A'
              ? 'todo-priority-a'
              : todo.priority === 'B'
              ? 'todo-priority-b'
              : todo.priority === 'C'
              ? 'todo-priority-c'
              : '',
            todo.completed ? 'todo-completed' : 'todo-not-completed',
          )}
          key={todo.id}
        >
          <input
            type="checkbox"
            checked={todo.completed}
            id={`todo-${todo.id}`}
            onChange={() => handleClick(todo.id)}
          />
          <label htmlFor={`todo-${todo.id}`}>
            <span className="todo-priority">{todo.priority}</span>
            {/* <span className="todo-completedDate">{todo.completedDate}</span> */}
            {/* <span className="todo-createdDate">{todo.createDate}</span> */}
            <span className="todo-description">{todo.description}</span>
            {todo.tags.map((tag) => (
              <span className="todo-tag" key={tag}>
                {tag}
              </span>
            ))}
            {todo.ctx.map((ctx) => (
              <span className="todo-ctx" key={ctx}>
                {ctx}
              </span>
            ))}
          </label>
        </div>
      ))}
    </div>
  );
};

function sortTodo(a: TODO, b: TODO) {
  if (a.completed < b.completed) return -1;
  if (a.completed > b.completed) return 1;
  if ((a.priority || 'X') < (b.priority || 'X')) return -1;
  if ((a.priority || 'X') > (b.priority || 'X')) return 1;
  if (a.description < b.description) return -1;
  if (a.description > b.description) return 1;
  return 0;
}
