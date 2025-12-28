/**
 * Authentication API client
 */
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

export interface User {
  id: string;
  username: string;
}

export const api = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}/api/auth/login`,
      { username, password }
    );
    return response.data;
  },

  async logout(): Promise<void> {
    await axios.post(`${API_BASE_URL}/api/auth/logout`);
  },

  async getCurrentUser(token: string): Promise<User> {
    const response = await axios.get<{ user: User }>(
      `${API_BASE_URL}/api/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.user;
  },
};

