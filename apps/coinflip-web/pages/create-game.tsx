import { CreateGameSection } from '@orisirisi/coinflip-web-ui';
import { useIsClient } from '@orisirisi/orisirisi-web-ui';

export function CreateGame() {
  const isClient = useIsClient();

  return <>{isClient && <CreateGameSection />}</>;
}

export default CreateGame;
