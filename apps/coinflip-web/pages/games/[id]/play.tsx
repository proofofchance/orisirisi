import { PlayGameSection, useCoinflipGame } from '@orisirisi/coinflip-web-ui';
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

  return <>{isClient && <PlayGameSection game={game} />}</>;
}

export default PlayGame;
