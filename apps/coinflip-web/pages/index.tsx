import {
  Background,
  ConnectWalletOptionsModal,
  CreateGameSection,
  NavigationBar,
} from '@orisirisi/coinflip-web-ui';
import { useIsWeb3AccountConnected } from '@orisirisi/orisirisi-web3-ui';

export function Index() {
  const isWeb3Connected = useIsWeb3AccountConnected();

  return (
    <>
      <ConnectWalletOptionsModal />
      <Background className="px-20">
        <NavigationBar className="py-4" />
        {isWeb3Connected && <CreateGameSection />}
      </Background>
    </>
  );
}

export default Index;
