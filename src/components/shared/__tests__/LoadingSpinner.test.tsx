import { describe, it, expect } from 'vitest';
import { render } from '../../../test/utils';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.firstChild?.firstChild;
    expect(spinner).toHaveClass('h-8 w-8');
  });

  it('should render with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.firstChild?.firstChild;
    expect(spinner).toHaveClass('h-4 w-4');
  });

  it('should render with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.firstChild?.firstChild;
    expect(spinner).toHaveClass('h-12 w-12');
  });

  it('should apply custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    const spinner = container.firstChild?.firstChild;
    expect(spinner).toHaveClass('custom-class');
  });
});