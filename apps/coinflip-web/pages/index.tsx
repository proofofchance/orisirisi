import { useIsClient } from '@orisirisi/orisirisi-web-ui';
import { useRouter } from 'next/router';

export function Index() {
  const isClient = useIsClient();
  const { replace } = useRouter();

  isClient && replace('/games');

  return null;
}

export default Index;
