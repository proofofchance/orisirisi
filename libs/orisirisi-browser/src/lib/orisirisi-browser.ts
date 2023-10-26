import { Result } from '@orisirisi/orisirisi-error-handling';

export class Browser {
  static openInNewTab(url: string) {
    return window.open(url, '_blank')?.focus();
  }

  static reloadWindow = () => window.location.reload();

  static downloadTextFile(
    text: string,
    fileName: string,
    fileExtension: string
  ) {
    const blob = new Blob([text], { type: 'text/plain' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.${fileExtension}`;

    link.click();

    URL.revokeObjectURL(link.href);
  }
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

  static get = <T = any>(key: string) => {
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

      return new Result(JSON.parse(stringifiedValue).value as T, null);
    });
  };

  static clearAll = () => runOnlyInWindow(() => window.localStorage.clear());
}

function runOnlyInWindow<R>(run: () => R) {
  if (typeof window === 'undefined') return new Result(null, 'Not in window');

  return run();
}

export const buildQueryString = (
  queryObject: Partial<Record<string, string>>
) => {
  const queryString = Object.keys(queryObject).reduce(
    (queryStringSoFar, key) => {
      if (queryObject[key]) {
        if (!queryStringSoFar) return `${key}=${queryObject[key]}`;

        return `${queryStringSoFar}&${key}=${queryObject[key]}`;
      }

      return queryStringSoFar;
    },
    ''
  );

  return queryString ? `?${queryString}` : '';
};
