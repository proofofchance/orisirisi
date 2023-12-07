import {
  CreateGameSection,
  useAuthentication,
} from '@orisirisi/coinflip-web-ui';
import { useIsClient } from '@orisirisi/orisirisi-web-ui';

export function CreateGame() {
  useAuthentication();
  const isClient = useIsClient();

  return <>{isClient && <CreateGameSection />}</>;
}

export default CreateGame;
