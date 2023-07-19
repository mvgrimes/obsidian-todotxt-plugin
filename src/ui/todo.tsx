import * as React from 'react';
import PencilIcon from './icon/pencil';
import TrashIcon from './icon/trash';
import type { TODO } from '../lib/todo';
import cn from '../lib/classNames';

type TodoProps = {
  tag: string;
  todo: TODO;
  onCompleteToggle: (t: TODO) => void;
  onDeleteClicked: (t: TODO) => void;
  onEditClicked: (t: TODO) => void;
  onKeyPressed: (e: React.KeyboardEvent<HTMLInputElement>, t: TODO) => void;
};
export const Todo = (props: TodoProps) => {
  const { todo } = props;

  return (
    <div className="todo">
      <label htmlFor={`todo-${todo.id}`} className="todo-label">
        <input
          type="checkbox"
          checked={todo.completed}
          id={`todo-${todo.id}`}
          onChange={() => props.onCompleteToggle(todo)}
          onKeyUp={(e) => props.onKeyPressed(e, todo)}
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
            {todo.ctx
              .filter((ctx) => ctx !== props.tag)
              .map((ctx) => (
                <span className="todo-ctx" key={ctx}>
                  {ctx}
                </span>
              ))}
          </span>
          <span className="todo-actions">
            <button className="clickable-icon" onClick={() => props.onEditClicked(todo)}>
              <PencilIcon className="" />
            </button>
            <button
              className="clickable-icon"
              onClick={() => props.onDeleteClicked(todo)}
            >
              <TrashIcon className="" />
            </button>
          </span>
        </span>
      </label>
    </div>
  );
};
