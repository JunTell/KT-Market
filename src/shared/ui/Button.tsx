import { cn } from '../lib/utils/cn';
import { ButtonSpinner } from './ButtonSpinner';
import type { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean;
  type: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  loading?: boolean;
}

export const Button = ({
  className,
  children,
  size = 'medium',
  variant = 'primary',
  disabled = false,
  onClick,
  type,
  ariaLabel = '',
  loading = false,
  ...props
}: ButtonProps) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 focus:outline-none rounded-lg transition-colors box-border';

  const variantClasses = cn({
    'bg-primary text-white hover:bg-primary-600': variant === 'primary',
    'bg-secondary-100 text-secondary-700 hover:bg-secondary-200': variant === 'secondary',
    'bg-transparent text-label-800 border border-line-400 hover:bg-background-alternative hover:border-label-700': variant === 'outline',
    'bg-transparent text-label-700 hover:bg-background-alternative hover:text-label-900': variant === 'ghost',
    'bg-status-error text-white hover:opacity-80': variant === 'danger',
    'bg-status-disable text-label-500 cursor-not-allowed hover:bg-status-disable': disabled
  });

  const sizeClasses = cn({
    'px-2 py-0.5 text-xs': size === 'xsmall',
    'px-3 py-1.5 text-sm': size === 'small',
    'px-4 py-2 text-body-2 font-medium': size === 'medium',
    'px-6 py-3 text-lg font-semibold': size === 'large'
  });

  const combinedClasses = cn(
    baseClasses,
    variantClasses,
    sizeClasses,
    className
  );

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      aria-label={ariaLabel}
      {...props}
    >
      <span className="pt-[.125rem]">{children}</span>
      {loading && <ButtonSpinner />}
    </button>
  );
};