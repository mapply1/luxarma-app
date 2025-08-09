"use client";

import { useState, useEffect } from "react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { User, Plus, Folder, UserStar, Search, Bell, CheckSquare } from "iconoir-react";
import { useRouter } from "next/navigation";

export function AdminCommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (action: string) => {
    setOpen(false);
    switch (action) {
      case "dashboard":
        router.push("/admin");
        break;
      case "clients":
        router.push("/admin/clients");
        break;
      case "prospects":
        router.push("/admin/prospects");
        break;
      case "notifications":
        router.push("/admin/notifications");
        break;
      case "projects":
        router.push("/admin/projects");
        break;
      case "tasks":
        router.push("/admin/tasks");
        break;
      case "new-client":
        router.push("/admin/clients?new=true");
        break;
      case "new-prospect":
        router.push("/admin/prospects?new=true");
        break;
      case "new-project":
        // This could open a modal or navigate to a new project page
        break;
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Rechercher ou naviguer..." />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
        <CommandGroup heading="Navigation rapide">
          <CommandItem onSelect={() => handleSelect("dashboard")}>
            <Folder />
            <span>Tableau de bord</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("clients")}>
            <User />
            <span>Clients</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("prospects")}>
            <UserStar />
            <span>Prospects</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("notifications")}>
            <Bell />
            <span>Notifications</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("projects")}>
            <Folder />
            <span>Projets</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("tasks")}>
            <CheckSquare />
            <span>Tâches</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions rapides">
          <CommandItem onSelect={() => handleSelect("new-client")}>
            <Plus />
            <span>Nouveau client (N)</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("new-prospect")}>
            <Plus />
            <span>Nouveau prospect (P)</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("new-project")}>
            <Plus />
            <span>Nouveau projet (P)</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("search-prospect")}>
            <Search />
            <span>Chercher prospect</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}