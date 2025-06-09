export interface LoginRequest {
  username: string;
  password: string;
}

export interface JwtResponse {
  token: string;
  username: string;
  email: string;
  rol: string;
  cargo: string;
}

export interface JwtPayload {
  sub: string; 
  id: number;
  email: string;
  iat: number;
  exp: number;
}