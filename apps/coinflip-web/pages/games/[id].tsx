import { useCoinflipGame } from '@orisirisi/coinflip-web-ui';
import { parseInteger } from '@orisirisi/orisirisi-data-utils';
import { useRouter } from 'next/router';

export default function GamePage() {
  const { query } = useRouter();
  const id = parseInteger(query.id as string);
  const game = useCoinflipGame(id);

  console.log({ id });
  console.log({ game });

  return <>Game Page</>;
}
