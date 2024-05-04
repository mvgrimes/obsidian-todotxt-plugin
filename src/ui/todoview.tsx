import * as React from 'react';
import PencilIcon from './icon/pencil';
import TrashIcon from './icon/trash';
import {
  TodoWord,
  Todo,
  TodoCtx,
  TodoDescription,
  TodoExternalLink,
  TodoInternalLink,
  TodoProject,
  TodoTag,
} from '../lib/todo';
import useLongPress from '../lib/useLongPress';
import cn from '../lib/classNames';

type TodoViewProps = {
  tag: string;
  todo: Todo;
  onCompleteToggle: (t: Todo) => void;
  onDeleteClicked: (t: Todo) => void;
  onEditClicked: (t: Todo) => void;
  onKeyPressed: (e: React.KeyboardEvent<HTMLInputElement>, t: Todo) => void;
  onNavigate: (url: string, newTab: boolean) => void;
};
export const TodoView = (props: TodoViewProps) => {
  const { todo } = props;
  const longPressProps = useLongPress(
    () => props.onEditClicked(todo),
    () => {},
    { delay: 500 },
  );

  return (
    <div className="todo">
      <input
        type="checkbox"
        checked={todo.completed}
        id={`todo-${todo.id}`}
        onKeyUp={(e) => props.onKeyPressed(e, todo)}
        onChange={() => props.onCompleteToggle(todo)}
      />
      {/* We can't use <label htmlFor={`todo-${todo.id}`}> here because it will cause the onCompleteToggle to fire twice */}
      <div className="todo-label" {...longPressProps}>
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
          <span
            className={cn(
              todo.completed ? 'todo-completed' : '',
              todo.preThreshold() ? 'todo-prethreshold' : '',
            )}
          >
            <TodoDescriptionView
              description={todo.description}
              onNavigate={props.onNavigate}
              group={props.tag}
            />
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
      </div>
    </div>
  );
};

const TodoTagView = ({ tag }: { tag: TodoTag }) => {
  const TODAY = new Date().toISOString();
  const SOON = new Date(Date.now() + 24 * 60 * 60 * 1000 * 3).toISOString(); // Three days
  const classes = ['todo-tag'];

  // Highlight late or pending tasks
  if (tag.tag === 'due') {
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
      {tag.tag}:{tag.value}
    </span>
  );
};

const TodoProjectView = ({ project }: { project: TodoProject }) => {
  return <span className="todo-project">{project.project}</span>;
};

const TodoContextView = ({ ctx }: { ctx: TodoCtx }) => {
  return <span className="todo-ctx">{ctx.ctx}</span>;
};

const TodoInternalLinkView = ({
  link,
  onNavigate,
}: {
  link: TodoInternalLink;
  onNavigate: (url: string, newTab: boolean) => void;
}) => {
  return (
    <>
      <a
        onClick={(e) => {
          e.preventDefault();
          onNavigate(link.title, true);
        }}
      >
        {link.title}
      </a>{' '}
    </>
  );
};

const TodoExternalLinkView = ({
  link,
  onNavigate,
}: {
  link: TodoExternalLink;
  onNavigate: (url: string, newTab: boolean) => void;
}) => {
  return (
    <>
      <a href={link.url}>{link.title}</a>{' '}
    </>
  );
};

// {todo.projects
//   .filter((tag) => tag !== props.tag)
//   .map((tag, i) => (
//     <span className="todo-project" key={tag + i}>
//       {tag}
//     </span>
//   ))}
// {todo.ctx
//   .filter((ctx) => ctx !== props.tag)
//   .map((ctx, i) => (
//     <span className="todo-ctx" key={ctx + i}>
//       {ctx}
//     </span>
//   ))}

const TodoDescriptionView = ({
  description,
  onNavigate,
  group,
}: {
  description: TodoDescription;
  onNavigate: (url: string, newTab: boolean) => void;
  group: string;
}) => {
  return (
    <span>
      {description.map((item, i) => {
        if (item instanceof TodoWord) return <span key={i}>{item.word} </span>;
        if (item instanceof TodoTag) return <TodoTagView key={i} tag={item} />;
        if (item instanceof TodoProject && item.project !== group)
          return <TodoProjectView key={i} project={item} />;
        if (item instanceof TodoCtx && item.ctx !== group)
          return <TodoContextView key={i} ctx={item} />;
        if (item instanceof TodoInternalLink)
          return (
            <TodoInternalLinkView key={i} link={item} onNavigate={onNavigate} />
          );
        if (item instanceof TodoExternalLink)
          return (
            <TodoExternalLinkView key={i} link={item} onNavigate={onNavigate} />
          );
        return null;
      })}
    </span>
  );
};
