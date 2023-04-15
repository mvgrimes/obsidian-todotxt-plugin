import {
  App,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  WorkspaceLeaf,
} from 'obsidian';
import { TodotxtView, VIEW_TYPE_TODOTXT } from './view';

interface TodotxtPluginSettings {
  defaultPriorityFilter: string;
  defaultTodotxt: string;
}

const DEFAULT_SETTINGS: TodotxtPluginSettings = {
  defaultPriorityFilter: 'B',
  defaultTodotxt: 'default',
};

export default class TodotxtPlugin extends Plugin {
  settings: TodotxtPluginSettings;

  async onload() {
    await this.loadSettings();

    this.registerView(
      VIEW_TYPE_TODOTXT,
      (leaf: WorkspaceLeaf) => new TodotxtView(leaf, this),
    );
    this.registerExtensions(['todotxt'], VIEW_TYPE_TODOTXT);

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new TodoSettingTab(this.app, this));

    // Add a command for the command palette
    // this.addCommand({
    //   id: 'todotxt-add-todo',
    //   name: 'Add todo item to TODOTXT file',
    //   callback: () => {
    //     new TodoModal(this.app, (result) => {
    //       new Notice(`Adding '${result}' to ${this.settings.defaultTodotxt}`);
    //     }).open();
    //   },
    // });

    // This creates an icon in the left ribbon
    // Could be used to jump to the default todo list
    // const ribbonIconEl = this.addRibbonIcon(
    //   'dice',
    //   'Todo Plugin',
    //   (evt: MouseEvent) => {
    //     // Called when the user clicks the icon.
    //     new Notice('This is a notice!');
    //   },
    // );
    // // Perform additional things with the ribbon
    // ribbonIconEl.addClass('my-plugin-ribbon-class');

    // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
    // TODO: add a count of todos
    // const statusBarItemEl = this.addStatusBarItem();
    // statusBarItemEl.setText('Todotxt');

    // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
    // Using this function will automatically remove the event listener when this plugin is disabled.
    // this.registerDomEvent(document, "click", (evt: MouseEvent) => {
    //   console.log("click", evt);
    // });

    // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
    // this.registerInterval(
    //   window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
    // );
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

// class TodoModal extends Modal {
//   constructor(app: App) {
//     super(app);
//   }
//
//   onOpen() {
//     const { contentEl } = this;
//     contentEl.setText("Woah!");
//   }
//
//   onClose() {
//     const { contentEl } = this;
//     contentEl.empty();
//   }
// }

class TodoSettingTab extends PluginSettingTab {
  plugin: TodotxtPlugin;

  constructor(app: App, plugin: TodotxtPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Settings for TodoTxt plugin.' });

    new Setting(containerEl)
      .setName('Default priority filter')
      .setDesc(
        'By default, only Todos with this priority or high will be displayed.',
      )
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({ A: 'A', B: 'B', C: 'C', Z: 'All' })
          .setValue(this.plugin.settings.defaultPriorityFilter)
          .onChange(async (value) => {
            console.log('Secret: ' + value);
            this.plugin.settings.defaultPriorityFilter = value;
            await this.plugin.saveSettings();
          }),
      );

    // new Setting(containerEl)
    //   .setName('Default .todotxt file')
    //   .setDesc('New todos entered from the command palette will be stored here')
    //   .addText((text) =>
    //     text
    //       .setPlaceholder('Enter your secret')
    //       .setValue(this.plugin.settings.defaultTodotxt)
    //       .onChange(async (value) => {
    //         console.log('Secret: ' + value);
    //         this.plugin.settings.defaultTodotxt = value;
    //         await this.plugin.saveSettings();
    //       }),
    //   );
  }
}
