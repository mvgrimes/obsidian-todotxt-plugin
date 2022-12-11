import * as React from "react";
import { useApp } from "../useApp";

export const TodoListView = () => {
  const { vault } = useApp();
  console.log({ vault });

  return (
    <div>
      <h4>Hello, React!</h4>
    </div>
  );
  // <p>Len: {todos.length}</p>
};
