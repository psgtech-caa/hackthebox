'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { Trophy, Medal, Award, LogOut } from 'lucide-react';

export default function ScoreboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [scoreboard, setScoreboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
    
    // SSE for real-time updates
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/scoreboard/live`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setScoreboard(data);
      } catch (error) {
        console.error('Failed to parse SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [router]);

  const loadData = async () => {
    try {
      const [profileData, scoreboardData] = await Promise.all([
        api.getProfile(),
        api.getScoreboard(),
      ]);

      setUser(profileData);
      setScoreboard(scoreboardData);
    } catch (error) {
      console.error('Failed to load scoreboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
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
          <h2 className="text-3xl font-bold mb-2">Scoreboard</h2>
          <p className="text-muted-foreground">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
            Live rankings • Real-time updates via SSE
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Rankings</CardTitle>
            <CardDescription>
              Sorted by total points, then by time of last solve
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scoreboard.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Rank</TableHead>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">Last Solve</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoreboard.map((team) => {
                    const isMyTeam = user?.team?.id === team.teamId;
                    return (
                      <TableRow 
                        key={team.teamId} 
                        className={isMyTeam ? 'bg-primary/5' : ''}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getRankIcon(team.rank)}
                            <span>#{team.rank}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">
                            {team.teamName}
                            {isMyTeam && (
                              <span className="ml-2 text-xs text-primary">(Your Team)</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {team.members?.slice(0, 3).join(', ')}
                            {team.members?.length > 3 && '...'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-xl font-bold text-primary">
                            {team.totalPoints}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {team.lastSolved 
                            ? new Date(team.lastSolved).toLocaleString() 
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No scores yet. Be the first to solve a challenge!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
