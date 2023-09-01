import { jest, describe, beforeAll, test, expect } from '@jest/globals';
import { Todo } from '../src/lib/todo';

describe('todo', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-09-01'));
  });

  test('strict rec with threshold', () => {
    const todo = Todo.parse('Task rec:+1w due:2023-09-05 t:2023-09-03', 1);

    const nextRecurring = todo.recurring(0);
    expect(nextRecurring).toBeTruthy();
    if (!nextRecurring) return;

    expect(nextRecurring.getTag('due')?.value).toBe('2023-09-12');
    expect(nextRecurring.getTag('t')?.value).toBe('2023-09-10');
  });

  test('strict rec w/o due date', () => {
    const todo = Todo.parse('Task rec:+1w t:2023-08-30', 1);

    const nextRecurring = todo.recurring(0);
    expect(nextRecurring).toBeTruthy();
    if (!nextRecurring) return;

    expect(nextRecurring.getTag('due')?.value).toBe('2023-09-07');
    expect(nextRecurring.getTag('t')?.value).toBe('2023-09-05');
  });

  test('non-strict rec w/ due date', () => {
    const todo = Todo.parse('Task rec:1w due:2023-09-05 t:2023-09-03', 1);

    const nextRecurring = todo.recurring(0);
    expect(nextRecurring).toBeTruthy();
    if (!nextRecurring) return;

    expect(nextRecurring.getTag('due')?.value).toBe('2023-09-07');
    expect(nextRecurring.getTag('t')?.value).toBe('2023-09-05');
  });
});
