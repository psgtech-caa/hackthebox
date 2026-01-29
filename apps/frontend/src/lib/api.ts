const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiRequestOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, error.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: { usernameOrEmail: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: { email: string; username: string; password: string }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createTeam: (teamName: string, token: string) =>
    apiRequest('/auth/team', {
      method: 'POST',
      body: JSON.stringify({ teamName }),
      token,
    }),

  getProfile: (token: string) =>
    apiRequest('/auth/me', { token }),

  // Event
  getEventStatus: (token: string) =>
    apiRequest('/event/status', { token }),

  // Rounds
  getRounds: (token: string) =>
    apiRequest('/rounds', { token }),

  getActiveRound: (token: string) =>
    apiRequest('/rounds/active', { token }),

  // Challenges
  getChallenges: (token: string, roundId?: string) =>
    apiRequest(`/challenges${roundId ? `?roundId=${roundId}` : ''}`, { token }),

  getChallenge: (id: string, token: string) =>
    apiRequest(`/challenges/${id}`, { token }),

  // Submissions
  submitFlag: (challengeId: string, flag: string, token: string) =>
    apiRequest('/submissions', {
      method: 'POST',
      body: JSON.stringify({ challengeId, flag }),
      token,
    }),

  getMySubmissions: (token: string) =>
    apiRequest('/submissions/my-submissions', { token }),

  // Scoreboard
  getScoreboard: (token: string) =>
    apiRequest('/scoreboard', { token }),

  // Admin
  getDashboard: (token: string) =>
    apiRequest('/admin/dashboard', { token }),

  updateRoundState: (roundId: string, state: string, token: string) =>
    apiRequest(`/admin/rounds/${roundId}/state`, {
      method: 'PUT',
      body: JSON.stringify({ state }),
      token,
    }),

  toggleChallenge: (challengeId: string, isActive: boolean, token: string) =>
    apiRequest(`/admin/challenges/${challengeId}/toggle`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
      token,
    }),

  disqualifyTeam: (teamId: string, isDisqualified: boolean, reason: string, token: string) =>
    apiRequest(`/admin/teams/${teamId}/disqualify`, {
      method: 'PUT',
      body: JSON.stringify({ isDisqualified, reason }),
      token,
    }),

  adjustScore: (teamId: string, points: number, reason: string, token: string) =>
    apiRequest('/admin/teams/adjust-score', {
      method: 'POST',
      body: JSON.stringify({ teamId, points, reason }),
      token,
    }),

  getAllSubmissions: (token: string) =>
    apiRequest('/admin/submissions', { token }),

  exportResults: (token: string) =>
    apiRequest('/admin/export/results', { token }),
};

export { ApiError };
