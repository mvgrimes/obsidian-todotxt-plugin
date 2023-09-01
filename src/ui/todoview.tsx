import * as React from 'react';
import PencilIcon from './icon/pencil';
import TrashIcon from './icon/trash';
import type { Todo, TodoTag } from '../lib/todo';
import cn from '../lib/classNames';

type TodoViewProps = {
  tag: string;
  todo: Todo;
  onCompleteToggle: (t: Todo) => void;
  onDeleteClicked: (t: Todo) => void;
  onEditClicked: (t: Todo) => void;
  onKeyPressed: (e: React.KeyboardEvent<HTMLInputElement>, t: Todo) => void;
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
                todo.preThreshold() ? 'todo-prethreshold' : '',
              )}
            >
              {todo.description}
            </span>
            {todo.tags.map((tag, i) => (
              <TodoTagView tag={tag} key={i} />
            ))}
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

const TodoTagView = ({ tag }: { tag: TodoTag }) => {
  const TODAY = new Date().toISOString();
  const SOON = new Date(Date.now() + 24 * 60 * 60 * 1000 * 3).toISOString(); // Three days
  const classes = ['todo-tag'];

  // Highlight late or pending tasks
  if (tag.key === 'due') {
    const due = tag.value;
    if (due > SOON) {
      classes.push('todo-due');
    } else if (due > TODAY) {
      classes.push('todo-due-soon');
    } else {
      classes.push('todo-due-past');
    }
  }

  return (
    <span className={classes.join(' ')}>
      {tag.key}:{tag.value}
    </span>
  );
};
