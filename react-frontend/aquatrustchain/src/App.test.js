import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import App from './App';

test('renders AquaTrustChain in Navigation', async () => {
  await act(async () => {
    render(<App />);
  });
  const brandElement = screen.getByText(/AquaTrustChain/i);
  expect(brandElement).toBeInTheDocument();
});