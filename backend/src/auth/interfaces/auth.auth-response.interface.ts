export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}
