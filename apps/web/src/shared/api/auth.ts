import axios from 'axios';
import type { AuthSession } from '@quizparty/shared';
import { axiosConfig } from './client-config';
import { useAppStore } from '../model/app-store';

const authHttp = axios.create(axiosConfig);

export async function refreshAdminSession(): Promise<AuthSession> {
  const { data } = await authHttp.post<AuthSession>('/auth/refresh');
  useAppStore.getState().setAuth(data.accessToken, data.user);
  return data;
}
