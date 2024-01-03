import * as React from 'react';
import { sortTodo, type Todo } from '../lib/todo';
import { TodoView } from './todoview';

type TodosListProps = {
  tag: string;
  todos: Todo[];
  onCompleteToggle: (t: Todo) => void;
  onDeleteClicked: (t: Todo) => void;
  onEditClicked: (t: Todo) => void;
  onNavigate: (url: string, newTab: boolean) => void;
};

export const TodosList = (props: TodosListProps) => {
  const sorted = [...props.todos].sort(sortTodo);

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    t: Todo,
  ) => {
    if (e.key === 'e' || e.key === 'Enter') {
      props.onEditClicked(t);
    } else if (e.key === 'd') {
      props.onDeleteClicked(t);
    }
  };

  return (
    <div className="todo-list">
      {sorted?.map((todo) => (
        <TodoView
          tag={props.tag}
          todo={todo}
          onCompleteToggle={props.onCompleteToggle}
          onDeleteClicked={props.onDeleteClicked}
          onEditClicked={props.onEditClicked}
          onKeyPressed={handleKeyPress}
          onNavigate={props.onNavigate}
          key={todo.id}
        />
      ))}
    </div>
  );
};
