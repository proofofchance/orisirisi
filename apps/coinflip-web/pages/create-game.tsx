import { CreateGameSection } from '@orisirisi/coinflip-web-ui';
import { useIsClient } from '@orisirisi/orisirisi-web-ui';
import { useIsWeb3AccountConnected } from '@orisirisi/orisirisi-web3-ui';

export function CreateGame() {
  const isClient = useIsClient();
  const isWeb3Connected = useIsWeb3AccountConnected();

  return <>{isClient && isWeb3Connected && <CreateGameSection />}</>;
}

export default CreateGame;
