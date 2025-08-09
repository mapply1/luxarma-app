"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { InstantFeedbackLink } from "@/components/ui/instant-feedback-link";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Dashboard, 
  User, 
  Folder, 
  UserStar,
  Settings,
  Bell,
  Building,
  CheckSquare
} from "iconoir-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { LogoutButton } from "@/components/auth/logout-button";
import { useUnreadNotificationsCount } from "@/hooks/use-notifications";

const navigation = [
  {
    name: "Tableau de Bord",
    href: "/admin",
    icon: Dashboard,
    showCount: false,
  },
  {
    name: "Projets",
    href: "/admin/projects",
    icon: Folder,
    showCount: true,
    countKey: "projects",
  },
  {
    name: "Clients",
    href: "/admin/clients",
    icon: User,
    showCount: true,
    countKey: "clients",
  },
  {
    name: "Prospects",
    href: "/admin/prospects",
    icon: UserStar,
    showCount: true,
    countKey: "prospects",
  },
 {
    name: "Tâches",
    href: "/admin/tasks",
    icon: CheckSquare,
    showCount: true,
    countKey: "tasks",
  },
  {
    name: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    showCount: true,
    countKey: "notifications",
  },
  {
    name: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
    showCount: false,
  },
];

interface Counts {
  clients: number;
  prospects: number;
  notifications: number;
  projects: number;
  tasks: number;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const [counts, setCounts] = useState<Counts>({
    clients: 0,
    prospects: 0,
    notifications: 0,
    projects: 0,
    tasks: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Get total clients count
        const { count: clientsCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });

        // Get active prospects count (not converted, not archived)
        const { count: prospectsCount } = await supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .not('statut', 'in', '("converti","archive")');

        // Get active projects count (not finished)
        const { count: projectsCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .neq('statut', 'termine');

        // Get active tasks count (to do and in progress only)
        const { count: tasksCount } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .in('statut', ['a_faire', 'en_cours']);


        setCounts({
          clients: clientsCount || 0,
          prospects: prospectsCount || 0,
          notifications: unreadCount,
          projects: projectsCount || 0,
          tasks: tasksCount || 0,
        });
      } catch (error) {
        console.error('Error fetching sidebar counts:', error);
      }
    };

    fetchCounts();

    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [unreadCount]);

  // Update notifications count when unreadCount changes
  useEffect(() => {
    setCounts(prev => ({
      ...prev,
      notifications: unreadCount
    }));
  }, [unreadCount]);

  const formatCount = (count: number): string => {
    return count > 10 ? '9+' : (count || 0).toString();
  };

  return (
    <div className="w-64 h-full p-6 flex flex-col">
      <div className="space-y-6">
        <div className="flex items-center justify-center mb-8 p-3 bg-white/10 rounded-lg">
          <img 
            src="https://ycdyarkrxkhqkpkzvdno.supabase.co/storage/v1/object/public/assets//LOGO.png" 
            alt="Luxarma Logo" 
            className="h-5 w-auto max-w-none object-contain"
          />
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
                            (item.href !== '/admin' && pathname.startsWith(item.href));
            const count = item.countKey ? counts[item.countKey as keyof Counts] : 0;
            return (
              <InstantFeedbackLink key={item.name} href={item.href} className="w-full">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-between",
                    isActive 
                      ? "bg-white text-blue-600 hover:bg-gray-100" 
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </div>
                  {item.showCount && (
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      item.countKey === "notifications" && count > 0
                        ? "bg-red-500 text-white animate-pulse" 
                        : "",
                      isActive 
                        ? "bg-blue-100 text-blue-600" 
                        : "bg-white/20 text-white/80"
                    )}>
                      {formatCount(count)}
                    </span>
                  )}
                </Button>
              </InstantFeedbackLink>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto">
        <LogoutButton 
          className="w-full text-white/80 hover:text-white hover:bg-white/10" 
          variant="ghost" 
        />
      </div>
    </div>
  );
}