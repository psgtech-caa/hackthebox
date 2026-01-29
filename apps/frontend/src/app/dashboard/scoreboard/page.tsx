'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Medal, Award } from 'lucide-react';

interface ScoreboardEntry {
  rank: number;
  id: string;
  name: string;
  username: string;
  totalScore: number;
  solvedChallenges: number;
  lastSubmission: string | null;
}

export default function ScoreboardPage() {
  const { token, user } = useAuth();
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScoreboard();

    // Set up SSE for live updates
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const eventSource = new EventSource(`${API_BASE_URL}/api/scoreboard/live`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.scoreboard) {
          setScoreboard(data.scoreboard);
        }
      } catch (err) {
        console.error('Failed to parse SSE data:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const loadScoreboard = async () => {
    try {
      const data = await api.getScoreboard(token!);
      setScoreboard(data);
    } catch (err) {
      console.error('Failed to load scoreboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-600" />;
    return null;
  };

  const isCurrentUser = (entry: ScoreboardEntry) => {
    return user?.team && entry.id === user.team.id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading scoreboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Live Scoreboard</h2>
        <p className="text-muted-foreground">
          Real-time rankings updated automatically
        </p>
      </div>

      {/* Top 3 Podium */}
      {scoreboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd Place */}
          <Card className="border-gray-400/50">
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-2">
                <Medal className="h-12 w-12 text-gray-400" />
              </div>
              <CardTitle className="text-lg">2nd Place</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-bold text-xl mb-1">{scoreboard[1].name}</p>
              <p className="text-3xl font-bold text-gray-400">{scoreboard[1].totalScore}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {scoreboard[1].solvedChallenges} challenges
              </p>
            </CardContent>
          </Card>

          {/* 1st Place */}
          <Card className="border-yellow-500/50 -mt-4">
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-2">
                <Trophy className="h-16 w-16 text-yellow-500" />
              </div>
              <CardTitle className="text-xl">1st Place</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-bold text-2xl mb-1">{scoreboard[0].name}</p>
              <p className="text-4xl font-bold text-yellow-500">{scoreboard[0].totalScore}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {scoreboard[0].solvedChallenges} challenges
              </p>
            </CardContent>
          </Card>

          {/* 3rd Place */}
          <Card className="border-orange-600/50">
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-2">
                <Award className="h-12 w-12 text-orange-600" />
              </div>
              <CardTitle className="text-lg">3rd Place</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-bold text-xl mb-1">{scoreboard[2].name}</p>
              <p className="text-3xl font-bold text-orange-600">{scoreboard[2].totalScore}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {scoreboard[2].solvedChallenges} challenges
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Scoreboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Rank</TableHead>
                <TableHead>Team Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Solved</TableHead>
                <TableHead className="text-right">Last Submission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scoreboard.map((entry) => (
                <TableRow
                  key={entry.id}
                  className={isCurrentUser(entry) ? 'bg-accent' : ''}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRankIcon(entry.rank)}
                      <span className="font-semibold">{entry.rank}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.name}
                    {isCurrentUser(entry) && (
                      <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{entry.username}</TableCell>
                  <TableCell className="text-right font-bold">{entry.totalScore}</TableCell>
                  <TableCell className="text-right">{entry.solvedChallenges}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {entry.lastSubmission
                      ? new Date(entry.lastSubmission).toLocaleString()
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
