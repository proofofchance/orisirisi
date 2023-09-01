import { render } from '@testing-library/react';

import OrisirisiWeb3Ui from './orisirisi-web3-ui';

describe('OrisirisiWeb3Ui', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OrisirisiWeb3Ui />);
    expect(baseElement).toBeTruthy();
  });
});
