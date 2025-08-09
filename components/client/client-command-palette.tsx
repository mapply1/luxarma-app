"use client";

import { useState, useEffect, useTransition } from "react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Home, MapPin, CheckSquare, FileText, MessageSquare, Star, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ClientCommandPaletteProps {
  projectId?: string;
}

export function ClientCommandPalette({ projectId }: ClientCommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
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
    startTransition(() => {
      switch (action) {
        case "overview":
          router.push("/app");
          break;
        case "roadmap":
          router.push("/app/roadmap");
          break;
        case "tasks":
          router.push("/app/tasks");
          break;
        case "documents":
          router.push("/app/documents");
          break;
        case "tickets":
          router.push("/app/tickets");
          break;
        case "review":
          router.push("/app/review");
          break;
        case "create-ticket":
          router.push("/app/tickets");
          break;
      }
    });
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Rechercher ou naviguer..." />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
        <CommandGroup heading="Navigation rapide">
          <CommandItem onSelect={() => handleSelect("overview")}>
            <Home className="mr-2 h-4 w-4" />
            <span>Aperçu du projet</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("roadmap")}>
            <MapPin className="mr-2 h-4 w-4" />
            <span>Feuille de route</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("tasks")}>
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>Toutes les tâches</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("documents")}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Documents</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("tickets")}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Tickets de support</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("review")}>
            <Star className="mr-2 h-4 w-4" />
            <span>Évaluation</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions rapides">
          <CommandItem onSelect={() => handleSelect("create-ticket")}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Créer un ticket</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}