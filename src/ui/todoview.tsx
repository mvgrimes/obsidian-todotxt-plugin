import * as React from 'react';
import PencilIcon from './icon/pencil';
import TrashIcon from './icon/trash';
import type { TODO } from '../lib/todo';
import cn from '../lib/classNames';

const DUE_RE = RegExp('due:([0-9]{4}-[0-9]{2}-[0-9]{2})');

type TodoViewProps = {
  tag: string;
  todo: TODO;
  onCompleteToggle: (t: TODO) => void;
  onDeleteClicked: (t: TODO) => void;
  onEditClicked: (t: TODO) => void;
  onKeyPressed: (e: React.KeyboardEvent<HTMLInputElement>, t: TODO) => void;
};
export const TodoView = (props: TodoViewProps) => {
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
            todo.priority ? `todo-priority-${todo.priority.toLowerCase()}` : '',
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
              <TodoDescription todo={todo} />
            </span>
            {todo.projects
              .filter((tag) => tag !== props.tag)
              .map((tag, i) => (
                <span className="todo-project" key={tag + i}>
                  {tag}
                </span>
              ))}
            {todo.ctx
              .filter((ctx) => ctx !== props.tag)
              .map((ctx, i) => (
                <span className="todo-ctx" key={ctx + i}>
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

const TodoDescription = ({ todo }: { todo: TODO }) => {
  const TODAY = new Date().toISOString();
  const SOON = new Date(Date.now() + 24 * 60 * 60 * 1000 * 3).toISOString(); // Three days

  return (
    <>
      {todo.description.split(/\s+/).map((c, i) => {
        const match = c.match(DUE_RE);
        const due = match ? match[1] : false;

        const className =
          due > SOON
            ? 'todo-due'
            : due > TODAY
            ? 'todo-due-soon'
            : match
            ? 'todo-due-past'
            : '';

        return (
          <React.Fragment key={i}>
            <span className={className}>{c}</span>{' '}
          </React.Fragment>
        );
      })}
    </>
  );
};
