import * as React from 'react';
import {
  useState,
  type FormEvent,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { parseTodo, stringifyTodo, type TODO } from '../lib/todo';
import { TodoList } from './todolist';

type TodosViewProps = {
  todos: TODO[];
  onChange: (t: TODO[]) => void;
};
export const TodosView = (props: TodosViewProps) => {
  const [minPriority, setMinPriority] = useState('B');
  const [confirmCreate, setConfirmCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<TODO | null>(null);
  const [confirmEdit, setConfirmEdit] = useState<TODO | null>(null);
  console.log(`TodosView: `, { todos: props.todos });

  // Get all the tags, plus add a +Default tag for untagged todos
  const todoTags = ['+Default', ...props.todos.flatMap((todo) => todo.tags)]
    .sort()
    .unique();

  // Create a list of each tag...
  const todoLists = Object.fromEntries(
    todoTags.map((tag) => [tag, [] as TODO[]]),
  );

  // ... and populate them
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

  // List filters:
  const handleChangePriorityFilter = (e: FormEvent<HTMLSelectElement>) => {
    setMinPriority(e.currentTarget.value);
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
    console.log(`Create todo: `, todoText);
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

  // Display the dialog
  const handleShowCreate = () => setConfirmCreate(true);
  const handleShowEdit = (t: TODO | null) => setConfirmEdit(t);
  const handleShowDelete = (t: TODO | null) => setConfirmDelete(t);

  return (
    <div id="todotxt">
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
            <option value="Z">All</option>
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

interface CreateTodoProps {
  onAdd: (t: string | null) => void;
}

const CreateTodoDialog = (props: CreateTodoProps) => {
  const [value, setValue] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      props.onAdd(value);
      setValue('');
      e.preventDefault();
    } else if (e.key === 'Escape') {
      props.onAdd(null);
      setValue('');
      e.preventDefault();
    }
  };

  const handleAdd = (e: MouseEvent<HTMLButtonElement>) => {
    props.onAdd(value);
    setValue('');
    e.preventDefault();
  };

  const handleCancel = (e: MouseEvent<HTMLButtonElement>) => {
    props.onAdd(null);
    setValue('');
    e.preventDefault();
  };

  return (
    <div>
      <div className="todo-dialog-bg">
        <div className="todo-dialog">
          <h3 className="todo-dialog-header">Enter a New ToDo:</h3>
          <input
            type="text"
            className="todo-dialog-input"
            autoFocus={true}
            onKeyUp={handleKeyPress}
            onChange={handleChange}
            value={value}
          />
          <div className="todo-dialog-actions">
            <button onClick={handleAdd}>Add</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DeleteTodoProps {
  onDelete: (t: boolean) => void;
}

const DeleteTodoDialog = (props: DeleteTodoProps) => {
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      props.onDelete(false);
    } else if (e.key === 'y') {
      props.onDelete(true);
    } else if (e.key === 'n') {
      props.onDelete(false);
    }
  };

  const handleConfirm = (e: MouseEvent<HTMLButtonElement>) => {
    props.onDelete(true);
    e.preventDefault();
  };

  const handleCancel = (e: MouseEvent<HTMLButtonElement>) => {
    props.onDelete(false);
    e.preventDefault();
  };

  return (
    <div>
      <div className="todo-dialog-bg">
        <div className="todo-dialog" onKeyUp={handleKeyPress}>
          <h3 className="todo-dialog-header">Confirm Delete:</h3>
          <p>Are you sure you want to delete this todo?</p>
          <div className="todo-dialog-actions">
            <button onClick={handleConfirm} autoFocus={true}>
              Confirm
            </button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EditTodoProps {
  onEdit: (todoText: string | null) => void;
  todoText: string;
}

const EditTodoDialog = (props: EditTodoProps) => {
  const [value, setValue] = useState(props.todoText);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      props.onEdit(value !== '' ? value : null);
      setValue('');
      e.preventDefault();
    } else if (e.key === 'Escape') {
      props.onEdit(null);
      setValue('');
      e.preventDefault();
    }
  };
  const handleConfirm = (e: MouseEvent<HTMLButtonElement>) => {
    props.onEdit(value !== '' ? value : null);
    setValue('');
    e.preventDefault();
  };

  const handleCancel = (e: MouseEvent<HTMLButtonElement>) => {
    props.onEdit(null);
    setValue('');
    e.preventDefault();
  };

  return (
    <div>
      <div className="todo-dialog-bg">
        <div className="todo-dialog">
          <h3 className="todo-dialog-header">Edit Todo:</h3>
          <input
            type="text"
            className="todo-dialog-input"
            autoFocus={true}
            onKeyUp={handleKeyPress}
            onChange={handleChange}
            value={value}
          />
          <div className="todo-dialog-actions">
            <button onClick={handleConfirm}>Confirm</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};
