export interface CollaboratorBasicInfo {
  NUMEMP: number;
  TIPCOL: number;
  NUMCAD: number;
  NOMFUN: string;
  APEFUN?: string;
}

export interface User {
  id: number;
  cpf: number;
  name?: string;
  apelido?: string;
  collaborator?: CollaboratorBasicInfo;
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
}
