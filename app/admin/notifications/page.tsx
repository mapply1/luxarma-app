"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from "@/hooks/use-notifications";
import { useProjectComments } from "@/hooks/use-comments";
import { Bell, MessageSquare, MessageCircle, Star, CheckCircle, Eye, Clock, User } from "lucide-react";
import { Notification } from "@/types";
import { CommentsSection } from "@/components/client/comments-section";
import Link from "next/link";

// Dynamic import for better performance
const AdminCommandPalette = dynamic(() => import("@/components/admin/admin-command-palette").then((mod) => ({ default: mod.AdminCommandPalette })), { ssr: false });

const notificationTypeLabels = {
  comment: 'Commentaire',
  ticket: 'Réclamations', 
  review: 'Évaluation',
  task_created: 'Nouvelle tâche',
  task_updated: 'Tâche modifiée',
  milestone_created: 'Nouvelle étape',
  milestone_updated: 'Étape modifiée',
  document_uploaded: 'Nouveau document'
};

const notificationTypeIcons = {
  comment: MessageCircle,
  ticket: MessageSquare,
  review: Star,
  task_created: Bell,
  task_updated: CheckCircle,
  milestone_created: Star,
  milestone_updated: CheckCircle,
  document_uploaded: Bell
};

const notificationTypeColors = {
  comment: 'bg-blue-100 text-blue-800',
  ticket: 'bg-orange-100 text-orange-800',
  review: 'bg-green-100 text-green-800',
  task_created: 'bg-blue-100 text-blue-800',
  task_updated: 'bg-green-100 text-green-800',
  milestone_created: 'bg-purple-100 text-purple-800',
  milestone_updated: 'bg-purple-100 text-purple-800',
  document_uploaded: 'bg-orange-100 text-orange-800'
};

interface NotificationCardProps {
  notification: Notification;
  onNotificationClick: (notification: Notification) => void;
  formatDateRelative: (dateString: string) => string;
}

const NotificationCard = ({ notification, onNotificationClick, formatDateRelative }: NotificationCardProps) => {
  const TypeIcon = notificationTypeIcons[notification.type];
  
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        !notification.is_read ? 'border-blue-200 bg-blue-50/30' : 'hover:bg-slate-50'
      }`}
      onClick={() => onNotificationClick(notification)}
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
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
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
              <User className="h-3 w-3" />
              <span>{notification.client?.prenom} {notification.client?.nom}</span>
              <span>•</span>
              <span>{notification.project?.titre}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AdminNotificationsPage() {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: notifications = [], isLoading: loading } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);
  
  const commentNotifications = notifications.filter(n => n.type === 'comment');
  const ticketNotifications = notifications.filter(n => n.type === 'ticket');
  const reviewNotifications = notifications.filter(n => n.type === 'review');

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsReadMutation.mutateAsync(notification.id);
    }
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
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
      <AdminCommandPalette />
      
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bell className="h-6 w-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              {unreadNotifications.length > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadNotifications.length} non lues
                </Badge>
              )}
            </div>
            <p className="text-gray-600">
              Suivez toutes les activités de vos clients en temps réel
            </p>
          </div>
          
          {unreadNotifications.length > 0 && (
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
              <Bell className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{unreadNotifications.length}</div>
              <CardDescription>Nécessitent attention</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commentaires</CardTitle>
              <MessageCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{commentNotifications.length}</div>
              <CardDescription>Sur tâches et jalons</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Réclamations</CardTitle>
              <MessageSquare className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{ticketNotifications.length}</div>
              <CardDescription>Demandes support</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Évaluations</CardTitle>
              <Star className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{reviewNotifications.length}</div>
              <CardDescription>Retours clients</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Tabs des notifications */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              Toutes ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Non lues ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="comments">
              Commentaires ({commentNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="tickets">
              Support ({ticketNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Toutes les notifications</CardTitle>
                <CardDescription>
                  Historique complet de toutes les activités clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <NotificationCard 
                      key={notification.id} 
                      notification={notification} 
                      onNotificationClick={handleNotificationClick}
                      formatDateRelative={formatDateRelative}
                    />
                  ))}
                  {notifications.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium mb-2">Aucune notification</p>
                      <p>Les activités de vos clients apparaîtront ici.</p>
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
                  Nouvelles activités nécessitant votre attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unreadNotifications.map((notification) => (
                    <NotificationCard 
                      key={notification.id} 
                      notification={notification} 
                      onNotificationClick={handleNotificationClick}
                      formatDateRelative={formatDateRelative}
                    />
                  ))}
                  {unreadNotifications.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                      <p className="text-lg font-medium mb-2">Tout est à jour !</p>
                      <p>Aucune nouvelle notification à traiter.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle>Commentaires clients</CardTitle>
                <CardDescription>
                  Commentaires laissés par vos clients sur les tâches et jalons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commentNotifications.map((notification) => (
                    <NotificationCard 
                      key={notification.id} 
                      notification={notification} 
                      onNotificationClick={handleNotificationClick}
                      formatDateRelative={formatDateRelative}
                    />
                  ))}
                  {commentNotifications.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium mb-2">Aucun commentaire</p>
                      <p>Les commentaires clients apparaîtront ici.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Tickets de support</CardTitle>
                <CardDescription>
                  Nouveaux tickets créés par vos clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ticketNotifications.map((notification) => (
                    <NotificationCard 
                      key={notification.id} 
                      notification={notification} 
                      onNotificationClick={handleNotificationClick}
                      formatDateRelative={formatDateRelative}
                    />
                  ))}
                  {ticketNotifications.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium mb-2">Aucun ticket</p>
                      <p>Les nouvelles réclamations apparaîtront ici.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de détails */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotification && (
                <>
                  {(() => {
                    const TypeIcon = notificationTypeIcons[selectedNotification.type];
                    return <TypeIcon className="h-5 w-5 text-blue-600" />;
                  })()}
                  {selectedNotification.title}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedNotification && (
                <>
                  De {selectedNotification.client?.prenom} {selectedNotification.client?.nom} • 
                  {selectedNotification.project?.titre} • 
                  {formatDate(selectedNotification.created_at)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-700">{selectedNotification.message}</p>
              </div>
              
              <div className="flex justify-center">
                <Link href={`/admin/projects/${selectedNotification.projet_id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Eye className="h-4 w-4 mr-2" />
                    Voir le projet complet
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}