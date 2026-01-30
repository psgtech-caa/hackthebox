'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Users, Trophy, Flag, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [teamStats, setTeamStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [profileData, roundData] = await Promise.all([
          api.getProfile(),
          api.getCurrentRound(),
        ]);

        setUser(profileData);
        setCurrentRound(roundData);

        if (profileData.team) {
          const stats = await api.getTeamStats(profileData.team.id);
          setTeamStats(stats);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Hack The Box</h1>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/challenges">
              <Button variant="ghost">Challenges</Button>
            </Link>
            <Link href="/scoreboard">
              <Button variant="ghost">Scoreboard</Button>
            </Link>
            {user?.role === 'ADMIN' && (
              <Link href="/admin">
                <Button variant="ghost">Admin</Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Welcome, {user?.username}!</h2>
          <p className="text-muted-foreground">
            {user?.team ? `Team: ${user.team.name}` : 'You are not in a team yet'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Team</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.team ? user.team.name : 'No Team'}
              </div>
              {!user?.team && (
                <Link href="/challenges">
                  <Button className="mt-4" size="sm">Join or Create Team</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamStats?.totalPoints || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {teamStats?.solvedChallenges || 0} challenges solved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Round</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentRound ? currentRound.name : 'No Active Round'}
              </div>
              {currentRound && (
                <p className="text-xs text-muted-foreground">
                  {currentRound.challenges?.length || 0} challenges available
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {currentRound && (
          <Card>
            <CardHeader>
              <CardTitle>{currentRound.name}</CardTitle>
              <CardDescription>{currentRound.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                Round Type: <span className="font-semibold">{currentRound.type}</span>
              </p>
              <Link href="/challenges">
                <Button>View Challenges</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!currentRound && (
          <Card>
            <CardHeader>
              <CardTitle>No Active Round</CardTitle>
              <CardDescription>
                The competition hasn't started yet. Check back later!
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  );
}
