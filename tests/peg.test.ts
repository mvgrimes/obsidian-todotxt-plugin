import { jest, describe, beforeAll, it, expect } from '@jest/globals';
import parser from '../src/lib/parser';

function p(text: string) {
  return parser.parse(text);
}

describe('todo', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-09-01'));
  });

  it('just description', () => {
    expect(p('Test parser')).toEqual({
      completed: null,
      priority: null,
      firstDate: null,
      secondDate: null,
      description: ['Test', 'parser'],
    });
  });

  it('with priority', () => {
    expect(p('(A) Test parser')).toEqual({
      completed: null,
      priority: 'A',
      firstDate: null,
      secondDate: null,
      description: ['Test', 'parser'],
    });
  });

  it('with priority and date', () => {
    expect(p('(A) 2023-11-01 Test parser')).toEqual({
      completed: null,
      priority: 'A',
      firstDate: '2023-11-01',
      secondDate: null,
      description: ['Test', 'parser'],
    });
  });

  it('with completed', () => {
    expect(p('x Test parser')).toEqual({
      completed: 'x',
      priority: null,
      firstDate: null,
      secondDate: null,
      description: ['Test', 'parser'],
    });
  });

  it('with completed and date', () => {
    expect(p('x 2023-12-01 Test parser')).toEqual({
      completed: 'x',
      priority: null,
      firstDate: '2023-12-01',
      secondDate: null,
      description: ['Test', 'parser'],
    });
  });

  it('with completed and two dates', () => {
    expect(p('x 2023-12-01 2023-11-01 Test parser')).toEqual({
      completed: 'x',
      priority: null,
      firstDate: '2023-12-01',
      secondDate: '2023-11-01',
      description: ['Test', 'parser'],
    });
  });

  it('with trialing whitespace', () => {
    expect(p('(A) test ')).toEqual({
      completed: null,
      priority: 'A',
      firstDate: null,
      secondDate: null,
      description: ['test'],
    });
  });
});
