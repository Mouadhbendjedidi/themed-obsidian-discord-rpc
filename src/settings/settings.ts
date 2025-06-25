export class DiscordRPCSettings {
  showVaultName: boolean = true;
  showCurrentFileName: boolean = true;
  showConnectionTimer: boolean = false;
  showPopups: boolean = true;
  customVaultName: string = "";
  showFileExtension: boolean = false;
  useLoadedTime: boolean = false;
  connectOnStart: boolean = true;
  autoHideStatusBar: boolean = true;
  privacyMode: boolean = false;
  themeStyle: ThemeStyle = ThemeStyle.Default_new_dark;
}

export enum PluginState {
  connected,
  connecting,
  disconnected,
}

export enum ThemeStyle {
  Default_dark = "default-old-dark",
  Default_light = "default-old-light",
  Default_new_dark = "default-new-dark",
  Default_new_light = "default-new-light",
  Latte = "latte",
  Frappe = "frappe",
  Macchiato = "macchiato",
  Mocha = "mocha"
}
