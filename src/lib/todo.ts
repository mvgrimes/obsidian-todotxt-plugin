import { DateTime, Duration } from 'luxon';
import parser from './parser';

// The pattern for a todotxt entry
// See: https://github.com/todotxt/todo.txt
// Examples:
//   x 2020-11-19 2020-11-16 Pay Amex Cash Card Bill (Due Dec 11th) t:2020-11-21 +Home @Bills
//   (B) 2020-11-17 Update Mac systems +Home

export class TodoTag {
  constructor(
    public tag: string,
    public value: string,
  ) {}
  clone() {
    return new TodoTag(this.tag, this.value);
  }
  toString() {
    return `${this.tag}:${this.value}`;
  }
  toHtml() {
    return this.toString();
  }
}

export class TodoCtx {
  constructor(public ctx: string) {}
  clone() {
    return new TodoCtx(this.ctx);
  }
  toString() {
    return `@${this.ctx}`;
  }
  toHtml() {
    return this.toString();
  }
}

export class TodoProject {
  constructor(public project: string) {}
  clone() {
    return new TodoProject(this.project);
  }
  toString() {
    return `+${this.project}`;
  }
  toHtml() {
    return this.toString();
  }
}

export class TodoExternalLink {
  constructor(
    public title: string,
    public url: string,
  ) {}
  clone() {
    return new TodoExternalLink(this.title, this.url);
  }
  toString() {
    return `[${this.title}](${this.url})`;
  }
  toHtml() {
    return `<a href="${this.url}">${this.title}</a>`;
  }
}

export class TodoInternalLink {
  constructor(public title: string) {}
  clone() {
    return new TodoInternalLink(this.title);
  }
  toString() {
    return `[[${this.title}]]`;
  }
  toHtml() {
    return `<a href="${this.title}">${this.title}</a>`;
  }
}

export class TodoWord {
  constructor(public word: string) {}
  clone() {
    return new TodoWord(this.word);
  }
  toString() {
    return `${this.word}`;
  }
  toHtml() {
    return this.toString();
  }
}

export type TodoDescription = (
  | TodoWord
  | TodoProject
  | TodoCtx
  | TodoTag
  | TodoInternalLink
  | TodoExternalLink
)[];

type TodoArgs = {
  id: number;
  completed: boolean;
  completedDate?: string;
  priority: string;
  createDate?: string;
  description: TodoDescription;
};

export class Todo {
  id: number;
  completed: boolean;
  completedDate?: string;
  priority: string;
  createDate?: string;
  description: TodoDescription;

  constructor(args: TodoArgs) {
    this.id = args.id;
    this.completed = args.completed;
    this.completedDate = args.completedDate;
    this.priority = args.priority;
    this.createDate = args.createDate;
    this.description = args.description;
  }

  static parse(line: string, id: number): Todo {
    const data = parser.parse(line);
    // console.error(`[TodoTxt] setViewData: cannot match todo`, line);

    const desc = data.description.map((item: any) => {
      if (typeof item === 'string') {
        return new TodoWord(item);
      }
      if ('project' in item) {
        return new TodoProject(item.project);
      }
      if ('context' in item) {
        return new TodoCtx(item.context);
      }
      if ('tag' in item) {
        return new TodoTag(item.tag, item.value);
      }
      if ('link' in item) {
        return new TodoInternalLink(item.link);
      }
      if ('url' in item) {
        return new TodoExternalLink(item.title, item.url);
      }
      throw new Error(
        `[TodoTxt] todo.parse: unknown item type: ${JSON.stringify(item)})`,
      );
    });

    return new Todo({
      id,
      completed: !!data.completed,
      priority: data.priority ?? '',
      createDate: data.secondDate ?? data.firstDate,
      completedDate: data.secondDate ? data.firstDate : undefined,
      description: desc,
    });
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
        this.description = this.description.filter(
          (item) => !(item instanceof TodoTag && item.tag === 'pri'),
        );
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
    if (newTodo.setNextThresholdDate(this)) {
      // If it is recurring and has a threshold, remove the priority, it will be handled by `todo promote`
      // newTodo.setTag('pri', this.priority);
      newTodo.priority = '';
    }
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

    return true;
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

    return true;
  }

  // Set an existing tag to the given value. Create the tag if it doesn't exist.
  setTag(key: string, value: string) {
    const existingTag = this.getTag(key);
    if (existingTag) {
      existingTag.value = value;
      return;
    }

    this.description.push(new TodoTag(key, value));
  }

  getTag(key: string) {
    return this.getTags().find((tag) => tag.tag === key);
  }

  getTags() {
    return this.description.filter(
      (item) => item instanceof TodoTag,
    ) as TodoTag[];
  }
  getProjects() {
    return this.description.filter(
      (item) => item instanceof TodoProject,
    ) as TodoProject[];
  }
  getContexts() {
    return this.description.filter(
      (item) => item instanceof TodoCtx,
    ) as TodoCtx[];
  }
  getInternalLinks() {
    return this.description.filter(
      (item) => item instanceof TodoInternalLink,
    ) as TodoInternalLink[];
  }
  getExternalLinks() {
    return this.description.filter(
      (item) => item instanceof TodoExternalLink,
    ) as TodoExternalLink[];
  }

  // Returns a new Todo with:
  // - todays createDate
  // - uncompleted
  // - any pri tags stripped
  clone(id: number) {
    const description = this.description
      .filter((item) => !(item instanceof TodoTag && item.tag === 'pri'))
      .map((item) => item.clone());

    return new Todo({
      id,
      completed: false,
      priority: this.priority,
      createDate: new Date().toISOString().substring(0, 10),
      description,
    });
  }

  toString() {
    return [
      this.completed ? 'x' : null,
      this.priority && !this.completed ? `(${this.priority})` : null,
      this.completedDate,
      this.createDate,
      this.description.map((item) => item.toString()).join(' '),
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
  return a.description.toString().localeCompare(b.description.toString());
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
