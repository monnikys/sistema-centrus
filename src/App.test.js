import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => { // Testa se o link "learn react" é renderizado
  render(<App />); // Renderiza o componente App
  const linkElement = screen.getByText(/learn react/i); // Procura o texto "learn react" (case insensitive)
  expect(linkElement).toBeInTheDocument(); // Verifica se o elemento está no documento
});
