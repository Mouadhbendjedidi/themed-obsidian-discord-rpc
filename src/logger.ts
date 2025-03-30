import { Notice } from "obsidian";
import ObsidianDiscordRPC from "./main";

export class Logger {
  private plugin: ObsidianDiscordRPC;

  constructor(plugin: ObsidianDiscordRPC) {
    this.plugin = plugin;
  }

  log(message: string, showPopups: boolean): void {
    if (showPopups) {
      new Notice(message);
    }
    console.log(`discordrpc: ${message}`);
  }

  logIgnoreNoNotice(message: string): void {
    new Notice(message);
    console.log(`discordrpc: ${message}`);
  }
}
