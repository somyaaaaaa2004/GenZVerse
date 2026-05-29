import { useGetDashboardStats, useGetDashboardActivity } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useGetDashboardActivity();

  if (statsLoading || activitiesLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Your Universe</h1>
          <p className="text-muted-foreground mt-1">Level {stats?.level || 1} • {stats?.xp || 0} XP • {stats?.streak || 0} Day Streak</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-card border-border/50">
          <h3 className="font-semibold text-lg mb-2">Life Score</h3>
          <p className="text-4xl font-display font-bold text-primary">{stats?.lifeScore || 0}</p>
        </Card>
        <Card className="p-6 bg-card border-border/50">
          <h3 className="font-semibold text-lg mb-2">Productivity</h3>
          <p className="text-4xl font-display font-bold text-secondary">{stats?.productivityScore || 0}</p>
        </Card>
        <Card className="p-6 bg-card border-border/50">
          <h3 className="font-semibold text-lg mb-2">Social</h3>
          <p className="text-4xl font-display font-bold text-accent">{stats?.socialScore || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-display font-bold mb-4">Recent Activity</h2>
          <Card className="bg-card border-border/50 overflow-hidden">
            <div className="divide-y divide-border/50">
              {activities?.length ? (
                activities.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <p className="font-medium">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{new Date(activity.createdAt).toLocaleDateString()}</span>
                      {activity.xpEarned && (
                        <span className="text-xs font-bold text-accent">+{activity.xpEarned} XP</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">No recent activity. Get out there!</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
