'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from '@/components/ui/table';
import { api } from '@/lib/api';
import { Users, Trophy, Flag, FileText, Settings, LogOut, AlertTriangle, Download, Lock, Unlock, Ban } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [rounds, setRounds] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoreboardFrozen, setScoreboardFrozen] = useState(false);
  
  // Score adjustment
  const [adjustScoreTeamId, setAdjustScoreTeamId] = useState('');
  const [adjustPoints, setAdjustPoints] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  
  // Disqualification
  const [disqualifyTeamId, setDisqualifyTeamId] = useState('');
  const [disqualifyReason, setDisqualifyReason] = useState('');
  
  // Round creation
  const [newRound, setNewRound] = useState({
    name: '',
    type: 'DECODE_THE_SECRET',
    order: 1,
    description: '',
  });
  
  // Challenge creation
  const [newChallenge, setNewChallenge] = useState({
    roundId: '',
    title: '',
    description: '',
    points: 100,
    flag: '',
    order: 1,
    maxAttempts: 0,
    hints: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [profileData, statsData, roundsData, submissionsData, teamsData] = await Promise.all([
        api.getProfile(),
        api.admin.getStats(),
        api.getAllRounds(),
        api.admin.getAllSubmissions(),
        api.getAllTeams(),
      ]);

      if (profileData.role !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }

      setUser(profileData);
      setStats(statsData);
      setRounds(roundsData);
      setSubmissions(submissionsData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createRound(newRound);
      await loadData();
      setNewRound({ name: '', type: 'DECODE_THE_SECRET', order: 1, description: '' });
      alert('Round created successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to create round');
    }
  };

  const handleUpdateRoundStatus = async (roundId: string, status: string) => {
    try {
      await api.admin.updateRoundStatus(roundId, { status });
      await loadData();
      alert('Round status updated!');
    } catch (error: any) {
      alert(error.message || 'Failed to update round status');
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChallenge.roundId) {
      alert('Please select a round');
      return;
    }
    try {
      await api.admin.createChallenge({
        ...newChallenge,
        maxAttempts: newChallenge.maxAttempts || undefined,
      });
      await loadData();
      setNewChallenge({
        roundId: '',
        title: '',
        description: '',
        points: 100,
        flag: '',
        order: 1,
        maxAttempts: 0,
        hints: '',
      });
      alert('Challenge created successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to create challenge');
    }
  };

  const handleResetCompetition = async () => {
    if (!confirm('Are you sure you want to reset the entire competition? This will delete all submissions and scores!')) {
      return;
    }
    try {
      await api.admin.resetCompetition();
      await loadData();
      alert('Competition reset successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to reset competition');
    }
  };AdjustScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustScoreTeamId || !adjustReason) {
      alert('Please select a team and provide a reason');
      return;
    }
    try {
      await api.admin.adjustTeamScore(adjustScoreTeamId, { points: adjustPoints, reason: adjustReason });
      await loadData();
      setAdjustScoreTeamId('');
      setAdjustPoints(0);
      setAdjustReason('');
      alert('Score adjusted successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to adjust score');
    }
  };

  const handleDisqualifyTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disqualifyTeamId || !disqualifyReason) {
      alert('Please select a team and provide a reason');
      return;
    }
    if (!confirm(`Are you sure you want to disqualify team ${teams.find(t => t.id === disqualifyTeamId)?.name}? This will set their score to 0 and mark them as JUDGE.`)) {
      return;
    }
    try {
      await api.admin.disqualifyTeam(disqualifyTeamId, { reason: disqualifyReason });
      await loadData();
      setDisqualifyTeamId('');
      setDisqualifyReason('');
      alert('Team disqualified successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to disqualify team');
    }
  };

  const handleToggleFreezeScoreboard = async () => {
    try {
      await api.admin.freezeScoreboard({ freeze: !scoreboardFrozen });
      setScoreboardFrozen(!scoreboardFrozen);
      alert(`Scoreboard ${!scoreboardFrozen ? 'frozen' : 'unfrozen'} successfully!`);
    } catch (error: any) {
      alert(error.message || 'Failed to toggle scoreboard freeze');
    }
  };

  const handleExportResults = async () => {
    try {
      const results = await api.admin.exportResults();
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ctf-results-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.message || 'Failed to export results');
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await api.admin.exportResultsCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ctf-results-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.message || 'Failed to export CSV');
    }
  };

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
          <h1 className="text-2xl font-bold">Hack The Box - Admin</h1>
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
            <Link href="/admin">
              <Button variant="ghost">Admin</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTeams || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Challenges</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalChallenges || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSubmissions || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.correctSubmissions || 0} correct ({stats?.successRate?.toFixed(1) || 0}%)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Event Management Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {scoreboardFrozen ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                Scoreboard Control
              </CardTitle>
              <CardDescription>Freeze/unfreeze live scoreboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleToggleFreezeScoreboard}
                variant={scoreboardFrozen ? "destructive" : "default"}
                className="w-full"
              >
                {scoreboardFrozen ? (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Unfreeze Scoreboard
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Freeze Scoreboard
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                {scoreboardFrozen 
                  ? "Scoreboard is currently frozen" 
                  : "Scoreboard is live"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Results
              </CardTitle>
              <CardDescription>Download competition data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={handleExportResults} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export as JSON
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Includes all teams, submissions, and statistics
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Real-time overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Teams:</span>
                <span className="font-semibold">{teams.filter(t => t.members?.length > 0).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Rounds:</span>
                <span className="font-semibold">{rounds.filter(r => r.status === 'ACTIVE').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Success Rate:</span>
                <span className="font-semibold">{stats?.successRate?.toFixed(1) || 0}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Adjust Team Score
              </CardTitle>
              <CardDescription>Manually add or deduct points</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdjustScore} className="space-y-4">
                <div>
                  <Label htmlFor="adjust-team">Team</Label>
                  <select
                    id="adjust-team"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={adjustScoreTeamId}
                    onChange={(e) => setAdjustScoreTeamId(e.target.value)}
                    required
                  >
                    <option value="">Select a team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} (Current: {team.scores?.[0]?.totalPoints || 0} pts)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="adjust-points">Points (negative to deduct)</Label>
                  <Input
                    id="adjust-points"
                    type="number"
                    value={adjustPoints}
                    onChange={(e) => setAdjustPoints(parseInt(e.target.value))}
                    placeholder="e.g., 100 or -50"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="adjust-reason">Reason</Label>
                  <Textarea
                    id="adjust-reason"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="e.g., Bonus for creativity"
                    required
                    className="resize-none"
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Adjust Score
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Ban className="h-5 w-5" />
                Disqualify Team
              </CardTitle>
              <CardDescription>Remove team from competition</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDisqualifyTeam} className="space-y-4">
                <div>
                  <Label htmlFor="disqualify-team">Team</Label>
                  <select
                    id="disqualify-team"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={disqualifyTeamId}
                    onChange={(e) => setDisqualifyTeamId(e.target.value)}
                    required
                  >
                    <option value="">Select a team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="disqualify-reason">Reason</Label>
                  <Textarea
                    id="disqualify-reason"
                    value={disqualifyReason}
                    onChange={(e) => setDisqualifyReason(e.target.value)}
                    placeholder="e.g., Code of conduct violation"
                    required
                    className="resize-none"
                  />
                </div>
                <Button type="submit" variant="destructive" className="w-full">
                  <Ban className="h-4 w-4 mr-2" />
                  Disqualify Team
                </Button>
                <p className="text-xs text-muted-foreground">
                  This will set score to 0 and mark as JUDGE
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Create Round */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Round</CardTitle>
            <CardDescription>Add a new competition round</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRound} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="round-name">Round Name</Label>
                  <Input
                    id="round-name"
                    value={newRound.name}
                    onChange={(e) => setNewRound({ ...newRound, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="round-type">Type</Label>
                  <select
                    id="round-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newRound.type}
                    onChange={(e) => setNewRound({ ...newRound, type: e.target.value })}
                  >
                    <option value="DECODE_THE_SECRET">Decode the Secret</option>
                    <option value="FIND_AND_CRACK">Find & Crack</option>
                    <option value="CATCH_THE_FLAG">Catch the Flag</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="round-order">Order</Label>
                  <Input
                    id="round-order"
                    type="number"
                    value={newRound.order}
                    onChange={(e) => setNewRound({ ...newRound, order: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="round-description">Description</Label>
                <Input
                  id="round-description"
                  value={newRound.description}
                  onChange={(e) => setNewRound({ ...newRound, description: e.target.value })}
                />
              </div>
              <Button type="submit">Create Round</Button>
            </form>
          </CardContent>
        </Card>

        {/* Manage Rounds */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Manage Rounds</CardTitle>
            <CardDescription>Control round status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Challenges</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rounds.map((round) => (
                  <TableRow key={round.id}>
                    <TableCell className="font-medium">{round.name}</TableCell>
                    <TableCell>{round.type}</TableCell>
                    <TableCell>{round.order}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        round.status === 'ACTIVE' ? 'bg-primary text-primary-foreground' :
                        round.status === 'COMPLETED' ? 'bg-secondary text-secondary-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {round.status}
                      </span>
                    </TableCell>
                    <TableCell>{round.challenges?.length || 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateRoundStatus(round.id, 'ACTIVE')}
                        >
                          Activate
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateRoundStatus(round.id, 'COMPLETED')}
                        >
                          Complete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Challenge */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Challenge</CardTitle>
            <CardDescription>Add a challenge to a round</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="challenge-round">Round</Label>
                  <select
                    id="challenge-round"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newChallenge.roundId}
                    onChange={(e) => setNewChallenge({ ...newChallenge, roundId: e.target.value })}
                    required
                  >
                    <option value="">Select a round</option>
                    {rounds.map((round) => (
                      <option key={round.id} value={round.id}>{round.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="challenge-title">Title</Label>
                  <Input
                    id="challenge-title"
                    value={newChallenge.title}
                    onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="challenge-description">Description</Label>
                <Input
                  id="challenge-description"
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="challenge-points">Points</Label>
                  <Input
                    id="challenge-points"
                    type="number"
                    value={newChallenge.points}
                    onChange={(e) => setNewChallenge({ ...newChallenge, points: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="challenge-order">Order</Label>
                  <Input
                    id="challenge-order"
                    type="number"
                    value={newChallenge.order}
                    onChange={(e) => setNewChallenge({ ...newChallenge, order: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="challenge-attempts">Max Attempts (0 = unlimited)</Label>
                  <Input
                    id="challenge-attempts"
                    type="number"
                    value={newChallenge.maxAttempts}
                    onChange={(e) => setNewChallenge({ ...newChallenge, maxAttempts: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="challenge-flag">Flag (will be hashed)</Label>
                <Input
                  id="challenge-flag"
                  type="password"
                  value={newChallenge.flag}
                  onChange={(e) => setNewChallenge({ ...newChallenge, flag: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="challenge-hints">Hints (optional)</Label>
                <Input
                  id="challenge-hints"
                  value={newChallenge.hints}
                  onChange={(e) => setNewChallenge({ ...newChallenge, hints: e.target.value })}
                />
              </div>
              <Button type="submit">Create Challenge</Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Last 100 flag submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Challenge</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.slice(0, 20).map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="text-sm">
                      {new Date(sub.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{sub.user.username}</TableCell>
                    <TableCell>{sub.team?.name || 'No Team'}</TableCell>
                    <TableCell>{sub.challenge.title}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        sub.isCorrect 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {sub.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{sub.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleResetCompetition}>
              Reset Entire Competition
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              This will delete all submissions and scores. Rounds and challenges will remain.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


