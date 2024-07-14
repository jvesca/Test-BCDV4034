import { render, screen } from '@testing-library/react';
import App from './App';

test('renders AquaTrustChain in Navigation', () => {
  render(<App />);
  const brandElement = screen.getByText(/AquaTrustChain/i);
  expect(brandElement).toBeInTheDocument();
});