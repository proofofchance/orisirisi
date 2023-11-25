import { useCoinflipGame } from '@orisirisi/coinflip-web-ui';
import { parseInteger } from '@orisirisi/orisirisi-data-utils';
import { useIsClient } from '@orisirisi/orisirisi-web-ui';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

export function PlayGame() {
  const isClient = useIsClient();

  const { query } = useRouter();
  const id = parseInteger(query.id as string);

  const fetchGameParams = useMemo(() => (id ? { id } : null), [id]);
  const { game } = useCoinflipGame(fetchGameParams);

  console.log({ game });

  return (
    <>{isClient && "This will present the proof for the game's outcome"}</>
  );
}

export default PlayGame;
