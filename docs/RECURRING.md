# Recurring Tasks

The [TodoTxt Plugin](/README.md) supports extensions to the todo.txt
[spec](https://github.com/todotxt/todo.txt) to handle recurring tasks.

A task can be specified as recurring by including the `rec:` tag, and
optionally, the `t:` (threshold) tag. When a recurring task is marked as
completed, a new task is also created with a `due:` tag based on the `rec:` and
`t:` tags.

### The `rec:` Recurring Tag

A `rec:` tag indicates that the task is recurring. The tags value indicates
when the next task should be due. For example, a `rec:1w` indicates that the
tasks recurs one week after the task is completed.

The rec pattern is defined as:

1. The `rec:` tag prefix (proceeded by a space, as are all tags)
2. An optional `+` to indicate that "strict" recurrance
3. A number
4. The duration (a single letter indicating days, weeks, months or years).

No spaces are permitted in the rec pattern. Some examples:

- `rec:10d` - Recurs in ten days
- `rec:1y` - Recurs in one year
- `rec:+5w` - Recurs five weeks after

Duration can be one of:

| Abbr | Duration |
| ---- | -------- |
| d    | days     |
| w    | weeks (7 days) |
| m    | months   |
| y    | years    |

(At this time, `b` for "business days" is not supported. It will be treated as days.)


### Thresholds

If the task has a threshold specified, the new task will also have a threshold. Its date will
be based on the number of days between the threshold date and the due date.


## Thanks

* Thanks to @pcause for requesting this feature and pointing to example
  implementations.
* Thanks to the authors of [SwiftoDo](https://swiftodoapp.com/) for documenting
  the due and recurring extensions to the spec.
