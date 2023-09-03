import { Result } from '@orisirisi/orisirisi-error-handling';

export class Browser {
  static openInNewTab(url: string) {
    return window.open(url, '_blank')?.focus();
  }

  static reloadWindow = () => window.location.reload();
}

class BrowserStorageError {
  constructor(public noValueError: string) {}
}

export class BrowserStorage {
  static set = <T>(key: string, value: T) => {
    runOnlyInWindow(() => {
      const jsonKey = JSON.stringify({ key });
      const jsonValue = JSON.stringify({ value });

      window.localStorage.setItem(jsonKey, jsonValue);
    });
  };

  static clear = (key: string) => {
    runOnlyInWindow(() => {
      const jsonKey = JSON.stringify({ key });

      localStorage.removeItem(jsonKey);
    });
  };

  static get = (key: string) => {
    return runOnlyInWindow(() => {
      const jsonKey = JSON.stringify({ key });

      const stringifiedValue = window.localStorage.getItem(jsonKey);

      if (!stringifiedValue)
        return new Result(
          null,
          new BrowserStorageError(
            `${key} does have any value in the browser storage`
          )
        );

      return new Result(JSON.parse(stringifiedValue).value, null);
    });
  };

  static clearAll = () => runOnlyInWindow(() => window.localStorage.clear());
}

function runOnlyInWindow<R>(run: () => R) {
  if (typeof window === 'undefined') return new Result(null, 'Not in window');

  return run();
}