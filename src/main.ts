import {
  App,
  addIcon,
  TFile,
  TFolder,
  // Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  WorkspaceLeaf,
} from 'obsidian';
import { TodotxtView, VIEW_TYPE_TODOTXT } from './view';

const newTodotxtIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-todo"><rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>'

interface TodotxtPluginSettings {
  defaultPriorityFilter: string;
  defaultOrganizeBy: 'project' | 'context';
  defaultTodotxt: string;
  defaultGroupBy: string;
  additionalExts: string[];
  recurringTasks: boolean;
  preservePriority: boolean;
}

const DEFAULT_SETTINGS: TodotxtPluginSettings = {
  defaultPriorityFilter: 'B',
  defaultOrganizeBy: 'project',
  defaultTodotxt: 'default',
  defaultGroupBy: 'Default',
  additionalExts: [],
  recurringTasks: false,
  preservePriority: true,
};

export default class TodotxtPlugin extends Plugin {
  settings: TodotxtPluginSettings;

  async onload() {
    await this.loadSettings();

    this.registerView(
      VIEW_TYPE_TODOTXT,
      (leaf: WorkspaceLeaf) => new TodotxtView(leaf, this),
    );
    this.registerExtensions(
      ['todotxt', ...this.settings.additionalExts],
      VIEW_TYPE_TODOTXT,
    );
    addIcon("create-new-todotxt",newTodotxtIcon)
    this.registerEvents();

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
    // TODO: add a count of todos, fileFormat
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

    console.log(
      `Todo.txt: version ${this.manifest.version} (requires Obsidian ${this.manifest.minAppVersion})`,
    );
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  registerEvents() {
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file, source, leaf) => {
        if (source === 'link-context-menu') return;

        const fileIsFolder = file instanceof TFolder;

        // Add a menu item to the folder context menu to create a board
        if (fileIsFolder) {
          menu.addItem((item) => {
            item
              .setSection('action-primary')
              .setTitle('New Todo txt')
              .setIcon('create-new-todotxt')
              .onClick(() => this.NewTodotxt(file));
          });
          return;
        }
      }))
    }
  private async getNewTodotxtFilePath(
      folder :TFolder,
      name : string,
      extension : string
    )
  {
    let filePath = `${folder.path}/${name}.${extension}`;
    let index = 0;
    while (await this.app.vault.adapter.exists(filePath)) {
      filePath = `${folder.path}/${name} ${++index}.${extension}`;
    }
    return filePath;
  }

  async NewTodotxt(folder?: TFolder) {
    const targetFolder = folder
      ? folder
      : this.app.fileManager.getNewFileParent("");
    const newFilePath = await this.getNewTodotxtFilePath(
      targetFolder,
      "Todo",
      "todotxt"
    );
    const file = await this.app.vault.create(newFilePath, "");
    await this.app.workspace.getLeaf().setViewState({
        type : VIEW_TYPE_TODOTXT,
        state : {file : file.path}
      })
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
    const settingsDiv = containerEl.createDiv({ cls: 'todotxt-settings' });
    settingsDiv.createEl('h2', { text: 'Settings for TodoTxt plugin.' });

    new Setting(settingsDiv)
      .setName('Default priority filter')
      .setDesc(
        'By default, only Todos with this priority or high will be displayed.',
      )
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({ A: 'A', B: 'B', C: 'C', D: 'D', Z: 'All' })
          .setValue(this.plugin.settings.defaultPriorityFilter)
          .onChange(async (value) => {
            this.plugin.settings.defaultPriorityFilter = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(settingsDiv)
      .setName('Default Todo grouping')
      .setDesc('By default, only Todos will be organized in lists by these.')
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({ project: 'Project', context: 'Context' })
          .setValue(this.plugin.settings.defaultOrganizeBy)
          .onChange(async (value) => {
            this.plugin.settings.defaultOrganizeBy =
              value === 'project' ? 'project' : 'context';
            await this.plugin.saveSettings();
          }),
      );

    new Setting(settingsDiv)
      .setName('Name for the default project/context')
      .setDesc(
        'If no project/context is specified for a Todo, it will be listed under this list. ' +
          'The todotxt file will need to be reloaded in order to see the changes.',
      )
      .addText((text) =>
        text
          .setValue(this.plugin.settings.defaultGroupBy)
          .onChange(async (value) => {
            this.plugin.settings.defaultGroupBy =
              value.replace(/[ \t]/g, '') || 'Default';
            await this.plugin.saveSettings();
          }),
      );

    settingsDiv.createEl('h4', {
      text: 'Experimental',
      cls: 'todo-experimental-heading',
    });
    const expDiv = settingsDiv.createEl('details');
    expDiv.createEl('summary', {
      text:
        'Warning: These features are considered experimental and may change or be removed from future versions.' +
        '(Click to expand.)',
    });

    new Setting(expDiv)
      .setName('Preserve tast priorities when completed')
      .setDesc(
        `According to the todotxt spec, priorities are typically discarded when a task is completed. ` +
          `This feature will save the priority (as a "pri:X" tag). If the task is "uncompleted" the priority will be restored.`,
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.preservePriority)
          .onChange(async (value) => {
            this.plugin.settings.preservePriority = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(expDiv)
      .setName('Support for recurring tasks')
      .setDesc(
        `When completing tasks with the rec: tag, create a new task based. This is not part of the todotxt spec.`,
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.recurringTasks)
          .onChange(async (value) => {
            this.plugin.settings.recurringTasks = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(expDiv)
      .setName('Additional TodoTxt extension')
      .setDesc(
        'Additional filename extensions (separate multiple extensions by commas) to treat as TodoTxt files.' +
          '\nRequires restart of Obsidian.',
      )
      .addText((text) =>
        text
          .setValue(this.plugin.settings.additionalExts.join(','))
          .onChange(async (value) => {
            this.plugin.settings.additionalExts = value?.split(/\s*,\s*/) || [];
            await this.plugin.saveSettings();
          }),
      );
  }
}
