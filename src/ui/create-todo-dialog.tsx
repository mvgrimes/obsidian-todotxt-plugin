import React, {
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ChangeEvent,
} from 'react';

interface CreateTodoProps {
  onAdd: (t: string | null) => void;
}

export const CreateTodoDialog = (props: CreateTodoProps) => {
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
    <div onKeyUp={(e) => e.stopPropagation()}>
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
