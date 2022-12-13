import { useContext } from 'react';
import { TodoContext } from './todoContext';
import type { TODO } from '../view';

export const useTodos = (): TODO[] | undefined => {
  return useContext(TodoContext);
};
