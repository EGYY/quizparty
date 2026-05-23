import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './button.module.scss';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'approve' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'icon' | 'tiny';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  size?: ButtonSize;
  tone?: 'danger' | undefined;
  variant?: ButtonVariant;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function Button({
  className,
  fullWidth,
  size = 'md',
  tone,
  type = 'button',
  variant = 'secondary',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cx(
        styles.button,
        styles[variant],
        size !== 'md' && styles[size],
        tone === 'danger' && styles.dangerTone,
        fullWidth && styles.fullWidth,
        className,
      )}
      type={type}
    />
  );
}

export function IconButton({
  label,
  children,
  className,
  size = 'icon',
  tone,
  variant = 'ghost',
  ...props
}: Omit<ButtonProps, 'aria-label' | 'size' | 'variant'> & {
  children: ReactNode;
  label: string;
  size?: Extract<ButtonSize, 'icon' | 'tiny'>;
  variant?: ButtonVariant;
}) {
  return (
    <Button
      {...props}
      aria-label={label}
      className={className}
      size={size}
      tone={tone}
      variant={variant}
    >
      {children}
    </Button>
  );
}
