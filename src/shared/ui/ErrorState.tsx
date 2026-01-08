import { ReactNode } from 'react';

interface ErrorStateProps {
  message: string;
  action?: ReactNode;
  className?: string;
}

export const ErrorState = ({
  message,
  action,
  className = ''
}: ErrorStateProps) => {
  return (
    <div className={`flex flex-col justify-center items-center min-h-[60vh] text-center px-4 ${className}`}>
      <p className="text-label-700 text-lg mb-4">{message}</p>
      {action && action}
    </div>
  );
};
