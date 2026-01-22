import React from 'react';
import clsx from 'clsx';

export function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input {...rest} className={clsx('ui-input', className)} />;
}
