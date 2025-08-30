import { render, screen } from '@testing-library/react';
import AIChat from '../AIChat';

describe('AIChat', () => {
  test('renders AIChat component with "Your AI Coach" title', () => {
    render(<AIChat isOpen={true} onClose={() => {}} />); // Pass required props
    expect(screen.getByText(/Your AI Coach/i)).toBeInTheDocument();
  });
});