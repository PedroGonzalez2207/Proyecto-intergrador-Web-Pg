export type Role = 'Admin' | 'Programador' | 'Usuario';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: Role;
}
