// The pattern for a todotxt entry
// See: https://github.com/todotxt/todo.txt
// Examples:
//   x 2020-11-19 2020-11-16 Pay Amex Cash Card Bill (Due Dec 11th) t:2020-11-21 +Home @Bills
//   (B) 2020-11-17 Update Mac systems +Home
const TODO_RE = RegExp(
  '^' +
    '((?<completed>x) )?' +
    '(\\((?<priority>[A-Z])\\) )?' +
    '((?<firstDate>[0-9]{4}-[0-9]{2}-[0-9]{2}) )?' +
    '((?<secondDate>[0-9]{4}-[0-9]{2}-[0-9]{2}) )?' +
    '(?<description>.*?)' +
    '$',
);

export class TodoTag {
  constructor(public key: string, public value: string) {}
  toString() {
    return `${this.key}:${this.value}`;
  }
}

type TodoArgs = {
  id: number;
  line: string;
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

export class Todo {
  id: number;
  line: string;
  completed: boolean;
  completedDate?: string;
  priority: string;
  createDate?: string;
  description: string; // The description w/ tags
  text: string; // The description w/o tags
  projects: string[];
  ctx: string[];
  tags: TodoTag[];

  constructor(args: TodoArgs) {
    this.id = args.id;
    this.line = args.line;
    this.completed = args.completed;
    this.completedDate = args.completedDate;
    this.priority = args.priority;
    this.createDate = args.createDate;
    this.description = args.description;
    this.text = args.text;
    this.projects = args.projects;
    this.ctx = args.ctx;
    this.tags = args.tags;
  }

  static parse(line: string, id: number): Todo {
    const result = TODO_RE.exec(line);
    const groups = result?.groups;
    if (groups) {
      return new Todo({
        id,
        line,
        completed: !!groups.completed,
        priority: groups.priority ?? '',
        createDate: groups.secondDate ?? groups.firstDate,
        completedDate: groups.secondDate ? groups.firstDate : undefined,
        description: groups.description,
        ...extractTags(groups.description),
      });
    } else {
      console.error(`[TodoTxt] setViewData: cannot match todo`, line);
      return new Todo({
        id,
        line,
        completed: false,
        priority: '',
        description: line,
        text: `error parsing: ${line}`,
        projects: [],
        ctx: [],
        tags: [],
      });
    }
  }

  complete() {
    this.completedDate = new Date().toISOString().substring(0, 10);

    // If there is a priority, create a pri: tag to store it
    // TODO: make this configurable
    if (this.priority?.length > 0) {
      const priorityTag = this.tags.find((tag) => tag.key === 'pri');
      if (priorityTag) {
        priorityTag.value = this.priority;
      } else {
        this.tags.push(new TodoTag('pri', this.priority));
      }
    }
  }

  uncomplete() {
    this.completedDate = undefined;

    // If there is a pri:X tag, use that to set the priority then remote all the pri: tags.
    const priorityTag = this.tags.find((tag) => tag.key === 'pri');
    if (priorityTag && priorityTag.value.length === 1) {
      this.priority = priorityTag.value.toUpperCase();
      this.tags = this.tags.filter((tag) => tag.key !== 'pri');
    }
  }

  toString() {
    return [
      this.completed ? 'x' : null,
      this.priority && !this.completed ? `(${this.priority})` : null,
      this.completedDate,
      this.createDate,
      this.text,
      ...this.tags.map((tag) => tag.toString()),
      ...this.projects.map((tag) => tag.toString()),
      ...this.ctx.map((tag) => tag.toString()),
    ]
      .filter((item) => item)
      .join(' ');
  }

  sort(t: Todo) {
    return sortTodo(this, t);
  }
}

export function sortTodo(a: Todo, b: Todo) {
  if (a.completed < b.completed) return -1;
  if (a.completed > b.completed) return 1;
  if ((a.priority || 'X') < (b.priority || 'X')) return -1;
  if ((a.priority || 'X') > (b.priority || 'X')) return 1;
  return a.text.localeCompare(b.text);
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
    return new TodoTag(r[1], r[2]);
  });
}
