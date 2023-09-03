import {
  Background,
  ConnectWalletOptionsModal,
  CreateGameSection,
  NavigationBar,
} from '@orisirisi/coinflip-web-ui';
import { useIsWeb3Connected } from '@orisirisi/orisirisi-web3-ui';

export function Index() {
  const isWeb3Connected = useIsWeb3Connected();

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
