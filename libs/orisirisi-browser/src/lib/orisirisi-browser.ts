export class Browser {
  static openInNewTab(url: string) {
    return window.open(url, '_blank')?.focus();
  }

  static reloadWindow = () => window.location.reload();
}
