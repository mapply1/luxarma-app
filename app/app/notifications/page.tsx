"use client";

import dynamic from "next/dynamic";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientNotifications, useClientUnreadNotificationsCount, useMarkClientNotificationAsRead, useMarkAllClientNotificationsAsRead } from "@/hooks/use-client-notifications";
import { Bell, CheckSquare, FileText, Target, MessageCircle, Star, CheckCircle, Eye, Calendar, Clock } from "lucide-react";
import { Notification } from "@/types";
import Link from "next/link";

// Dynamic import for better performance
const ClientCommandPalette = dynamic(() => import("@/components/client/client-command-palette").then((mod) => ({ default: mod.ClientCommandPalette })), { ssr: false });

const notificationTypeLabels = {
  task_created: 'Nouvelle tâche',
  task_updated: 'Tâche mise à jour',
  milestone_created: 'Nouvelle étape',
  milestone_updated: 'Étape mise à jour',
  document_uploaded: 'Nouveau document',
  comment: 'Commentaire',
  ticket: 'Réclamation',
  review: 'Évaluation'
};

const notificationTypeIcons = {
  task_created: CheckSquare,
  task_updated: CheckSquare,
  milestone_created: Target,
  milestone_updated: Target,
  document_uploaded: FileText,
  comment: MessageCircle,
  ticket: MessageCircle,
  review: Star
};

const notificationTypeColors = {
  task_created: 'bg-blue-100 text-blue-800',
  task_updated: 'bg-green-100 text-green-800',
  milestone_created: 'bg-purple-100 text-purple-800',
  milestone_updated: 'bg-indigo-100 text-indigo-800',
  document_uploaded: 'bg-orange-100 text-orange-800',
  comment: 'bg-cyan-100 text-cyan-800',
  ticket: 'bg-red-100 text-red-800',
  review: 'bg-emerald-100 text-emerald-800'
};

function ClientNotificationsContent() {
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get('project');
  
  const { data: notifications = [], isLoading: loading } = useClientNotifications();
  const { data: unreadCount = 0 } = useClientUnreadNotificationsCount();
  const markAsReadMutation = useMarkClientNotificationAsRead();
  const markAllAsReadMutation = useMarkAllClientNotificationsAsRead();

  // Filter notifications by project if selected
  const filteredNotifications = selectedProjectId 
    ? notifications.filter(n => n.projet_id === selectedProjectId)
    : notifications;

  const unreadNotifications = filteredNotifications.filter(n => !n.is_read);
  const readNotifications = filteredNotifications.filter(n => n.is_read);
  
  // Group by type
  const taskNotifications = filteredNotifications.filter(n => ['task_created', 'task_updated'].includes(n.type));
  const milestoneNotifications = filteredNotifications.filter(n => ['milestone_created', 'milestone_updated'].includes(n.type));
  const documentNotifications = filteredNotifications.filter(n => n.type === 'document_uploaded');

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsReadMutation.mutateAsync(notification.id);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateRelative = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return formatDate(dateString);
  };

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const TypeIcon = notificationTypeIcons[notification.type];
    
    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${
          !notification.is_read ? 'border-blue-200 bg-blue-50/30' : 'hover:bg-slate-50'
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${
              !notification.is_read ? 'bg-blue-100' : 'bg-slate-100'
            }`}>
              <TypeIcon className={`h-4 w-4 ${
                !notification.is_read ? 'text-blue-600' : 'text-slate-600'
              }`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h4 className={`font-medium ${
                    !notification.is_read ? 'text-slate-900' : 'text-slate-700'
                  }`}>
                    {notification.title}
                  </h4>
                  <Badge className={notificationTypeColors[notification.type]}>
                    {notificationTypeLabels[notification.type]}
                  </Badge>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {formatDateRelative(notification.created_at)}
                </span>
              </div>
              
              <p className={`text-sm mb-2 ${
                !notification.is_read ? 'text-slate-700' : 'text-slate-600'
              }`}>
                {notification.message}
              </p>
              
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{notification.project?.titre}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-16 bg-slate-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ClientCommandPalette />
      
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bell className="h-6 w-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <Badge className="bg-blue-500 text-white">
                  {unreadCount} non lues
                </Badge>
              )}
            </div>
            <p className="text-gray-600">
              Suivez toutes les activités sur votre projet en temps réel
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button 
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Non Lues</CardTitle>
              <Bell className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{unreadCount}</div>
              <CardDescription>Nouvelles activités</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tâches</CardTitle>
              <CheckSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{taskNotifications.length}</div>
              <CardDescription>Créations et mises à jour</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Étapes</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{milestoneNotifications.length}</div>
              <CardDescription>Jalons et progressions</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{documentNotifications.length}</div>
              <CardDescription>Nouveaux fichiers</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Tabs des notifications */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              Toutes ({filteredNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Non lues ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="tasks">
              Tâches ({taskNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="milestones">
              Étapes ({milestoneNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="documents">
              Documents ({documentNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Toutes les notifications</CardTitle>
                <CardDescription>
                  Historique complet de toutes les activités sur votre projet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))}
                  {filteredNotifications.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium mb-2">Aucune notification</p>
                      <p>Les activités sur votre projet apparaîtront ici.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unread">
            <Card>
              <CardHeader>
                <CardTitle>Notifications non lues</CardTitle>
                <CardDescription>
                  Nouvelles activités sur votre projet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unreadNotifications.map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))}
                  {unreadNotifications.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                      <p className="text-lg font-medium mb-2">Tout est à jour !</p>
                      <p>Aucune nouvelle notification à consulter.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Notifications sur les tâches</CardTitle>
                <CardDescription>
                  Nouvelles tâches et changements de statut
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taskNotifications.map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))}
                  {taskNotifications.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <CheckSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium mb-2">Aucune notification sur les tâches</p>
                      <p>Les nouvelles tâches et leurs mises à jour apparaîtront ici.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones">
            <Card>
              <CardHeader>
                <CardTitle>Notifications sur les étapes</CardTitle>
                <CardDescription>
                  Nouvelles étapes et progressions des jalons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestoneNotifications.map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))}
                  {milestoneNotifications.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <Target className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium mb-2">Aucune notification sur les étapes</p>
                      <p>Les nouvelles étapes et leur progression apparaîtront ici.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Notifications sur les documents</CardTitle>
                <CardDescription>
                  Nouveaux documents partagés par l'équipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documentNotifications.map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))}
                  {documentNotifications.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium mb-2">Aucune notification sur les documents</p>
                      <p>Les nouveaux documents partagés apparaîtront ici.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Section d'aide */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">À propos des notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Vous serez notifié quand :</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Une nouvelle tâche est créée</li>
                  <li>• Le statut d'une tâche change</li>
                  <li>• Une nouvelle étape est ajoutée</li>
                  <li>• Une étape progresse</li>
                  <li>• Un nouveau document est partagé</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Types de notifications :</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• <span className="text-blue-600">Bleues</span> : Nouvelles tâches</li>
                  <li>• <span className="text-green-600">Vertes</span> : Tâches terminées</li>
                  <li>• <span className="text-purple-600">Violettes</span> : Nouvelles étapes</li>
                  <li>• <span className="text-orange-600">Oranges</span> : Nouveaux documents</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function ClientNotificationsPage() {
  return (
    <Suspense fallback={
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ClientNotificationsContent />
    </Suspense>
  );
}