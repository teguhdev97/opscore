import {
  Activity,
  FolderOpen,
  LayoutDashboard,
  ListChecks,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import type { DashboardMenu } from '../lib/api';

const menuIcons: Record<string, typeof LayoutDashboard> = {
  activity: Activity,
  'folder-open': FolderOpen,
  'layout-dashboard': LayoutDashboard,
  'list-checks': ListChecks,
  settings: Settings,
  'shield-check': ShieldCheck,
  sparkles: Sparkles,
  users: Users,
};

export interface MenuItem extends Omit<DashboardMenu, 'icon'> {
  icon: typeof LayoutDashboard;
}

export function getVisibleMenus(menus: readonly DashboardMenu[]): MenuItem[] {
  return menus.map((menu) => ({
    ...menu,
    icon: menuIcons[menu.icon] ?? LayoutDashboard,
  }));
}

export function canAccess(permissions: readonly string[], permission: string): boolean {
  return permissions.includes(permission);
}
