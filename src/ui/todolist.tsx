import * as React from "react";
import { useTodos } from "../lib/useTodos";
import cn from "../lib/classNames";

export const TodoListView = () => {
  const todos = useTodos();

  return (
    <div className="todos">
      <h4>Hello, React!</h4>
      {todos?.map((todo, i: number) => (
        <div
          className={cn(
            todo.priority === "A"
              ? "todo-priority-a"
              : todo.priority === "B"
              ? "todo-priority-b"
              : todo.priority === "C"
              ? "todo-priority-c"
              : "",
            todo.completed ? "todo-completed" : "todo-not-completed"
          )}
          key={i}
        >
          <input type="checkbox" checked={todo.completed} id={`todo-${i}`} />
          <label htmlFor={`todo-${i}`}>
            <span className="todo-priority">{todo.priority}</span>
            <span className="todo-description">{todo.description}</span>
          </label>
        </div>
      ))}
    </div>
  );
};
