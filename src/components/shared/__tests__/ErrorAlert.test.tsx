import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/utils';
import ErrorAlert from '../ErrorAlert';

describe('ErrorAlert', () => {
  it('should render title and message', () => {
    const title = 'Error Title';
    const message = 'Error Message';

    render(<ErrorAlert title={title} message={message} />);

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('should have correct styling', () => {
    render(<ErrorAlert title="Error" message="Message" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-50');
  });
});