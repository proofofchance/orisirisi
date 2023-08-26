import { render } from '@testing-library/react';

import CoinflipUi from './coinflip-ui';

describe('CoinflipUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CoinflipUi />);
    expect(baseElement).toBeTruthy();
  });
});
