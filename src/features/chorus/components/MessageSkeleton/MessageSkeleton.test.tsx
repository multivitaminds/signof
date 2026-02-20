import { render, screen } from '@testing-library/react';
import MessageSkeleton from './MessageSkeleton';

describe('MessageSkeleton', () => {
  it('renders default 3 skeleton rows', () => {
    render(<MessageSkeleton />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    const rows = status.querySelectorAll('.message-skeleton__row');
    expect(rows).toHaveLength(3);
  });

  it('renders custom count of skeleton rows', () => {
    render(<MessageSkeleton count={5} />);
    const rows = document.querySelectorAll('.message-skeleton__row');
    expect(rows).toHaveLength(5);
  });

  it('renders avatar and text lines for each row', () => {
    render(<MessageSkeleton count={1} />);
    expect(document.querySelector('.message-skeleton__avatar')).toBeInTheDocument();
    expect(document.querySelector('.message-skeleton__line--name')).toBeInTheDocument();
    expect(document.querySelector('.message-skeleton__line--text')).toBeInTheDocument();
    expect(document.querySelector('.message-skeleton__line--text-short')).toBeInTheDocument();
  });

  it('has accessible loading label', () => {
    render(<MessageSkeleton />);
    expect(screen.getByLabelText('Loading messages')).toBeInTheDocument();
  });
});
