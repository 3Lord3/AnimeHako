import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, userApi } from '@/lib/api';
import type { User, Token } from '@/types';

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data: { data: Token }) => {
      const { token, user } = data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      queryClient.setQueryData(['user'], user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({
      email,
      username,
      password,
    }: {
      email: string;
      username: string;
      password: string;
    }) => authApi.register(email, username, password),
    onSuccess: (data: { data: Token }) => {
      const { token, user } = data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      queryClient.setQueryData(['user'], user);
    },
  });

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    queryClient.setQueryData(['user'], null);
    queryClient.clear();
    navigate('/login');
  };

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr) as User;
      }
      try {
        const { data } = await userApi.getProfile();
        localStorage.setItem('user', JSON.stringify(data));
        return data;
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { username?: string; avatar?: string }) =>
      userApi.updateProfile(data),
    onSuccess: (data: { data: User }) => {
      localStorage.setItem('user', JSON.stringify(data.data));
      queryClient.setQueryData(['user'], data.data);
    },
  });
}