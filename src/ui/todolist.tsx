import * as React from 'react';
import PencilIcon from './icon/pencil';
import TrashIcon from './icon/trash';
import { sortTodo, type TODO } from '../lib/todo';
import cn from '../lib/classNames';

type TodoListProps = {
  tag: string;
  todos: TODO[];
  onCompleteToggle: (t: TODO) => void;
  onDeleteClicked: (t: TODO) => void;
  onEditClicked: (t: TODO) => void;
};
export const TodoList = (props: TodoListProps) => {
  const sorted = [...props.todos].sort(sortTodo);

  const handleComplete = (t: TODO) => {
    if (props.onCompleteToggle) props.onCompleteToggle(t);
  };

  const handleDelete = (t: TODO) => {
    if (props.onDeleteClicked) props.onDeleteClicked(t);
  };

  const handleEdit = (t: TODO) => {
    if (props.onEditClicked) props.onEditClicked(t);
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    t: TODO,
  ) => {
    if (e.key === 'e' || e.key === 'Enter') {
      handleEdit(t);
    } else if (e.key === 'd') {
      handleDelete(t);
    }
  };

  return (
    <div className="todo-list">
      {sorted?.map((todo) => (
        <div className="todo" key={todo.id}>
          <label htmlFor={`todo-${todo.id}`} className="todo-label">
            <input
              type="checkbox"
              checked={todo.completed}
              id={`todo-${todo.id}`}
              onChange={() => handleComplete(todo)}
              onKeyUp={(e) => handleKeyPress(e, todo)}
            />
            <span
              className={cn(
                'todo-priority',
                todo.priority === 'A'
                  ? 'todo-priority-a'
                  : todo.priority === 'B'
                  ? 'todo-priority-b'
                  : todo.priority === 'C'
                  ? 'todo-priority-c'
                  : '',
              )}
            >
              {todo.priority}
            </span>
            {/* <span>{todo.completedDate}</span> */}
            {/* <span>{todo.createDate}</span> */}
            <span className="todo-description">
              <span>
                <span className={cn(todo.completed ? 'todo-completed' : '')}>
                  {todo.description}
                </span>
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
              <span className="todo-actions">
                <button
                  className="clickable-icon"
                  onClick={() => handleEdit(todo)}
                >
                  <PencilIcon className="" />
                </button>
                <button
                  className="clickable-icon"
                  onClick={() => handleDelete(todo)}
                >
                  <TrashIcon className="" />
                </button>
              </span>
            </span>
          </label>
        </div>
      ))}
    </div>
  );
};
