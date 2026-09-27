import React from 'react';
import { NovaEnvironment } from './novaTypes';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

export interface NovaNavigationProps {
  currentEnvironment: NovaEnvironment;
  breadcrumbs?: BreadcrumbItem[];
  onOpenCommandSurface?: () => void;
  xpValue?: number;
  xpLevel?: number;
  userProfile?: {
    name?: string;
    email?: string;
    avatarUrl?: string;
    badge?: string;
    onClick?: () => void;
  };
  customActions?: React.ReactNode;
  customStatus?: React.ReactNode;
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}
