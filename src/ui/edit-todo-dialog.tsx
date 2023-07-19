import React, {
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';

interface EditTodoProps {
  onEdit: (todoText: string | null) => void;
  todoText: string;
}

export const EditTodoDialog = (props: EditTodoProps) => {
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
    <div onKeyUp={(e) => e.stopPropagation()}>
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
