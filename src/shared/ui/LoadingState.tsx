interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState = ({
  message = '로딩 중...',
  className = ''
}: LoadingStateProps) => {
  return (
    <div className={`flex justify-center items-center min-h-[60vh] ${className}`}>
      <p className="text-label-700 text-lg">{message}</p>
    </div>
  );
};
