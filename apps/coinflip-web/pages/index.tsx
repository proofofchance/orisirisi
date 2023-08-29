import styled from 'styled-components';
import { Background, CreateGameSection, NavigationBar } from '@orisirisi/coinflip-web-ui';

const StyledPage = styled.div`
  .page {
  }
`;

export function Index() {
  return (
    <StyledPage>
      <NavigationBar />
      <Background>
        <CreateGameSection />
      </Background>
    </StyledPage>
  );
}

export default Index;
