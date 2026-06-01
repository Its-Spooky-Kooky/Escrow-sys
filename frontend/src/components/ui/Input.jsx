/**
 * Input — Styled form input with label, validation, and icons.
 *
 * Supports: text, number, email, password, textarea
 * Features: error state, helper text, leading/trailing addons, copy button
 */

import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../../utils/formatters';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    suffix,
    copiable = false,
    type = 'text',
    className = '',
    containerClassName = '',
    id,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;
  const isTextarea = type === 'textarea';

  const handleCopy = async () => {
    if (props.value) {
      await copyToClipboard(props.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inputClasses = [
    'w-full bg-surface border rounded-xl',
    'text-foreground placeholder:text-muted',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white',
    error
      ? 'border-danger/50 focus:ring-danger/30 focus:border-danger'
      : 'border-border hover:border-border-highlight focus:ring-accent/30 focus:border-accent/50',
    Icon ? 'pl-11' : 'pl-4',
    (type === 'password' || copiable || suffix) ? 'pr-11' : 'pr-4',
    isTextarea ? 'py-3 min-h-[120px] resize-y' : 'py-3 h-12',
    'text-sm font-normal',
    className,
  ].join(' ');

  const InputTag = isTextarea ? 'textarea' : 'input';

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-foreground-secondary"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <InputTag
          ref={ref}
          id={id}
          type={isTextarea ? undefined : inputType}
          className={inputClasses}
          {...props}
        />

        {/* Password toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground-secondary transition-colors cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}

        {/* Copy button */}
        {copiable && type !== 'password' && (
          <button
            type="button"
            onClick={handleCopy}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground-secondary transition-colors cursor-pointer"
            tabIndex={-1}
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </button>
        )}

        {/* Suffix */}
        {suffix && !copiable && type !== 'password' && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted text-sm font-mono pointer-events-none">
            {suffix}
          </div>
        )}
      </div>

      {/* Error or helper text */}
      {error && (
        <p className="text-xs text-danger flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-danger" />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-muted">{helperText}</p>
      )}
    </div>
  );
});

export default Input;
