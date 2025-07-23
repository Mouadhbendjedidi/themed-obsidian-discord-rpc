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
  Catppuccin_Latte = "latte",
  Catppuccin_Frappe = "frappe",
  Catppuccin_Macchiato = "macchiato",
  Catppuccin_Mocha = "mocha",
  Cyberglow_Dark = "cyberglow-dark",
  Cyberglow_Light = "cyberglow-light",
  Tokyo_night_Dark = "tokyo-night-dark",
  Tokyo_night_Light = "tokyo-night-light"
}
