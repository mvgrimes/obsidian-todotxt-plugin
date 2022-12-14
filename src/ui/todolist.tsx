import * as React from 'react';
import type { TODO } from '../lib/todo';
import cn from '../lib/classNames';

type TodoListProps = {
  tag: string;
  todos: TODO[];
  onChange: (id: number) => void;
};
export const TodoList = (props: TodoListProps) => {
  console.log(`TodoListView: `, { todos: props.todos });
  const sorted = [...props.todos].sort(sortTodo);

  const handleChange = (id: number) => {
    if (props.onChange) props.onChange(id);
  };

  return (
    <div className="todos">
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
          <label htmlFor={`todo-${todo.id}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              id={`todo-${todo.id}`}
              onChange={() => handleChange(todo.id)}
            />
            <span className="todo-priority">{todo.priority}</span>
            {/* <span className="todo-completedDate">{todo.completedDate}</span> */}
            {/* <span className="todo-createdDate">{todo.createDate}</span> */}
            <span>
              <span className="todo-description">{todo.description}</span>
              {todo.tags
                .filter((tag) => tag !== props.tag)
                .map((tag) => (
                  <span className="todo-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              {todo.ctx.map((ctx) => (
                <span className="todo-ctx" key={ctx}>
                  {ctx}
                </span>
              ))}
            </span>
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
