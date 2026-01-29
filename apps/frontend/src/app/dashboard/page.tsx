'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, Clock, Users } from 'lucide-react';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [eventStatus, setEventStatus] = useState<any>(null);
  const [teamName, setTeamName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEventStatus();
  }, []);

  const loadEventStatus = async () => {
    try {
      const status = await api.getEventStatus(token!);
      setEventStatus(status);
    } catch (err) {
      console.error('Failed to load event status:', err);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      await api.createTeam(teamName, token!);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  if (!user?.team) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create Your Team</CardTitle>
            <CardDescription>
              You need to create a team before participating in the competition.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter your team name"
                  required
                  minLength={3}
                  maxLength={50}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? 'Creating...' : 'Create Team'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome back, {user.username}!</h2>
        <p className="text-muted-foreground">
          Team: <span className="font-semibold text-foreground">{user.team.name}</span>
        </p>
      </div>

      {/* Event Status */}
      {eventStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Event Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {eventStatus.event.isActive ? 'ACTIVE' : 'NOT STARTED'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Active Round
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {eventStatus.activeRound ? `Round ${eventStatus.activeRound.number}` : 'None'}
              </div>
              {eventStatus.activeRound && (
                <p className="text-xs text-muted-foreground mt-1">
                  {eventStatus.activeRound.name}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventStatus.stats.activeTeams}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {eventStatus.stats.totalTeams} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventStatus.event.duration}m</div>
              <p className="text-xs text-muted-foreground mt-1">Total time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Info */}
      <Card>
        <CardHeader>
          <CardTitle>Competition Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">About the Event</h3>
            <p className="text-sm text-muted-foreground">
              HACK-THE-BOX is a 3-hour cybersecurity competition featuring three progressive rounds:
              Decode the Secret, Find & Crack, and Catch the Flag. Test your skills in cryptography,
              hash cracking, and capture-the-flag challenges.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">How to Participate</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Navigate to the Challenges page to view available challenges</li>
              <li>Submit flags for each challenge to earn points</li>
              <li>Check the Scoreboard to see your ranking</li>
              <li>Rounds unlock sequentially - complete them in order</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
