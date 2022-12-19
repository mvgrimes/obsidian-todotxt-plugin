export type TODO = {
  id: number;
  completed: boolean;
  completedDate?: string;
  priority: string;
  createDate?: string;
  description: string;
  tags: string[];
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
      tags: [],
      ctx: [],
    };
  }
}

function extractTags(description: string) {
  return {
    tags: matchAll(description, /\+\w+/g),
    ctx: matchAll(description, /@\w+/g),
    description: description.replace(/ [@+]\w+/g, ''),
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
    ...todo.tags,
    ...todo.ctx,
  ]
    .filter((item) => item)
    .join(' ');
}
