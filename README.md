# Obsidian TodoTxt Plugin

Manage [\*.todotxt](https://github.com/todotxt/todo.txt) files in Obsidian.

![Sample TodoTxt file in Obsidian](docs/screenshot.png)

Install the plugin and put your todo file in your Obsidian vault with the
`.todotxt` extension (ie, `TODO.todotxt`).

## How to install

- Clone this repo.
- `npm i` or `yarn` to install dependencies
- `npm run dev` to start compilation in watch mode.

## Manually installing the plugin

- Copy `main.js`, `styles.css`, `manifest.json` to your vault
  `VaultFolder/.obsidian/plugins/todotxt-plugin/`.

    cp dist/* VaultFolder/.obsidian/plugins/todotxt-plugin/

## Keyboard Shortcuts

Use `tab` and `shift-tab` to navigate through your todos.

- `n` to create a New todo
- `e` or `enter` to Edit the current todo
- `d` to Delete the current todo
- `space` toggle done

## TODO

- [ ] Handle parseTodo() errors
- [x] Delete a Todo
- [x] Edit a Todo
- [x] Keyboard shortcut to create new Todo
- [ ] Global keyboard shortcut to create new Todo
- [ ] Command palette command to create new Todo
- [ ] Config menu set the default .todotxt file
- [x] Keyboard navigation through TODOs
- [x] Priority colors are a bit bright
