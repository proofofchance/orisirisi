import { useEffect } from 'react';

export function usePageVisibility(
  onPageVisible: () => Promise<void>,
  ignoreOnload = false
) {
  useEffect(() => {
    !ignoreOnload && onPageVisible();

    const handleVisibilityChange = () => {
      const isAppVisibleToUser = !document.hidden;

      if (isAppVisibleToUser) {
        onPageVisible();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [ignoreOnload, onPageVisible]);
}
