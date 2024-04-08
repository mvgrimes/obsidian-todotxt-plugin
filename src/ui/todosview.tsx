import * as React from 'react';
import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Todo } from '../lib/todo';
import { TodosList } from './todoslist';
import PlusIcon from './icon/plus';
import XMarkIcon from './icon/x-mark';
import MagnifyingGlassIcon from './icon/magnifying-glass';
import { EditTodoDialog } from './edit-todo-dialog';
import { DeleteTodoDialog } from './delete-todo-dialog';
import { CreateTodoDialog } from './create-todo-dialog';

type TodosViewProps = {
  todos: Todo[];
  onChange: (t: Todo[]) => void;
  defaultPriorityFilter: string;
  defaultOrganizeBy: 'project' | 'context';
  preservePriority: boolean;
  recurringTasks: boolean;
  onNavigate: (url: string, newTab: boolean) => void;
};
type OrganizeBy = 'project' | 'context';

export const TodosView = (props: TodosViewProps) => {
  const [filter, setFilter] = useState('' as string);
  const [minPriority, setMinPriority] = useState(props.defaultPriorityFilter);
  const [confirmCreate, setConfirmCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Todo | null>(null);
  const [confirmEdit, setConfirmEdit] = useState<Todo | null>(null);
  const [organizeBy, setOrganizeBy] = useState<OrganizeBy>(
    props.defaultOrganizeBy,
  );

  // Get all the projects/ctx, plus add a Default tag for untagged todos
  const todoTags =
    organizeBy === 'project'
      ? [
          '+Default',
          ...uniq(props.todos.flatMap((todo) => todo.projects).sort(cmp)),
        ]
      : [
          '@Default',
          ...uniq(props.todos.flatMap((todo) => todo.ctx).sort(cmp)),
        ];

  // Create a list of each tag...
  const todoLists = Object.fromEntries(
    todoTags.map((tag) => [tag, [] as Todo[]]),
  );

  const todos =
    filter === ''
      ? props.todos
      : props.todos.filter((todo) =>
          todo.description.toLowerCase().includes(filter.toLowerCase()),
        );

  // ... and populate them
  todos.forEach((todo) => {
    if ((todo.priority || 'Z') > minPriority) return;

    if (organizeBy === 'project') {
      if (todo.projects.length > 0) {
        uniq(todo.projects).forEach((tag) => {
          todoLists[tag] ||= [];
          todoLists[tag].push(todo);
        });
      } else {
        todoLists['+Default'] ||= [];
        todoLists['+Default'].push(todo);
      }
    } else {
      if (todo.ctx.length > 0) {
        uniq(todo.ctx).forEach((ctx) => {
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

  // Organize by:
  const handleOrganizeBy = (e: FormEvent<HTMLSelectElement>) => {
    setOrganizeBy(e.currentTarget.value === 'project' ? 'project' : 'context');
  };

  // Todo CrUD:
  const handleCompleteToggle = (t: Todo) => {
    const newTodos = [...props.todos];
    const todo = newTodos.find((todo) => todo.id === t.id) as Todo;
    if (!todo) return;

    if (!todo.completed) {
      todo.complete(props.preservePriority);
      if (props.recurringTasks) {
        const nextRecurring = todo.recurring(newTodos.length);
        if (nextRecurring) newTodos.push(nextRecurring);
      }
    } else {
      todo.uncomplete(props.preservePriority);
    }

    if (props.onChange) props.onChange(newTodos);
  };
  const handleDelete = (t: boolean) => {
    if (t) {
      const newTodos = todos.filter((todo) => todo.id !== confirmDelete?.id);
      if (todos.length !== newTodos.length && props.onChange)
        props.onChange(newTodos);
    }
    setConfirmDelete(null);
  };
  const handleEdit = (todoText: string | null) => {
    if (confirmEdit && todoText !== null && todoText !== '') {
      const newTodo = Todo.parse(todoText, confirmEdit.id);
      const newTodos = todos.map((todo) =>
        todo.id === confirmEdit.id ? newTodo : todo,
      );
      if (props.onChange) props.onChange(newTodos);
    }
    setConfirmEdit(null);
  };
  const handleAdd = (todoText: string | null) => {
    if (todoText !== null && todoText !== '') {
      // Parse the todo
      const todo = Todo.parse(todoText, todos.length);
      todo.createDate = new Date().toISOString().substring(0, 10);
      // Add the new todo to the todoList
      const newTodos = [...todos, todo];
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

  // Filter the todo list
  const handleFilter = (e: FormEvent<HTMLInputElement>) =>
    setFilter(e.currentTarget.value || '');
  const handleClear = () => setFilter('');

  // Display the dialog
  const handleShowCreate = () => setConfirmCreate(true);
  const handleShowEdit = (t: Todo | null) => setConfirmEdit(t);
  const handleShowDelete = (t: Todo | null) => setConfirmDelete(t);

  return (
    <div id="todotxt" onKeyUp={handleKeyPress}>
      <div className="todo-container">
        <h2 className="">ToDo Lists</h2>
        <div className="todo-controls">
          {/*<label htmlFor="priority-selector">Priority</label>*/}
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
          {/*<label htmlFor="organizeby-selector">Group</label>*/}
          <select
            id="organizeby-selector"
            onChange={handleOrganizeBy}
            value={organizeBy}
          >
            <option value="project">Project</option>
            <option value="context">Context</option>
          </select>
          <div className="todo-filter">
            <input
              type="text"
              placeholder=""
              value={filter}
              onChange={handleFilter}
            />
            <button className="icon-container" onClick={handleClear}>
              {filter === '' ? (
                <MagnifyingGlassIcon className="icon" aria-hidden="true" />
              ) : (
                <XMarkIcon className="icon" aria-hidden="true" />
              )}
            </button>
          </div>
          <button onClick={handleShowCreate}>{/*<PlusIcon />*/}+</button>
        </div>
      </div>
      <div className="todo-list-container">
        {todoTags.map((tag) => (
          <section key={tag}>
            <h3 className="todo-list-header">{tag}</h3>
            <TodosList
              tag={tag}
              todos={todoLists[tag]}
              onCompleteToggle={handleCompleteToggle}
              onDeleteClicked={handleShowDelete}
              onEditClicked={handleShowEdit}
              onNavigate={props.onNavigate}
            />
          </section>
        ))}
      </div>
      {confirmCreate && <CreateTodoDialog onAdd={handleAdd} />}
      {confirmDelete && <DeleteTodoDialog onDelete={handleDelete} />}
      {confirmEdit && (
        <EditTodoDialog
          onEdit={handleEdit}
          todoText={confirmEdit ? confirmEdit.toString() : ''}
        />
      )}
    </div>
  );
};

function uniq<T>(array: T[]) {
  return [...new Set(array)];
}

function cmp(a: string, b: string) {
  return a.localeCompare(b);
}
