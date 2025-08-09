"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { InstantFeedbackLink } from "@/components/ui/instant-feedback-link";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Home, 
  MapPin, 
  CheckSquare, 
  FileText, 
  MessageSquare,
  Star,
  Bell,
  Folder
} from "lucide-react";
import { ArrowSeparateVertical } from "iconoir-react";
import { cn } from "@/lib/utils";
import { 
  useCurrentClient, 
  useCurrentClientProjects, 
  useClientProject, 
  useClientTasks, 
  useClientDocuments, 
  useClientTickets
} from "@/hooks/use-client-data";
import { useClientUnreadNotificationsCount } from "@/hooks/use-client-notifications";
import { LogoutButton } from "@/components/auth/logout-button";

const navigation = [
  {
    name: "Aperçu du Projet",
    href: "/app",
    icon: Home,
    showCount: false,
  },
  {
    name: "Feuille de Route",
    href: "/app/roadmap",
    icon: MapPin,
    showCount: false,
  },
  {
    name: "Tâches",
    href: "/app/tasks",
    icon: CheckSquare,
    showCount: true,
    countKey: "tasks",
  },
  {
    name: "Documents",
    href: "/app/documents",
    icon: FileText,
    showCount: true,
    countKey: "documents",
  },
  {
    name: "Réclamations",
    href: "/app/tickets",
    icon: MessageSquare,
    showCount: true,
    countKey: "tickets",
  },
  {
    name: "Évaluation",
    href: "/app/review",
    icon: Star,
    showCount: false,
  },
  {
    name: "Notifications",
    href: "/app/notifications",
    icon: Bell,
    showCount: true,
    countKey: "notifications",
  },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get('project');
  
  // Utiliser React Query pour les données avec cache
  const { data: currentClient } = useCurrentClient();
  const { data: allClientProjects = [] } = useCurrentClientProjects();
  const { data: project } = useClientProject(selectedProjectId || undefined);
  const { data: tasks = [] } = useClientTasks(project?.id);
  const { data: documents = [] } = useClientDocuments(project?.id);
  const { data: tickets = [] } = useClientTickets(project?.id);
  const { data: unreadNotifications = 0 } = useClientUnreadNotificationsCount();

  const counts = {
    tasks: tasks.length,
    documents: documents.length,
    tickets: tickets.length,
    notifications: unreadNotifications,
  };

  const formatCount = (count: number): string => {
    return count > 10 ? '9+' : count.toString();
  };

  // If no project is selected and we have projects, select the first one
  useEffect(() => {
    if (!selectedProjectId && allClientProjects.length > 0 && !project) {
      const mostRecentProject = allClientProjects[0]; // Already sorted by created_at desc
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('project', mostRecentProject.id);
      router.replace(`${pathname}?${newSearchParams.toString()}`);
    }
  }, [selectedProjectId, allClientProjects, project, pathname, searchParams, router]);

  const handleProjectSwitch = (projectId: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('project', projectId);
    router.replace(`${pathname}?${newSearchParams.toString()}`);
  };

  return (

    <div className="w-64 h-full p-6 flex flex-col">
      <div className="space-y-6">
        <div className="flex items-center justify-center mb-8 p-3 bg-white/10 rounded-lg">
          <img 
            src="https://ycdyarkrxkhqkpkzvdno.supabase.co/storage/v1/object/public/assets//LOGO.png" 
            alt="Luxarma Logo" 
            className="h-6 w-auto max-w-none object-contain"
          />
        </div>
        
        {/* Client greeting */}
        {currentClient && (
          <div className="mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 h-auto p-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Bonjour {currentClient.prenom} 👋</span>
                    <ArrowSeparateVertical className="h-4 w-4 text-white/60" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuItem disabled className="font-medium">
                  Vos projets ({allClientProjects.length})
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {allClientProjects.map((proj) => (
                  <DropdownMenuItem 
                    key={proj.id}
                    onClick={() => handleProjectSwitch(proj.id)}
                    className={cn(
                      "cursor-pointer",
                      proj.id === project?.id && "bg-blue-50"
                    )}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{proj.titre}</p>
                        <p className="text-xs text-slate-500 truncate">{proj.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs px-1 py-0",
                              proj.statut === 'termine' ? 'border-green-500 text-green-700' :
                              proj.statut === 'en_cours' ? 'border-blue-500 text-blue-700' :
                              'border-yellow-500 text-yellow-700'
                            )}
                          >
                            {proj.statut === 'termine' ? 'Terminé' :
                             proj.statut === 'en_cours' ? 'En cours' : 'En attente'}
                          </Badge>
                          {proj.id === project?.id && (
                            <span className="text-xs text-blue-600 font-medium">Actuel</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                {allClientProjects.length === 0 && (
                  <DropdownMenuItem disabled>
                    Aucun projet disponible
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const count = item.countKey ? counts[item.countKey as keyof typeof counts] : 0;
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
                        ? "bg-blue-500 text-white animate-pulse" 
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