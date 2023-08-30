import * as React from 'react';
import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { parseTodo, stringifyTodo, type TODO } from '../lib/todo';
import { TodoList } from './todolist';
import { EditTodoDialog } from './edit-todo-dialog';
import { DeleteTodoDialog } from './delete-todo-dialog';
import { CreateTodoDialog } from './create-todo-dialog';

type TodosViewProps = {
  defaultPriorityFilter: string;
  defaultOrganizeBy: 'project' | 'context';
  todos: TODO[];
  onChange: (t: TODO[]) => void;
};
type OrganizeBy = 'project' | 'context';

export const TodosView = (props: TodosViewProps) => {
  const [minPriority, setMinPriority] = useState(props.defaultPriorityFilter);
  const [confirmCreate, setConfirmCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<TODO | null>(null);
  const [confirmEdit, setConfirmEdit] = useState<TODO | null>(null);
  const [organizeBy, setOrganizeBy] = useState<OrganizeBy>(
    props.defaultOrganizeBy,
  );

  // Get all the tags, plus add a +Default tag for untagged todos
  const todoTags =
    organizeBy === 'project'
      ? [
          '+Default',
          ...props.todos
            .flatMap((todo) => todo.tags)
            .sort()
            .unique(),
        ]
      : [
          '@Default',
          ...props.todos
            .flatMap((todo) => todo.ctx)
            .sort()
            .unique(),
        ];

  // Create a list of each tag...
  const todoLists = Object.fromEntries(
    todoTags.map((tag) => [tag, [] as TODO[]]),
  );

  // ... and populate them
  props.todos.forEach((todo) => {
    if ((todo.priority || 'Z') > minPriority) return;

    if (organizeBy === 'project') {
      if (todo.tags.length > 0) {
        todo.tags.unique().forEach((tag) => {
          todoLists[tag] ||= [];
          todoLists[tag].push(todo);
        });
      } else {
        todoLists['+Default'] ||= [];
        todoLists['+Default'].push(todo);
      }
    } else {
      if (todo.ctx.length > 0) {
        todo.ctx.unique().forEach((ctx) => {
          todoLists[ctx] ||= [];
          todoLists[ctx].push(todo);
        });
      } else {
        todoLists['@Default'] ||= [];
        todoLists['@Default'].push(todo);
      }
    }
  });

  // List filters:
  const handleChangePriorityFilter = (e: FormEvent<HTMLSelectElement>) => {
    setMinPriority(e.currentTarget.value);
  };

  // Organize by
  const handleOrganizeBy = (e: FormEvent<HTMLSelectElement>) => {
    setOrganizeBy(e.currentTarget.value === 'project' ? 'project' : 'context');
  };

  // Todo CrUD:
  const handleCompleteToggle = (t: TODO) => {
    const newTodos = [...props.todos];
    const todo = newTodos.find((todo) => todo.id === t.id) as TODO;
    todo.completed = !todo?.completed;
    if (todo.completed) {
      todo.completedDate = new Date().toISOString().substring(0, 10);
    } else {
      todo.completedDate = undefined;
    }
    if (props.onChange) props.onChange(newTodos);
  };
  const handleDelete = (t: boolean) => {
    if (t) {
      const newTodos = props.todos.filter(
        (todo) => todo.id !== confirmDelete?.id,
      );
      if (props.todos.length !== newTodos.length && props.onChange)
        props.onChange(newTodos);
    }
    setConfirmDelete(null);
  };
  const handleEdit = (todoText: string | null) => {
    if (confirmEdit && todoText !== null && todoText !== '') {
      const newTodo = parseTodo(todoText, confirmEdit.id);
      const newTodos = props.todos.map((todo) =>
        todo.id === confirmEdit.id ? newTodo : todo,
      );
      if (props.onChange) props.onChange(newTodos);
    }
    setConfirmEdit(null);
  };
  const handleAdd = (todoText: string | null) => {
    if (todoText !== null && todoText !== '') {
      // Parse the todo
      const todo = parseTodo(todoText, props.todos.length);
      todo.createDate = new Date().toISOString().substring(0, 10);
      // Add the new todo to the todoList
      const newTodos = [...props.todos, todo];
      if (props.onChange) props.onChange(newTodos);
    }
    setConfirmCreate(false);
  };

  // Keyboard shortcuts/navigation
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'n') {
      handleShowCreate();
      e.preventDefault();
    } else if (e.key === 'p') {
      e.preventDefault();
    }
  };

  // Display the dialog
  const handleShowCreate = () => setConfirmCreate(true);
  const handleShowEdit = (t: TODO | null) => setConfirmEdit(t);
  const handleShowDelete = (t: TODO | null) => setConfirmDelete(t);

  return (
    <div id="todotxt" onKeyUp={handleKeyPress}>
      <div className="todo-container">
        <h2 className="">ToDo Lists</h2>
        <div className="todo-controls">
          <label htmlFor="priority-selector">Filter Priority</label>
          <select
            id="priority-selector"
            onChange={handleChangePriorityFilter}
            value={minPriority}
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="Z">All</option>
          </select>
          <label htmlFor="organizeby-selector">View By</label>
          <select
            id="organizeby-selector"
            onChange={handleOrganizeBy}
            value={organizeBy}
          >
            <option value="project">Project</option>
            <option value="context">Context</option>
          </select>
          <button onClick={handleShowCreate}>New ToDo</button>
        </div>
      </div>
      <div className="todo-list-container">
        {todoTags.map((tag) => (
          <section key={tag}>
            <h3 className="todo-list-header">{tag}</h3>
            <TodoList
              tag={tag}
              todos={todoLists[tag]}
              onCompleteToggle={handleCompleteToggle}
              onDeleteClicked={handleShowDelete}
              onEditClicked={handleShowEdit}
            />
          </section>
        ))}
      </div>
      {confirmCreate && <CreateTodoDialog onAdd={handleAdd} />}
      {confirmDelete && <DeleteTodoDialog onDelete={handleDelete} />}
      {confirmEdit && (
        <EditTodoDialog
          onEdit={handleEdit}
          todoText={confirmEdit ? stringifyTodo(confirmEdit) : ''}
        />
      )}
    </div>
  );
};
