export interface Users {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt: Date;
  updatedAt: Date;
}
