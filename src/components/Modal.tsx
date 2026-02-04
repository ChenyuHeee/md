import React from 'react';

export function Modal(props: {
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  onClose: () => void;
  className?: string;
}) {
  return (
    <div
      className="modalBackdrop"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      <div className={props.className ? `modal ${props.className}` : 'modal'}>
        <header>{props.title}</header>
        <div className="content">{props.children}</div>
        <footer>{props.footer}</footer>
      </div>
    </div>
  );
}
