export type Todo = {
  id: number;
  completed: boolean;
  completedDate?: string;
  priority: string;
  createDate?: string;
  description: string; // The description w/ tags
  text: string; // The description w/o tags
  projects: string[];
  ctx: string[];
  tags: TodoTag[];
};

export type TodoTag = {
  key: string;
  value: string;
};

// x 2020-11-19 2020-11-16 Pay Amex Cash Card Bill (Due Dec 11th) t:2020-11-21 +Home @Bills
// (B) 2020-11-17 Update Mac systems +Home
const TODO_RE = RegExp(
  '^' +
    '((?<completed>x) )?' +
    '(\\((?<priority>[A-Z])\\) )?' +
    '((?<firstDate>[0-9]{4}-[0-9]{2}-[0-9]{2}) )?' +
    '((?<secondDate>[0-9]{4}-[0-9]{2}-[0-9]{2}) )?' +
    '(?<description>.*?)' +
    '$',
);

export function parseTodo(line: string, id: number): Todo {
  const result = TODO_RE.exec(line);
  const groups = result?.groups;
  if (groups) {
    return {
      id,
      completed: !!groups.completed,
      priority: groups.priority ?? '',
      createDate: groups.secondDate ?? groups.firstDate,
      completedDate: groups.secondDate ? groups.firstDate : undefined,
      description: groups.description,
      ...extractTags(groups.description),
    };
  } else {
    console.error(`[TodoTxt] setViewData: cannot match todo`, line);
    return {
      id,
      completed: false,
      priority: '',
      description: line,
      text: `error parsing: ${line}`,
      projects: [],
      ctx: [],
      tags: [],
    };
  }
}

function extractTags(description: string) {
  // Don't use \w here for better unicode support
  // Per the todo.txt spec (https://github.com/todotxt/todo.txt), context/projects are preceded by a space
  return {
    projects: matchAll(description, /(?<=\s)\+\S+/g),
    ctx: matchAll(description, /(?<=\s)@\S+/g),
    tags: matchTags(description),
    text: description.replace(/\s+([@+]|\S+:)\S+/g, ''),
  };
}

function matchAll(s: string, re: RegExp) {
  const results = [...s.matchAll(re)];
  return results.map((r) => r[0]);
}

function matchTags(s: string) {
  const results = [...s.matchAll(/(?<=\s)(\S+):(\S+)/g)];
  return results.map((r) => {
    return { key: r[1], value: r[2] };
  });
}

export function stringifyTodo(todo: Todo) {
  return [
    todo.completed ? 'x' : null,
    todo.priority && !todo.completed ? `(${todo.priority})` : null,
    todo.completedDate,
    todo.createDate,
    todo.description,
    todo.priority && todo.completed ? `pri:${todo.priority}` : null,
  ]
    .filter((item) => item)
    .join(' ');
}

export function sortTodo(a: Todo, b: Todo) {
  if (a.completed < b.completed) return -1;
  if (a.completed > b.completed) return 1;
  if ((a.priority || 'X') < (b.priority || 'X')) return -1;
  if ((a.priority || 'X') > (b.priority || 'X')) return 1;
  return a.text.localeCompare(b.text);
}
