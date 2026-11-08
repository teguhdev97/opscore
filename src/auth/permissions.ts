import {
  Activity,
  FolderOpen,
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';

export type Role =
  | 'super_admin'
  | 'admin'
  | 'workspace_admin'
  | 'approver'
  | 'member';

export interface MenuItem {
  key: string;
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: readonly Role[];
}

const allRoles: readonly Role[] = [
  'super_admin',
  'admin',
  'workspace_admin',
  'approver',
  'member',
];

export const menuItems: readonly MenuItem[] = [
  { key: 'overview', path: '', label: 'Overview', icon: LayoutDashboard, roles: allRoles },
  { key: 'knowledge', path: 'knowledge', label: 'Knowledge Base', icon: FolderOpen, roles: allRoles },
  { key: 'assistant', path: 'assistant', label: 'AI Assistant', icon: Sparkles, roles: allRoles },
  { key: 'checklists', path: 'checklists', label: 'Action Plans', icon: ListChecks, roles: allRoles },
  {
    key: 'approvals',
    path: 'approvals',
    label: 'Approval Queue',
    icon: ShieldCheck,
    roles: ['super_admin', 'admin', 'approver'],
  },
  {
    key: 'risk',
    path: 'compliance',
    label: 'Risk Review',
    icon: ShieldCheck,
    roles: ['super_admin', 'admin', 'approver'],
  },
  {
    key: 'users',
    path: 'users',
    label: 'User Management',
    icon: Users,
    roles: ['super_admin'],
  },
  {
    key: 'members',
    path: 'members',
    label: 'Workspace Members',
    icon: Users,
    roles: ['super_admin', 'workspace_admin'],
  },
  {
    key: 'activity',
    path: 'activity',
    label: 'Activity Log',
    icon: Activity,
    roles: allRoles,
  },
  {
    key: 'audit',
    path: 'audit',
    label: 'Audit Log',
    icon: ShieldCheck,
    roles: ['super_admin', 'admin', 'workspace_admin'],
  },
  {
    key: 'settings',
    path: 'settings',
    label: 'Settings',
    icon: Settings,
    roles: ['super_admin', 'workspace_admin'],
  },
];

export function normalizeRole(value: string | null | undefined): Role {
  if (
    value === 'super_admin' ||
    value === 'admin' ||
    value === 'workspace_admin' ||
    value === 'approver' ||
    value === 'member'
  ) {
    return value;
  }
  return 'member';
}

export function getVisibleMenus(role: string | null | undefined) {
  const normalizedRole = normalizeRole(role);
  return menuItems.filter((item) => item.roles.includes(normalizedRole));
}

export function canAccess(role: string | null | undefined, path: string) {
  return getVisibleMenus(role).some((item) => item.path === path);
}
