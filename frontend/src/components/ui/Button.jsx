/**
 * Button — Reusable button component with variants.
 *
 * Variants: primary (gradient accent), outline, danger, ghost
 * Sizes: sm, md, lg
 * Supports loading state with spinner animation.
 */

import { forwardRef } from 'react';

const variants = {
  primary: [
    'gradient-accent text-white',
    'hover:opacity-90 hover:shadow-glow',
    'active:scale-[0.98]',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none',
  ].join(' '),
  outline: [
    'bg-transparent border border-border text-foreground-secondary',
    'hover:border-accent hover:text-accent hover:bg-accent-glow',
    'active:scale-[0.98]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
  danger: [
    'bg-danger/10 border border-danger/20 text-danger',
    'hover:bg-danger/20 hover:border-danger/40',
    'active:scale-[0.98]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
  ghost: [
    'bg-transparent text-foreground-secondary',
    'hover:bg-card-hover hover:text-foreground',
    'active:scale-[0.98]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
  success: [
    'bg-success/10 border border-success/20 text-success',
    'hover:bg-success/20 hover:border-success/40',
    'active:scale-[0.98]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon: Icon,
    iconRight: IconRight,
    className = '',
    disabled,
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center',
        'rounded-xl font-medium',
        'transition-all duration-200 ease-out',
        'cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      ].join(' ')}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}

      {children}

      {!isLoading && IconRight && (
        <IconRight className="h-4 w-4 shrink-0" />
      )}
    </button>
  );
});

export default Button;
