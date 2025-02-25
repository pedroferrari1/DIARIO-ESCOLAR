import React, { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: AllProviders });
}

function AllProviders({ children }: PropsWithChildren) {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
}

export * from '@testing-library/react';
export { renderWithProviders as render };