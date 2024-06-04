export interface AuthPostData {
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface AuthGetToken {
  accessToken: string;
}

export type User = {
  _id: string;
  phoneNumber: string;
  email: string;
  role: string;
  teacherId?: string;
} | null;
