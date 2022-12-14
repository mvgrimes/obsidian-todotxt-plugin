import * as React from 'react';
import {
  useState,
  type FormEvent,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { parseTodo, type TODO } from '../lib/todo';
import { TodoList } from './todolist';

type TodosViewProps = {
  todos: TODO[];
  onChange: (t: TODO[]) => void;
};
export const TodosView = (props: TodosViewProps) => {
  const [minPriority, setMinPriority] = useState('B');
  const [showCreate, setShowCreate] = useState(false);
  console.log(`TodosView: `, { todos: props.todos });

  const todoTags = ['+Default', ...props.todos.flatMap((todo) => todo.tags)]
    .sort()
    .unique();

  const todoLists = Object.fromEntries(
    todoTags.map((tag) => [tag, [] as TODO[]]),
  );

  props.todos.forEach((todo) => {
    if ((todo.priority || 'Z') > minPriority) return;

    if (todo.tags.length > 0) {
      todo.tags.forEach((tag) => {
        todoLists[tag] ||= [];
        todoLists[tag].push(todo);
      });
    } else {
      todoLists['+Default'] ||= [];
      todoLists['+Default'].push(todo);
    }
  });

  const handleChangePriorityFilter = (e: FormEvent<HTMLSelectElement>) => {
    setMinPriority(e.currentTarget.value);
  };

  const handleChange = (id: number) => {
    const newTodos = [...props.todos];
    const todo = newTodos.find((todo) => todo.id === id) as TODO;
    todo.completed = !todo?.completed;
    if (todo.completed) {
      todo.completedDate = new Date().toISOString().substring(0, 10);
    } else {
      todo.completedDate = undefined;
    }
    if (props.onChange) props.onChange(newTodos);
  };

  const handleCreateTodo = () => {
    setShowCreate(true);
  };

  const handleAddTodo = (todoText: string) => {
    console.log(`Create todo: `, todoText);
    setShowCreate(false);

    if (todoText !== '') {
      // Parse the todo
      const todo = parseTodo(todoText, props.todos.length);
      todo.createDate = new Date().toISOString().substring(0, 10);
      // Add the new todo to the todoList
      const newTodos = [...props.todos, todo];
      if (props.onChange) props.onChange(newTodos);
    }
  };

  return (
    <div className="todos-view">
      <div className="todos-view-header">
        <h2>ToDo Lists</h2>
        <div>
          <label htmlFor="priority-selector">Filter Priority</label>
          <select
            id="priority-selector"
            onChange={handleChangePriorityFilter}
            value={minPriority}
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="Z">All</option>
          </select>
          <button onClick={handleCreateTodo}>New ToDo</button>
        </div>
      </div>
      <div className="todo-lists">
        {todoTags.map((tag) => (
          <section key={tag}>
            <h3>{tag}</h3>
            <TodoList
              tag={tag}
              todos={todoLists[tag]}
              onChange={handleChange}
            />
          </section>
        ))}
      </div>
      {showCreate && <CreateTodoView onAdd={handleAddTodo} />}
    </div>
  );
};

interface CreateTodoProps {
  onAdd: (t: string) => void;
}

const CreateTodoView = (props: CreateTodoProps) => {
  const [value, setValue] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      props.onAdd(value);
      setValue('');
      e.preventDefault();
    } else if (e.key === 'Tab') {
      props.onAdd(value);
      setValue('');
      e.preventDefault();
    } else if (e.key === 'Escape') {
      props.onAdd('');
      e.preventDefault();
    }
  };

  return (
    <div className="todo-dialog-bg">
      <div className="todo-dialog-holder">
        <div className="todo-dialog">
          <h3>Enter a New ToDo:</h3>
          <input
            type="text"
            className="todo-create"
            autoFocus={true}
            onKeyUp={handleKeyPress}
            onChange={handleChange}
            value={value}
          />
        </div>
      </div>
    </div>
  );
};
