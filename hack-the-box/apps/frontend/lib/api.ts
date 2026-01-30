const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: { email: string; username: string; password: string }) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  
  login: (data: { username: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  // Users
  getProfile: () => apiRequest('/users/me'),
  
  // Teams
  createTeam: (data: { name: string }) =>
    apiRequest('/teams', { method: 'POST', body: JSON.stringify(data) }),
  
  joinTeam: (data: { teamId: string }) =>
    apiRequest('/teams/join', { method: 'POST', body: JSON.stringify(data) }),
  
  getAllTeams: () => apiRequest('/teams'),
  
  getTeam: (id: string) => apiRequest(`/teams/${id}`),

  // Rounds
  getCurrentRound: () => apiRequest('/rounds/current'),
  
  getAllRounds: () => apiRequest('/rounds'),

  // Challenges
  getAllChallenges: () => apiRequest('/challenges'),
  
  getChallengesByRound: (roundId: string) => apiRequest(`/challenges/round/${roundId}`),
  
  getChallenge: (id: string) => apiRequest(`/challenges/${id}`),

  // Submissions
  submitFlag: (data: { challengeId: string; flag: string }) =>
    apiRequest('/submissions', { method: 'POST', body: JSON.stringify(data) }),
  
  getMySubmissions: () => apiRequest('/submissions/me'),
  
  getTeamSubmissions: (teamId: string) => apiRequest(`/submissions/team/${teamId}`),

  // Scoreboard
  getScoreboard: () => apiRequest('/scoreboard'),
  
  getTeamStats: (teamId: string) => apiRequest(`/scoreboard/team/${teamId}`),

  // Admin
  admin: {
    getStats: () => apiRequest('/admin/stats'),
    getAllSubmissions: () => apiRequest('/admin/submissions'),
    createRound: (data: any) => apiRequest('/admin/rounds', { method: 'POST', body: JSON.stringify(data) }),
    updateRoundStatus: (id: string, data: any) =>
      apiRequest(`/admin/rounds/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
    createChallenge: (data: any) =>
      apiRequest('/admin/challenges', { method: 'POST', body: JSON.stringify(data) }),
    updateChallenge: (id: string, data: any) =>
      apiRequest(`/admin/challenges/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    resetCompetition: () => apiRequest('/admin/reset', { method: 'POST' }),
    adjustTeamScore: (teamId: string, data: { points: number; reason: string }) =>
      apiRequest(`/admin/teams/${teamId}/adjust-score`, { method: 'POST', body: JSON.stringify(data) }),
    disqualifyTeam: (teamId: string, data: { reason: string }) =>
      apiRequest(`/admin/teams/${teamId}/disqualify`, { method: 'POST', body: JSON.stringify(data) }),
    qualifyTeam: (teamId: string) =>
      apiRequest(`/admin/teams/${teamId}/qualify`, { method: 'POST' }),
    qualifyTopTeams: (count: number) =>
      apiRequest('/admin/teams/qualify-top', { method: 'POST', body: JSON.stringify({ count }) }),
    freezeScoreboard: (data: { freeze: boolean }) =>
      apiRequest('/admin/scoreboard/freeze', { method: 'POST', body: JSON.stringify(data) }),
    exportResults: () => apiRequest('/admin/export'),
    exportResultsCSV: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_URL}/admin/export/csv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.text();
    },
  },
};
