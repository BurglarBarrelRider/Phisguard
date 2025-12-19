export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
}

export type SessionUser = Omit<User, 'password'>;
