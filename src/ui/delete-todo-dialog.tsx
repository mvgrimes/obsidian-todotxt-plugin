import * as React from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';

interface DeleteTodoProps {
  onDelete: (t: boolean) => void;
}

export const DeleteTodoDialog = (props: DeleteTodoProps) => {
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
    <div onKeyUp={(e) => e.stopPropagation()}>
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
