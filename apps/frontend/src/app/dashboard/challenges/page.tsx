'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, CheckCircle, XCircle, Trophy, Coins } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  points: number;
  maxAttempts: number;
  hints?: string;
  isFinalFlag: boolean;
  round: {
    id: string;
    name: string;
    state: string;
  };
}

interface Submission {
  id: string;
  challengeId: string;
  isCorrect: boolean;
  points: number;
  submittedAt: string;
  challenge: {
    title: string;
  };
}

export default function ChallengesPage() {
  const { token } = useAuth();
  const [rounds, setRounds] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>('');
  const [submittingFlag, setSubmittingFlag] = useState<string | null>(null);
  const [flags, setFlags] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, any>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roundsData, challengesData, submissionsData] = await Promise.all([
        api.getRounds(token!),
        api.getChallenges(token!),
        api.getMySubmissions(token!),
      ]);

      setRounds(roundsData);
      setChallenges(challengesData);
      setSubmissions(submissionsData);

      // Set first active round as default
      const activeRound = roundsData.find((r: any) => r.state === 'ACTIVE');
      if (activeRound) {
        setSelectedRound(activeRound.id);
      } else if (roundsData.length > 0) {
        setSelectedRound(roundsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleSubmitFlag = async (challengeId: string) => {
    const flag = flags[challengeId];
    if (!flag || !flag.trim()) {
      setResults({ ...results, [challengeId]: { error: 'Please enter a flag' } });
      return;
    }

    setSubmittingFlag(challengeId);
    setResults({ ...results, [challengeId]: null });

    try {
      const result: any = await api.submitFlag(challengeId, flag, token!);
      setResults({
        ...results,
        [challengeId]: result,
      });

      if (result.isCorrect) {
        setFlags({ ...flags, [challengeId]: '' });
        // Reload submissions
        const submissionsData = await api.getMySubmissions(token!);
        setSubmissions(submissionsData);
      }
    } catch (err: any) {
      setResults({
        ...results,
        [challengeId]: { error: err.message || 'Submission failed' },
      });
    } finally {
      setSubmittingFlag(null);
    }
  };

  const isSolved = (challengeId: string) => {
    return submissions.some((s) => s.challengeId === challengeId && s.isCorrect);
  };

  const roundChallenges = challenges.filter((c) => c.round.id === selectedRound);
  const currentRound = rounds.find((r) => r.id === selectedRound);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Challenges</h2>
        <p className="text-muted-foreground">
          Complete challenges to earn points and climb the leaderboard
        </p>
      </div>

      {/* Round Tabs */}
      <Tabs value={selectedRound} onValueChange={setSelectedRound}>
        <TabsList>
          {rounds.map((round) => (
            <TabsTrigger key={round.id} value={round.id} className="gap-2">
              {round.state === 'LOCKED' && <Lock className="h-3 w-3" />}
              {round.state === 'ACTIVE' && <Trophy className="h-3 w-3" />}
              Round {round.number}
            </TabsTrigger>
          ))}
        </TabsList>

        {rounds.map((round) => (
          <TabsContent key={round.id} value={round.id} className="space-y-4 mt-6">
            {/* Round Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{round.name}</span>
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
            </Card>

            {/* Challenges */}
            {round.state === 'LOCKED' ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    This round is locked. Wait for the admin to activate it.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {roundChallenges.map((challenge) => {
                  const solved = isSolved(challenge.id);
                  const result = results[challenge.id];

                  return (
                    <Card key={challenge.id} className={solved ? 'border-green-500/50' : ''}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {solved && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {challenge.title}
                            {challenge.isFinalFlag && (
                              <Trophy className="h-5 w-5 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm font-normal">
                            <Coins className="h-4 w-4" />
                            {challenge.points} pts
                          </div>
                        </CardTitle>
                        <CardDescription className="whitespace-pre-wrap">
                          {challenge.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {challenge.hints && (
                          <div className="mb-4 p-3 bg-muted rounded-md">
                            <p className="text-xs text-muted-foreground">
                              <strong>Hint:</strong> {challenge.hints}
                            </p>
                          </div>
                        )}

                        {!solved && round.state === 'ACTIVE' && (
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Input
                                  placeholder="Enter flag..."
                                  value={flags[challenge.id] || ''}
                                  onChange={(e) =>
                                    setFlags({ ...flags, [challenge.id]: e.target.value })
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSubmitFlag(challenge.id);
                                    }
                                  }}
                                />
                              </div>
                              <Button
                                onClick={() => handleSubmitFlag(challenge.id)}
                                disabled={submittingFlag === challenge.id}
                              >
                                {submittingFlag === challenge.id ? 'Submitting...' : 'Submit'}
                              </Button>
                            </div>

                            {result && (
                              <div
                                className={`flex items-center gap-2 text-sm ${
                                  result.isCorrect ? 'text-green-500' : 'text-destructive'
                                }`}
                              >
                                {result.isCorrect ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                {result.message || result.error}
                              </div>
                            )}

                            {challenge.maxAttempts > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Max attempts: {challenge.maxAttempts}
                              </p>
                            )}
                          </div>
                        )}

                        {solved && (
                          <div className="flex items-center gap-2 text-green-500">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-semibold">Completed! +{challenge.points} points</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
