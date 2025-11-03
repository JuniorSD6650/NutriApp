'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UsersIcon, 
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Usuarios', href: '/dashboard/users', icon: UsersIcon },
  { name: 'Niños', href: '/dashboard/children', icon: UserGroupIcon },
  { name: 'Estadísticas', href: '/dashboard/stats', icon: ChartBarIcon },
  { name: 'Registros', href: '/dashboard/records', icon: DocumentTextIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-white w-64 shadow-lg">
      <div className="flex items-center justify-center h-16 bg-green-600">
        <span className="text-white text-xl font-bold">NutriMama Admin</span>
      </div>
      
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                } group flex items-center px-2 py-2 text-sm font-medium border-l-4 transition-colors duration-200`}
              >
                <item.icon
                  className={`${
                    isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 h-5 w-5`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
