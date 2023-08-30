export type TODO = {
  id: number;
  completed: boolean;
  completedDate?: string;
  priority: string;
  createDate?: string;
  description: string;
  projects: string[];
  ctx: string[];
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

export function parseTodo(line: string, id: number): TODO {
  const result = TODO_RE.exec(line);
  const groups = result?.groups;
  if (groups) {
    return {
      id,
      completed: !!groups.completed,
      priority: groups.priority ?? '',
      createDate: groups.secondDate ?? groups.firstDate,
      completedDate: groups.secondDate ? groups.firstDate : undefined,
      ...extractTags(groups.description),
    };
  } else {
    console.error(`[TodoTxt] setViewData: cannot match todo`, line);
    return {
      id,
      completed: false,
      priority: '',
      description: `not parsed: ${line}`,
      projects: [],
      ctx: [],
    };
  }
}

function extractTags(description: string) {
  // Don't use \w here for better unicode support
  // Per the todo.txt spec (https://github.com/todotxt/todo.txt), context/projects are preceded by a space
  return {
    projects: matchAll(description, /(?<=\s)\+\S+/g),
    ctx: matchAll(description, /(?<=\s)@\S+/g),
    description: description.replace(/\s+[@+]\S+/g, ''),
  };
}

function matchAll(s: string, re: RegExp) {
  const results = [...s.matchAll(re)];
  return results.map((r) => r[0]);
}

export function stringifyTodo(todo: TODO) {
  return [
    todo.completed ? 'x' : null,
    todo.priority && !todo.completed ? `(${todo.priority})` : null,
    todo.completedDate,
    todo.createDate,
    todo.description,
    todo.priority && todo.completed ? `pri:${todo.priority}` : null,
    ...todo.projects,
    ...todo.ctx,
  ]
    .filter((item) => item)
    .join(' ');
}

export function sortTodo(a: TODO, b: TODO) {
  if (a.completed < b.completed) return -1;
  if (a.completed > b.completed) return 1;
  if ((a.priority || 'X') < (b.priority || 'X')) return -1;
  if ((a.priority || 'X') > (b.priority || 'X')) return 1;
  return a.description.localeCompare(b.description);
}
