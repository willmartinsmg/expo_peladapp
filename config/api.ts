import { env } from './env';

/**
 * Centralized API configuration
 */
export const apiConfig = {
  baseURL: env.API_URL,
  timeout: env.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

/**
 * API endpoints organized by domain
 * Note: Do not start with '/' when using prefixUrl in Ky
 */
export const apiEndpoints = {
  auth: {
    signIn: 'auth/signin',
    signOut: 'auth/signout',
    validate: 'auth/validate',
    sendCode: 'auth/send-code',
    verifyCode: 'auth/verify-code',
    googleLogin: 'auth/google/login',
  },
  users: {
    profile: 'users/profile',
    update: 'users/update',
  },
  collaborator: {
    getByNumcad: 'general/collaborator/:numemp/:tipcol/:numcad',
  },
  controlePonto: {
    marcacoesDiarias: 'controle-ponto/marcacoes-diarias-colaborador',
    definicoesHorario: 'controle-ponto/definicoes-horario-colaborador',
    updateHorarioColaborador: 'controle-ponto/horario-colaborador',
    espelhoPontoPdf: 'controle-ponto/relatorio-espelho-ponto/pdf',
    // Deprecated endpoints (manter para retrocompatibilidade temporária)
    updateQtdHex: 'controle-ponto/horario-colaborador/qtdhex',
    updateIntervalos: 'controle-ponto/horario-colaborador/intervalos',
    updateAlmoco: 'controle-ponto/horario-colaborador/almoco',
  },
  general: {
    filiais: 'general/filial',
    costCenters: 'general/costcenter',
  },
} as const;
