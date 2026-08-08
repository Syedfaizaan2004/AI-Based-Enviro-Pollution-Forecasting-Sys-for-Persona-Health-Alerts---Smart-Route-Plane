export interface User {
  id: string;
  email: string;
  fullName: string;
  age?: number;
  gender?: string;
  city?: string;
  region?: string;
  healthConditions?: string[];
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
