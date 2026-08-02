'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="space-y-2">
      {children}
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
      {description && (
        <p className="text-lg text-gray-500">{description}</p>
      )}
    </div>
  );
}