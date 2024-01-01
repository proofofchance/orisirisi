import { atom, useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const errorToastAtom = atom<[string, Date] | null>(null);

export function useDispatchErrorToastRequest() {
  const setErrorToastRequest = useSetAtom(errorToastAtom);

  return (message: string) => setErrorToastRequest([message, new Date()]);
}

export function useErrorToastRequest() {
  const [errorToast, setErrorToastRequest] = useAtom(errorToastAtom);

  useEffect(() => {
    if (!errorToast) return;
    const [message] = errorToast;

    toast.error(message, {
      position: 'bottom-right',
    });

    setErrorToastRequest(null);
  }, [errorToast, setErrorToastRequest]);
}
