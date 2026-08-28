import { Navigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimeAgo } from "@/data/mockData";

export default function NotificationsPage() {
  const { user, loading, notifications, markNotificationRead, markAllNotificationsRead, unreadCount } = useAuth();

  if (loading) {
    return <div className="container py-10 text-center text-muted-foreground">Loading notifications...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display font-bold text-3xl flex items-center gap-2">
          <Bell className="w-6 h-6" /> Notifications
        </h1>
        {notifications.length > 0 && (
          <Button variant="outline" onClick={markAllNotificationsRead}>
            <CheckCheck className="w-4 h-4 mr-1" /> Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">{unreadCount} unread</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border">
          {notifications.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground text-center">You have no notifications yet.</p>
          )}

          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`w-full text-left p-4 transition-colors hover:bg-muted/40 ${!n.read ? "bg-alert/5" : ""}`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.read ? "bg-alert" : "bg-muted"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(n.timestamp)}</p>
                </div>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
