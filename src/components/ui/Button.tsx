import React from 'react';
import clsx from 'clsx';

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md';
    leftIcon?: React.ReactNode;
  },
) {
  const { variant = 'default', size = 'md', leftIcon, className, children, ...rest } = props;
  return (
    <button
      {...rest}
      className={clsx('ui-btn', `ui-btn--${variant}`, `ui-btn--${size}`, className)}
    >
      {leftIcon ? <span className="ui-btn__icon">{leftIcon}</span> : null}
      <span className="ui-btn__label">{children}</span>
    </button>
  );
}

export function IconButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md';
    icon: React.ReactNode;
    label: string;
  },
) {
  const { variant = 'ghost', size = 'md', icon, label, className, ...rest } = props;
  return (
    <button
      {...rest}
      className={clsx('ui-iconBtn', `ui-iconBtn--${variant}`, `ui-iconBtn--${size}`, className)}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}
