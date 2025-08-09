"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, X, CalendarIcon, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Task, Milestone } from "@/types";

interface TaskFilterBarProps {
  tasks: Task[];
  milestones: Milestone[];
  onFilterChange: (filteredTasks: Task[]) => void;
}

const statusLabels = {
  a_faire: 'À Faire',
  en_cours: 'En Cours',
  termine: 'Terminé'
};

const priorityLabels = {
  basse: 'Basse',
  moyenne: 'Moyenne',
  haute: 'Haute'
};

export function TaskFilterBar({ tasks, milestones, onFilterChange }: TaskFilterBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const applyFilters = (
    search: string,
    milestone: string,
    status: string,
    priority: string,
    from?: Date,
    to?: Date
  ) => {
    let filtered = tasks;

    // Filtrage par recherche textuelle
    if (search) {
      filtered = filtered.filter(task =>
        task.titre.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtrage par jalon
    if (milestone) {
      filtered = filtered.filter(task => task.milestone_id === milestone);
    }

    // Filtrage par statut
    if (status) {
      filtered = filtered.filter(task => task.statut === status);
    }

    // Filtrage par priorité
    if (priority) {
      filtered = filtered.filter(task => task.priorite === priority);
    }

    // Filtrage par date
    if (from) {
      filtered = filtered.filter(task => 
        task.date_echeance && new Date(task.date_echeance) >= from
      );
    }

    if (to) {
      filtered = filtered.filter(task => 
        task.date_echeance && new Date(task.date_echeance) <= to
      );
    }

    onFilterChange(filtered);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    applyFilters(value, selectedMilestone, selectedStatus, selectedPriority, dateFrom, dateTo);
  };

  const handleMilestoneChange = (milestone: string) => {
    setSelectedMilestone(milestone);
    applyFilters(searchTerm, milestone, selectedStatus, selectedPriority, dateFrom, dateTo);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    applyFilters(searchTerm, selectedMilestone, status, selectedPriority, dateFrom, dateTo);
  };

  const handlePriorityChange = (priority: string) => {
    setSelectedPriority(priority);
    applyFilters(searchTerm, selectedMilestone, selectedStatus, priority, dateFrom, dateTo);
  };

  const handleDateFromChange = (date?: Date) => {
    setDateFrom(date);
    applyFilters(searchTerm, selectedMilestone, selectedStatus, selectedPriority, date, dateTo);
  };

  const handleDateToChange = (date?: Date) => {
    setDateTo(date);
    applyFilters(searchTerm, selectedMilestone, selectedStatus, selectedPriority, dateFrom, date);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMilestone('');
    setSelectedStatus('');
    setSelectedPriority('');
    setDateFrom(undefined);
    setDateTo(undefined);
    onFilterChange(tasks);
  };

  const activeFiltersCount = [
    searchTerm,
    selectedMilestone,
    selectedStatus,
    selectedPriority,
    dateFrom,
    dateTo
  ].filter(Boolean).length;

  const getMilestoneName = (milestoneId: string) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    return milestone?.titre || 'Jalon inconnu';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Barre de recherche */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher des tâches..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          {/* Filtre par jalon */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[120px]">
                <Filter className="h-4 w-4 mr-2" />
                {selectedMilestone ? getMilestoneName(selectedMilestone) : 'Jalon'}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filtrer par jalon</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleMilestoneChange('')}>
                Tous les jalons
              </DropdownMenuItem>
              {milestones.map((milestone) => (
                <DropdownMenuItem
                  key={milestone.id}
                  onClick={() => handleMilestoneChange(milestone.id)}
                >
                  {milestone.titre}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtre par statut */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[120px]">
                {selectedStatus ? statusLabels[selectedStatus as keyof typeof statusLabels] : 'Statut'}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusChange('')}>
                Tous les statuts
              </DropdownMenuItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <DropdownMenuItem key={key} onClick={() => handleStatusChange(key)}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtre par priorité */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[120px]">
                {selectedPriority ? priorityLabels[selectedPriority as keyof typeof priorityLabels] : 'Priorité'}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filtrer par priorité</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handlePriorityChange('')}>
                Toutes les priorités
              </DropdownMenuItem>
              {Object.entries(priorityLabels).map(([key, label]) => (
                <DropdownMenuItem key={key} onClick={() => handlePriorityChange(key)}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtre par date */}
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[140px]">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateFrom ? format(dateFrom, 'dd/MM/yyyy', { locale: fr }) : 'Date début'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={handleDateFromChange}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[140px]">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateTo ? format(dateTo, 'dd/MM/yyyy', { locale: fr }) : 'Date fin'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={handleDateToChange}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Bouton effacer filtres */}
          {activeFiltersCount > 0 && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Effacer ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>

      {/* Badges des filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Recherche: "{searchTerm}"
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleSearchChange('')} />
            </Badge>
          )}
          {selectedMilestone && (
            <Badge variant="secondary" className="gap-1">
              Jalon: {getMilestoneName(selectedMilestone)}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleMilestoneChange('')} />
            </Badge>
          )}
          {selectedStatus && (
            <Badge variant="secondary" className="gap-1">
              Statut: {statusLabels[selectedStatus as keyof typeof statusLabels]}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleStatusChange('')} />
            </Badge>
          )}
          {selectedPriority && (
            <Badge variant="secondary" className="gap-1">
              Priorité: {priorityLabels[selectedPriority as keyof typeof priorityLabels]}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handlePriorityChange('')} />
            </Badge>
          )}
          {dateFrom && (
            <Badge variant="secondary" className="gap-1">
              Après: {format(dateFrom, 'dd/MM/yyyy', { locale: fr })}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleDateFromChange(undefined)} />
            </Badge>
          )}
          {dateTo && (
            <Badge variant="secondary" className="gap-1">
              Avant: {format(dateTo, 'dd/MM/yyyy', { locale: fr })}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleDateToChange(undefined)} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}