import { api } from './http';
import type { LoginResponse } from '../types/api';

export const iniciarSesion = (username: string, password: string) =>
  api.post<LoginResponse>('/api/auth/login', { username, password }, { auth: false });
