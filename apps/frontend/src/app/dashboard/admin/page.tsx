'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Users, Target, FileDown, Play, Pause, Lock } from 'lucide-react';

export default function AdminPage() {
  const { token, isAdmin } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [rounds, setRounds] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    try {
      const [dashboardData, roundsData, submissionsData] = await Promise.all([
        api.getDashboard(token!),
        api.getRounds(token!),
        api.getAllSubmissions(token!),
      ]);

      setDashboard(dashboardData);
      setRounds(roundsData);
      setSubmissions(submissionsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoundStateChange = async (roundId: string, state: string) => {
    try {
      await api.updateRoundState(roundId, state, token!);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update round state');
    }
  };

  const handleToggleChallenge = async (challengeId: string, isActive: boolean) => {
    try {
      await api.toggleChallenge(challengeId, isActive, token!);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle challenge');
    }
  };

  const handleExportResults = async () => {
    try {
      const results = await api.exportResults(token!);
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `htb-results-${new Date().toISOString()}.json`;
      a.click();
    } catch (err: any) {
      alert(err.message || 'Failed to export results');
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Admin Panel</h2>
          <p className="text-muted-foreground">Manage the competition</p>
        </div>
        <Button onClick={handleExportResults} className="gap-2">
          <FileDown className="h-4 w-4" />
          Export Results
        </Button>
      </div>

      {/* Stats Overview */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.teams.total}</div>
              <p className="text-xs text-muted-foreground">
                {dashboard.teams.active} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.submissions.total}</div>
              <p className="text-xs text-muted-foreground">
                {dashboard.submissions.correct} correct
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboard.submissions.total > 0
                  ? Math.round((dashboard.submissions.correct / dashboard.submissions.total) * 100)
                  : 0}
                %
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Rounds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboard.rounds.filter((r: any) => r.state === 'ACTIVE').length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Tabs */}
      <Tabs defaultValue="rounds">
        <TabsList>
          <TabsTrigger value="rounds">Rounds</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        {/* Rounds Management */}
        <TabsContent value="rounds" className="space-y-4">
          {rounds.map((round) => (
            <Card key={round.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Round {round.number}: {round.name}</span>
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      round.state === 'ACTIVE'
                        ? 'bg-green-500/20 text-green-500'
                        : round.state === 'ENDED'
                        ? 'bg-gray-500/20 text-gray-500'
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}
                  >
                    {round.state}
                  </span>
                </CardTitle>
                <CardDescription>{round.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRoundStateChange(round.id, 'ACTIVE')}
                    disabled={round.state === 'ACTIVE'}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Activate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRoundStateChange(round.id, 'LOCKED')}
                    disabled={round.state === 'LOCKED'}
                    className="gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Lock
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRoundStateChange(round.id, 'ENDED')}
                    disabled={round.state === 'ENDED'}
                    className="gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    End
                  </Button>
                </div>

                {/* Challenges in this round */}
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Challenges:</p>
                  <div className="space-y-2">
                    {round.challenges.map((challenge: any) => (
                      <div
                        key={challenge.id}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <span className="text-sm">{challenge.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {challenge.points} pts
                          </span>
                          <Button
                            size="sm"
                            variant={challenge.isActive ? 'destructive' : 'default'}
                            onClick={() =>
                              handleToggleChallenge(challenge.id, !challenge.isActive)
                            }
                          >
                            {challenge.isActive ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Challenges Management */}
        <TabsContent value="challenges">
          <Card>
            <CardHeader>
              <CardTitle>All Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Round</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rounds.flatMap((round) =>
                    round.challenges.map((challenge: any) => (
                      <TableRow key={challenge.id}>
                        <TableCell className="font-medium">{challenge.title}</TableCell>
                        <TableCell>Round {round.number}</TableCell>
                        <TableCell>{challenge.type}</TableCell>
                        <TableCell className="text-right">{challenge.points}</TableCell>
                        <TableCell>
                          {challenge.isActive ? (
                            <span className="text-green-500">Active</span>
                          ) : (
                            <span className="text-muted-foreground">Inactive</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleToggleChallenge(challenge.id, !challenge.isActive)
                            }
                          >
                            {challenge.isActive ? 'Disable' : 'Enable'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submissions Log */}
        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Last 50 submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Challenge</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.slice(0, 50).map((sub: any) => (
                    <TableRow key={sub.id}>
                      <TableCell className="text-sm">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>{sub.team.name}</TableCell>
                      <TableCell className="text-muted-foreground">{sub.user.username}</TableCell>
                      <TableCell>{sub.challenge.title}</TableCell>
                      <TableCell>
                        {sub.isCorrect ? (
                          <span className="text-green-500 font-semibold">✓ Correct</span>
                        ) : (
                          <span className="text-destructive">✗ Incorrect</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{sub.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
