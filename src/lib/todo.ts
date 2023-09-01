import { DateTime, Duration } from 'luxon';

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
  clone() {
    return new TodoTag(this.key, this.value);
  }
  toString() {
    return `${this.key}:${this.value}`;
  }
}

type TodoArgs = {
  id: number;
  completed: boolean;
  completedDate?: string;
  priority: string;
  createDate?: string;
  description: string; // The description w/o tags
  projects: string[];
  ctx: string[];
  tags: TodoTag[];
};

export class Todo {
  id: number;
  completed: boolean;
  completedDate?: string;
  priority: string;
  createDate?: string;
  description: string;
  projects: string[];
  ctx: string[];
  tags: TodoTag[];

  constructor(args: TodoArgs) {
    this.id = args.id;
    this.completed = args.completed;
    this.completedDate = args.completedDate;
    this.priority = args.priority;
    this.createDate = args.createDate;
    this.description = args.description;
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
        completed: !!groups.completed,
        priority: groups.priority ?? '',
        createDate: groups.secondDate ?? groups.firstDate,
        completedDate: groups.secondDate ? groups.firstDate : undefined,
        ...extractTags(groups.description),
      });
    } else {
      console.error(`[TodoTxt] setViewData: cannot match todo`, line);
      return new Todo({
        id,
        completed: false,
        priority: '',
        description: `error parsing: ${line}`,
        projects: [],
        ctx: [],
        tags: [],
      });
    }
  }

  complete(preservePriority: boolean) {
    this.completed = true;
    this.completedDate = new Date().toISOString().substring(0, 10);

    if (preservePriority) {
      // If there is a priority, create a pri: tag to store it
      if (this.priority?.length > 0) {
        this.setTag('pri', this.priority);
      }
    }
  }

  uncomplete(preservePriority: boolean) {
    this.completed = false;
    this.completedDate = undefined;

    if (preservePriority) {
      // If there is a pri:X tag, use that to set the priority then remove all the pri: tags.
      const priorityTag = this.getTag('pri');
      if (priorityTag && priorityTag.value.length === 1) {
        this.priority = priorityTag.value.toUpperCase();
        this.tags = this.tags.filter((tag) => tag.key !== 'pri');
      }
    }
  }

  preThreshold() {
    const thresholdTag = this.getTag('t');
    if (!thresholdTag) return false;

    const today = (this.completedDate = new Date()
      .toISOString()
      .substring(0, 10));
    return thresholdTag.value > today;
  }

  recurring(id: number) {
    const rec = this.getTag('rec');
    if (!rec) return false;

    const recurrance = rec.value.match(/^(\+?)(\d+)([dbwmy]+)$/);
    if (!recurrance) return false; // TODO: notify of a failed recurrance

    const [_, strict, n, datePart] = recurrance;
    const duration = getDuration(+n, datePart);
    if (!duration) return false; // TODO: notify of a failed recurrance

    const newTodo = this.clone(id);
    newTodo.setNextDueDate(!!strict, duration);
    newTodo.setNextThresholdDate(this);
    return newTodo;
  }

  getDueDate() {
    return this.getTagAsDate('due');
  }
  getThresholdDate() {
    return this.getTagAsDate('t');
  }

  getTagAsDate(key: string) {
    const tag = this.getTag(key);
    if (!tag) return;
    return DateTime.fromFormat(tag.value, 'yyyy-MM-dd');
  }

  // moment.js should only be used here (needed for the duration)
  setNextDueDate(strict: boolean, duration: any) {
    let start = DateTime.now();

    if (strict) {
      const currentDueDate = this.getDueDate();
      if (currentDueDate) start = currentDueDate;
      // TODO: notify about failed due date parsing?
    }

    const due = start.plus(duration).toISODate();
    if (!due) return; // TODO: notify failed addition?
    this.setTag('due', due);
  }

  setNextThresholdDate(from: Todo) {
    const thresholdDate = from.getThresholdDate();
    if (!thresholdDate) return;

    const dueDate = from.getDueDate() || DateTime.now();

    const duration = dueDate.diff(thresholdDate);
    const newDueDate = this.getDueDate();
    if (!newDueDate) return; // Should have set the due date already

    const newThreshold = newDueDate.minus(duration).toISODate();
    if (!newThreshold) return; // TODO: notify about failure?
    this.setTag('t', newThreshold);
  }

  // Set an existing tag to the given value. Create the tag if it doesn't exist.
  setTag(key: string, value: string) {
    const existingTag = this.getTag(key);
    if (existingTag) {
      existingTag.value = value;
      return;
    }

    this.tags.push(new TodoTag(key, value));
  }

  getTag(key: string) {
    return this.tags.find((tag) => tag.key === key);
  }

  // Returns a new Todo with:
  // - todays createDate
  // - uncompleted
  // - any pri tags stripped
  clone(id: number) {
    return new Todo({
      id,
      completed: false,
      priority: this.priority,
      createDate: new Date().toISOString().substring(0, 10),
      description: this.description,
      projects: [...this.projects],
      ctx: [...this.ctx],
      tags: [
        ...this.tags
          .filter((tag) => tag.key !== 'pri')
          .map((tag) => tag.clone()),
      ],
    });
  }

  toString() {
    return [
      this.completed ? 'x' : null,
      this.priority && !this.completed ? `(${this.priority})` : null,
      this.completedDate,
      this.createDate,
      this.description,
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
  return a.description.localeCompare(b.description);
}

function extractTags(description: string) {
  // Don't use \w here for better unicode support
  // Per the todo.txt spec (https://github.com/todotxt/todo.txt), context/projects are preceded by a space
  return {
    projects: matchAll(description, /(?<=\s)\+\S+/g),
    ctx: matchAll(description, /(?<=\s)@\S+/g),
    tags: matchTags(description),
    description: description.replace(/\s+([@+]|\S+:)\S+/g, ''),
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

function getDuration(n: number, datePart: string) {
  return datePart === 'd'
    ? Duration.fromObject({ days: n })
    : datePart === 'b'
    ? Duration.fromObject({ days: n })
    : datePart === 'w'
    ? Duration.fromObject({ weeks: n })
    : datePart === 'm'
    ? Duration.fromObject({ months: n })
    : datePart === 'y'
    ? Duration.fromObject({ years: n })
    : null;
}
