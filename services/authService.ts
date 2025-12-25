
import { User } from '../types';

const USER_STORAGE_KEY = 'smart_tracker_users';
const SESSION_KEY = 'smart_tracker_session';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const AuthService = {
  async getUsers(): Promise<User[]> {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  async register(username: string, password: string): Promise<User> {
    await delay(600);
    const users = await this.getUsers();
    
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Username already taken');
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      password // Plain text for demo; hash in real prod environment
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify([...users, newUser]));
    return newUser;
  },

  async login(username: string, password: string): Promise<User> {
    await delay(600);
    const users = await this.getUsers();
    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!user) {
      throw new Error('Incorrect credentials');
    }

    return user;
  },

  saveSession(user: User) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  getSession(): User | null {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  }
};
