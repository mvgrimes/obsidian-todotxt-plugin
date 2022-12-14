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
    <div>
      {sorted?.map((todo) => (
        <div
          className={cn(
            'my-2 mx-2',
            todo.completed ? 'todo-completed' : 'todo-not-completed',
          )}
          key={todo.id}
        >
          <label htmlFor={`todo-${todo.id}`} className="flex items-start">
            <div className="mt-0.5">
              <input
                type="checkbox"
                checked={todo.completed}
                id={`todo-${todo.id}`}
                onChange={() => handleChange(todo.id)}
              />
            </div>
            <span
              className={cn(
                'mr-1 rounded-lg my-0.5 px-1.5 py-0.5 text-xs',
                todo.priority === 'A'
                  ? 'text-red-700 bg-red-300'
                  : todo.priority === 'B'
                  ? 'text-amber-600 bg-orange-300'
                  : todo.priority === 'C'
                  ? 'text-sky-600 bg-blue-300'
                  : '',
              )}
            >
              {todo.priority}
            </span>
            {/* <span>{todo.completedDate}</span> */}
            {/* <span>{todo.createDate}</span> */}
            <span>
              <span
                className={cn(
                  todo.completed
                    ? 'line-through text-gray-400'
                    : 'text-gray-200',
                )}
              >
                {todo.description}
              </span>
              {todo.tags
                .filter((tag) => tag !== props.tag)
                .map((tag) => (
                  <span
                    className="text-sm ml-2 rounded-full py-0.5 px-1 text-gray-700 bg-blue-200"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              {todo.ctx.map((ctx) => (
                <span
                  className="text-xs ml-2 rounded-full py-0.5 px-1 text-gray-700 bg-indigo-200"
                  key={ctx}
                >
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
