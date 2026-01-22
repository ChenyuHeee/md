import React from 'react';
import clsx from 'clsx';

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
  },
) {
  const { className, ...rest } = props;
  return <select {...rest} className={clsx('ui-select', className)} />;
}
