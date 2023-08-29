import { Background, CreateGameSection, NavigationBar } from '@orisirisi/coinflip-web-ui';


export function Index() {
  return (
    <Background className='px-20'>
      <NavigationBar className='py-4' />
      <CreateGameSection />
    </Background>
  );
}

export default Index;
