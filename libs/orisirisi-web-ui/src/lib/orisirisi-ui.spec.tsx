import { render } from '@testing-library/react';

import OrisirisiUi from './orisirisi-web-ui';

describe('OrisirisiUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OrisirisiUi />);
    expect(baseElement).toBeTruthy();
  });
});
