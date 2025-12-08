import type { Group } from './group';

export interface CollaboratorBasicInfo {
  NUMEMP: number;
  TIPCOL: number;
  NUMCAD: number;
  NOMFUN: string;
  APEFUN?: string;
}

export interface User {
  id: number;
  cpf?: number;
  email?: string;
  name?: string;
  apelido?: string;
  avatarUrl?: string;
  isAdminIn?: number[];
  collaborator?: CollaboratorBasicInfo;
  groups?: Group[];
}

export interface SignInCredentials {
  cpf: string;
  password: string;
}

export interface SendCodeRequest {
  email: string;
}

export interface SendCodeResponse {
  message: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface VerifyCodeResponse {
  token: string;
  user: User;
}

export interface SignInResponse {
  token: string;
  user: {
    id: number;
    cpf: number;
  };
  colaborador: CollaboratorBasicInfo;
}

export interface GoogleAuthResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  activeGroup: Group | null;
  availableGroups: Group[];
  isLoadingGroups: boolean;
}
