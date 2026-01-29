'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Shield, Trophy, Target, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">HACK-THE-BOX</h1>
            <p className="text-sm text-muted-foreground">Decode. Discover. Defend.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/challenges">
              <Button variant="ghost" className="gap-2">
                <Target className="h-4 w-4" />
                Challenges
              </Button>
            </Link>
            <Link href="/dashboard/scoreboard">
              <Button variant="ghost" className="gap-2">
                <Trophy className="h-4 w-4" />
                Scoreboard
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/dashboard/admin">
                <Button variant="ghost" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
