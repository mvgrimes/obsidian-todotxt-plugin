import * as React from 'react';
import PencilIcon from './icon/pencil';
import TrashIcon from './icon/trash';
import type { TODO } from '../lib/todo';
import cn from '../lib/classNames';

const DUE_RE = RegExp('due:([0-9]{4}-[0-9]{2}-[0-9]{2})');

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
  const TODAY = new Date().toISOString();
  const SOON = new Date(Date.now() + 24 * 60 * 60 * 1000 * 3).toISOString(); // Three days
  console.log(SOON);

  const description = todo.description.split(/\s+/).map((c, i) => {
    const match = c.match(DUE_RE);
    if (match) {
      if (match[1] > SOON) {
        return (
          <>
            <span className="todo-due-soon" key={i}>
              {c}
            </span>{' '}
          </>
        );
      } else if (match[1] > TODAY) {
        return (
          <>
            <span className="todo-due" key={i}>
              {c}
            </span>{' '}
          </>
        );
      } else {
        return (
          <>
            <span className="todo-due-past" key={i}>
              {c}
            </span>{' '}
          </>
        );
      }
    }
    return (
      <>
        <span key={i}>{c}</span>{' '}
      </>
    );
  });

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
            <span
              className={cn(
                todo.completed ? 'todo-completed' : '',
                'todo-text',
              )}
            >
              {description}
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
            <button
              className="clickable-icon"
              onClick={() => props.onEditClicked(todo)}
            >
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
