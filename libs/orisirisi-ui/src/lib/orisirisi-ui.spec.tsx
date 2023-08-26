import { render } from '@testing-library/react';

import OrisirisiUi from './orisirisi-ui';

describe('OrisirisiUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OrisirisiUi />);
    expect(baseElement).toBeTruthy();
  });
});
