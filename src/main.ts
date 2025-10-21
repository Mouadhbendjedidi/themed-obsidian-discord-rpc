import { Client } from "discord-rpc";
import { Plugin, PluginManifest, TFile } from "obsidian";
import { Logger } from "./logger";
import { DiscordRPCSettings, PluginState } from "./settings/settings";
import { DiscordRPCSettingsTab } from "./settings/settings-tab";
import { StatusBar } from "./status-bar";

export default class ObsidianDiscordRPC extends Plugin {
  public state: PluginState;
  public settings: DiscordRPCSettings;
  public statusBar: StatusBar;
  public rpc: Client;
  public logger: Logger = new Logger(this);
  public currentFile: TFile;
  public loadedTime: Date;
  public lastSetTime: Date;

  setState(state: PluginState) {
    this.state = state;
  }

  getState(): PluginState {
    return this.state;
  }

  public getApp(): any {
    return this.app;
  }

  public getPluginManifest(): PluginManifest {
    return this.manifest;
  }

  async onload() {
    const statusBarEl = this.addStatusBarItem();
    this.statusBar = new StatusBar(statusBarEl);

    this.settings = (await this.loadData()) || new DiscordRPCSettings();

    this.registerEvent(
      this.app.workspace.on("file-open", this.onFileOpen, this)
    );

    this.registerInterval(window.setInterval(async () => {
      if (this.settings.showConnectionTimer && this.getState() == PluginState.connected){
        this.statusBar.displayTimer(this.settings.useLoadedTime ? this.loadedTime : this.lastSetTime);
      }
    }, 500));

    this.registerDomEvent(statusBarEl, "click", async () => {
      if (this.getState() == PluginState.disconnected) {
        await this.connectDiscord();
      } else if (this.getState() == PluginState.connected) {
        await this.disconnectDiscord();
      }
    });

    this.addSettingTab(new DiscordRPCSettingsTab(this.app, this));

    this.addCommand({
      id: "reconnect-discord",
      name: "Reconnect to Discord",
      callback: async () => await this.connectDiscord(),
    });

    this.addCommand({
      id: "disconnect-discord",
      name: "Disconnect from Discord",
      callback: async () => await this.disconnectDiscord(),
    });

    if (this.settings.connectOnStart) {
      await this.connectDiscord();

      const activeLeaf = this.app.workspace.activeLeaf;
      const files: TFile[] = this.app.vault.getMarkdownFiles();

      if (activeLeaf) {
        const displayText = activeLeaf.getDisplayText();
        files.forEach((file) => {
          if (file.basename === displayText) {
            this.onFileOpen(file);
          }
        });
      }
    } else {
      this.setState(PluginState.disconnected);
      this.statusBar.displayState(
        this.getState(),
        this.settings.autoHideStatusBar
      );
    }
  }

  async onFileOpen(file: TFile) {
    this.currentFile = file;
    if (this.getState() === PluginState.connected) {
      await this.setActivity(
        this.app.vault.getName(),
        file.basename,
        file.extension
      );
    }
  }

  async onunload() {
    await this.saveData(this.settings);
    this.rpc.clearActivity();
    this.rpc.destroy();
  }

  async connectDiscord(): Promise<void> {
    this.loadedTime = new Date();
    this.lastSetTime = new Date();

    this.rpc = new Client({
      transport: "ipc",
    });

    this.setState(PluginState.connecting);
    this.statusBar.displayState(
      this.getState(),
      this.settings.autoHideStatusBar
    );

    this.rpc.once("ready", () => {
      this.setState(PluginState.connected);
      this.statusBar.displayState(
        this.getState(),
        this.settings.autoHideStatusBar
      );
      this.logger.log("Connected to Discord", this.settings.showPopups);
    });

    try {
      await this.rpc.login({
        clientId: "1352970439684657152",
      });
      await this.setActivity(this.app.vault.getName(), "...", "");
    } catch (error) {
      this.setState(PluginState.disconnected);
      this.statusBar.displayState(
        this.getState(),
        this.settings.autoHideStatusBar
      );
      this.logger.log("Failed to connect to Discord", this.settings.showPopups);
    }
  }

  async disconnectDiscord(): Promise<void> {
    this.rpc.clearActivity();
    this.rpc.destroy();
    this.setState(PluginState.disconnected);
    this.statusBar.displayState(
      this.getState(),
      this.settings.autoHideStatusBar
    );
    this.logger.log("Disconnected from Discord", this.settings.showPopups);
  }

  async setActivity(
    vaultName: string,
    fileName: string,
    fileExtension: string
  ): Promise<void> {
    if (this.getState() === PluginState.connected) {
      let vault: string;
      if (this.settings.customVaultName === "") {
        vault = vaultName;
      } else {
        vault = this.settings.customVaultName;
      }

      let file: string;
      if (this.settings.showFileExtension) {
        file = fileName + "." + fileExtension;
      } else {
        file = fileName;
      }

      let folderPath = "";
      if (this.settings.showFolderName && this.currentFile) {
        const path = this.currentFile.parent?.path;
        if (path && path !== "/") {
          folderPath = path;
        }
      }

      let date: Date;
      if (this.settings.useLoadedTime) {
        date = this.loadedTime;
      } else {
        date = new Date();
      }
      this.lastSetTime = date;

      if (this.settings.privacyMode) {
        await this.rpc.setActivity({
          details: `Editing Notes`,
          state: `Working in a Vault`,
          startTimestamp: date,
          largeImageKey: this.settings.themeStyle,
          largeImageText: "no info just privacy mode",
        });
      } else if (
        this.settings.showVaultName &&
        this.settings.showCurrentFileName &&
        this.settings.showFolderName &&
        folderPath
      ) {
        await this.rpc.setActivity({
          details: `Editing ${file}`,
          state: `Vault: ${vault}  ▸ ${folderPath}`,
          startTimestamp: date,
          largeImageKey: this.settings.themeStyle,
          largeImageText: "I'm thinking!",
        });
      } else if (
        this.settings.showVaultName &&
        this.settings.showCurrentFileName
      ) {
        await this.rpc.setActivity({
          details: `Editing ${file}`,
          state: `Vault: ${vault}`,
          startTimestamp: date,
          largeImageKey: this.settings.themeStyle,
          largeImageText: "I'm thinking!",
        });
      } else if (
        this.settings.showFolderName &&
        folderPath &&
        this.settings.showCurrentFileName
      ) {
        await this.rpc.setActivity({
          details: `Editing: ${file}`,
          state: `Folder: ${folderPath}`,
          startTimestamp: date,
          largeImageKey: this.settings.themeStyle,
          largeImageText: "I'm thinking!",
        });
      } else if (this.settings.showVaultName) {
        await this.rpc.setActivity({
          state: `Vault: ${vault}`,
          startTimestamp: date,
          largeImageKey: this.settings.themeStyle,
          largeImageText: "Obsidian",
        });
      } else if (this.settings.showCurrentFileName) {
        await this.rpc.setActivity({
          details: `Editing ${file}`,
          startTimestamp: date,
          largeImageKey: this.settings.themeStyle,
          largeImageText: "I'm thinking!",
        });
      } else {
        await this.rpc.setActivity({
          startTimestamp: date,
          largeImageKey: this.settings.themeStyle,
          largeImageText: "Obsidian",
        });
      }
    }
  }
}
