"use client";

import { useState, useEffect } from "react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, Upload, FileText, MessageSquare, CheckCircle } from "lucide-react";

interface CommandPaletteProps {
  projectId: string;
  onCreateTask: () => void;
  onUploadDocument: () => void;
  onCreateTicket: () => void;
  onCompleteProject: () => void;
}

export function CommandPalette({ 
  projectId, 
  onCreateTask, 
  onUploadDocument, 
  onCreateTicket, 
  onCompleteProject 
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

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
      case "create-task":
        onCreateTask();
        break;
      case "upload-document":
        onUploadDocument();
        break;
      case "create-ticket":
        onCreateTicket();
        break;
      case "complete-project":
        onCompleteProject();
        break;
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Tapez une commande ou recherchez..." />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
        <CommandGroup heading="Actions rapides">
          <CommandItem onSelect={() => handleSelect("create-task")}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Créer une tâche</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("upload-document")}>
            <Upload className="mr-2 h-4 w-4" />
            <span>Télécharger un document</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("create-ticket")}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Créer un ticket</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("complete-project")}>
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>Marquer comme terminé</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}