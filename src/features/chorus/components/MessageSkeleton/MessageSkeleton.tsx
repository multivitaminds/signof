import './MessageSkeleton.css';

interface MessageSkeletonProps {
  count?: number;
}

export default function MessageSkeleton({ count = 3 }: MessageSkeletonProps) {
  return (
    <div className="message-skeleton" role="status" aria-label="Loading messages">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="message-skeleton__row">
          <div className="message-skeleton__avatar" />
          <div className="message-skeleton__content">
            <div className="message-skeleton__line message-skeleton__line--name" />
            <div className="message-skeleton__line message-skeleton__line--text" />
            <div className="message-skeleton__line message-skeleton__line--text-short" />
          </div>
        </div>
      ))}
    </div>
  );
}
