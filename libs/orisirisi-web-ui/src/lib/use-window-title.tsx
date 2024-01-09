import { useRef, useEffect } from 'react';

export function useWindowTitle(title: string, prevailOnUnmount = false) {
  const defaultTitle = useRef(document.title);

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    const initialTitle = defaultTitle.current;

    return () => {
      if (!prevailOnUnmount) {
        document.title = initialTitle;
      }
    };
  }, [prevailOnUnmount]);
}
