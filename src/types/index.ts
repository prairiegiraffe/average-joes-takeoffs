export interface Project {
  id: string;
  name: string;
  date: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
}

export interface User {
  name: string;
  email: string;
  company: string;
}