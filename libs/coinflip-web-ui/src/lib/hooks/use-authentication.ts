import { useIsWeb3AccountConnected } from '@orisirisi/orisirisi-web3-ui';
import { useRouter } from 'next/router';
import { useIsClient } from '@orisirisi/orisirisi-web-ui';

import { atom, useAtom, useSetAtom } from 'jotai';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export function useAuthentication() {
  const isClient = useIsClient();
  const isAccountConnected = useIsWeb3AccountConnected();
  const dispatchAuthErrorToastRequest = useDispatchAuthErrorToastRequest();

  const { replace } = useRouter();

  if (!isClient) return;

  if (!isAccountConnected) {
    dispatchAuthErrorToastRequest();

    replace('/games');
  }
}

const authErrorToastRequestAtom = atom<Date | null>(null);

function useDispatchAuthErrorToastRequest() {
  const setAuthErrorToastRequest = useSetAtom(authErrorToastRequestAtom);

  return () => setAuthErrorToastRequest(new Date());
}

export function useAuthErrorToastRequest() {
  const [authErrorToastRequest, setAuthErrorToastRequest] = useAtom(
    authErrorToastRequestAtom
  );

  useEffect(() => {
    if (!authErrorToastRequest) return;

    toast.error('You need to connect your acccount first.', {
      position: 'bottom-right',
    });

    setAuthErrorToastRequest(null);
  }, [authErrorToastRequest, setAuthErrorToastRequest]);
}
