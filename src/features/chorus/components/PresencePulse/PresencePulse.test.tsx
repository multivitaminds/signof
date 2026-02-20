import { render, screen } from '@testing-library/react';
import PresencePulse from './PresencePulse';

describe('PresencePulse', () => {
  it('renders online status with pulse class', () => {
    const { container } = render(<PresencePulse status="online" />);
    const el = container.querySelector('.presence-pulse');
    expect(el).toHaveClass('presence-pulse--online');
  });

  it('renders away status with away class', () => {
    const { container } = render(<PresencePulse status="away" />);
    const el = container.querySelector('.presence-pulse');
    expect(el).toHaveClass('presence-pulse--away');
  });

  it('renders dnd status with dnd class', () => {
    const { container } = render(<PresencePulse status="dnd" />);
    const el = container.querySelector('.presence-pulse');
    expect(el).toHaveClass('presence-pulse--dnd');
  });

  it('renders offline status with offline class', () => {
    const { container } = render(<PresencePulse status="offline" />);
    const el = container.querySelector('.presence-pulse');
    expect(el).toHaveClass('presence-pulse--offline');
    expect(el).not.toHaveClass('presence-pulse--online');
  });

  it('renders sm size variant', () => {
    const { container } = render(<PresencePulse status="online" size="sm" />);
    const el = container.querySelector('.presence-pulse');
    expect(el).toHaveClass('presence-pulse--sm');
  });

  it('renders md size variant by default', () => {
    const { container } = render(<PresencePulse status="online" />);
    const el = container.querySelector('.presence-pulse');
    expect(el).toHaveClass('presence-pulse--md');
  });

  it('renders children', () => {
    render(
      <PresencePulse status="online">
        <span data-testid="child">Avatar</span>
      </PresencePulse>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('Avatar');
  });
});
