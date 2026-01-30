'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { Flag, CheckCircle, XCircle, AlertCircle, LogOut } from 'lucide-react';

export default function ChallengesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [flags, setFlags] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, { text: string; type: 'success' | 'error' }>>({});
  
  // Team creation
  const [teamName, setTeamName] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);

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
      const [profileData, roundData, teamsData, submissionsData] = await Promise.all([
        api.getProfile(),
        api.getCurrentRound(),
        api.getAllTeams(),
        api.getMySubmissions(),
      ]);

      setUser(profileData);
      setCurrentRound(roundData);
      setTeams(teamsData);
      setSubmissions(submissionsData);

      if (roundData) {
        setChallenges(roundData.challenges || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTeam(true);
    try {
      await api.createTeam({ name: teamName });
      await loadData();
      setTeamName('');
    } catch (error: any) {
      alert(error.message || 'Failed to create team');
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    try {
      await api.joinTeam({ teamId });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to join team');
    }
  };

  const handleSubmitFlag = async (challengeId: string) => {
    const flag = flags[challengeId];
    if (!flag?.trim()) {
      setMessages({ ...messages, [challengeId]: { text: 'Please enter a flag', type: 'error' } });
      return;
    }

    setSubmitting(challengeId);
    try {
      const result = await api.submitFlag({ challengeId, flag });
      setMessages({ 
        ...messages, 
        [challengeId]: { 
          text: result.message || (result.isCorrect ? 'Correct!' : 'Incorrect flag'), 
          type: result.isCorrect ? 'success' : 'error' 
        } 
      });
      
      if (result.isCorrect) {
        setFlags({ ...flags, [challengeId]: '' });
        await loadData();
      }
    } catch (error: any) {
      setMessages({ ...messages, [challengeId]: { text: error.message || 'Submission failed', type: 'error' } });
    } finally {
      setSubmitting(null);
    }
  };

  const isSolved = (challengeId: string) => {
    return submissions.some(s => s.challengeId === challengeId && s.isCorrect);
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
        <h2 className="text-3xl font-bold mb-6">Challenges</h2>

        {!user?.team && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle>Join or Create a Team</CardTitle>
              <CardDescription>
                You must be in a team to submit flags and earn points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTeam} className="mb-6">
                <Label htmlFor="teamName">Create New Team</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="teamName"
                    placeholder="Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  />
                  <Button type="submit" disabled={creatingTeam}>
                    {creatingTeam ? 'Creating...' : 'Create Team'}
                  </Button>
                </div>
              </form>

              <div>
                <Label>Or Join Existing Team</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {team.members?.length || 0} members
                        </p>
                      </div>
                      <Button size="sm" onClick={() => handleJoinTeam(team.id)}>
                        Join
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentRound ? (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{currentRound.name}</CardTitle>
                <CardDescription>{currentRound.description}</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 gap-6">
              {challenges.map((challenge) => {
                const solved = isSolved(challenge.id);
                const message = messages[challenge.id];

                return (
                  <Card key={challenge.id} className={solved ? 'border-primary' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle>{challenge.title}</CardTitle>
                            {solved && <CheckCircle className="h-5 w-5 text-primary" />}
                          </div>
                          <CardDescription className="mt-2">
                            {challenge.description}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {challenge.points}
                          </div>
                          <div className="text-sm text-muted-foreground">points</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {challenge.hints && (
                        <div className="mb-4 p-3 bg-muted rounded-md">
                          <p className="text-sm"><strong>Hint:</strong> {challenge.hints}</p>
                        </div>
                      )}

                      {challenge.maxAttempts && (
                        <p className="text-sm text-muted-foreground mb-4">
                          <AlertCircle className="inline h-4 w-4 mr-1" />
                          Maximum {challenge.maxAttempts} attempts allowed
                        </p>
                      )}

                      {user?.team && !solved && (
                        <div className="space-y-2">
                          <Label htmlFor={`flag-${challenge.id}`}>Submit Flag</Label>
                          <div className="flex gap-2">
                            <Input
                              id={`flag-${challenge.id}`}
                              placeholder="Enter flag..."
                              value={flags[challenge.id] || ''}
                              onChange={(e) => setFlags({ ...flags, [challenge.id]: e.target.value })}
                              disabled={submitting === challenge.id}
                            />
                            <Button
                              onClick={() => handleSubmitFlag(challenge.id)}
                              disabled={submitting === challenge.id}
                            >
                              <Flag className="h-4 w-4 mr-2" />
                              {submitting === challenge.id ? 'Submitting...' : 'Submit'}
                            </Button>
                          </div>
                          {message && (
                            <div className={`p-3 rounded-md flex items-center gap-2 ${
                              message.type === 'success' 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-destructive/10 text-destructive'
                            }`}>
                              {message.type === 'success' ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              <span className="text-sm">{message.text}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {solved && (
                        <div className="p-3 bg-primary/10 text-primary rounded-md flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Challenge Completed!</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Active Round</CardTitle>
              <CardDescription>
                There are no active challenges at the moment. Check back later!
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  );
}
