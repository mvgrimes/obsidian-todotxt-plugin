import { createContext } from 'react';
import type { TODO } from './view';

export const TodoContext = createContext<TODO[]>([]);
