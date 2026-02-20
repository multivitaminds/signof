import type { ReactNode } from 'react';
import type { ChorusPresenceStatus } from '../../types';
import './PresencePulse.css';

interface PresencePulseProps {
  status: ChorusPresenceStatus;
  size?: 'sm' | 'md';
  children?: ReactNode;
}

export default function PresencePulse({
  status,
  size = 'md',
  children,
}: PresencePulseProps) {
  const className = [
    'presence-pulse',
    `presence-pulse--${status}`,
    `presence-pulse--${size}`,
  ].join(' ');

  return (
    <span className={className}>
      {children}
    </span>
  );
}
