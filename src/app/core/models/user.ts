export type UserRole = 'CIUDADANO' | 'VOLUNTARIO' | 'ENTIDAD' | 'ADMINISTRADOR';
export type PublicUserRole = Exclude<UserRole, 'ADMINISTRADOR'>;
export interface User { id: string; nombre: string; correo: string; rol: UserRole; }
export interface RegisterRequest { nombre: string; correo: string; password: string; rol: PublicUserRole; }
export type RegisterResponse = User;
export interface ApiError { detail: { code: string; message: string; errors?: { field: string; type: string; message: string }[] }; }
