import { User } from "./user";

// ==================== Login ====================
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  requiresOtp: boolean;
  email: string;
  message: string;
  hasAcceptedTerms?: boolean;
  otpExpirySeconds?: number;
  skipOtp?: boolean;  // true when user must change password
}

// ==================== OTP ====================
export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  status: number;
  message: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

// ==================== Token ====================
export interface TokenDetails {
  iat: number;
  expat: number;
  clientSaveTime: number;
}

// ==================== Refresh Token ====================
export interface RefreshTokenRequest {
  refreshToken: string;
  iat: number;
  expat: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  iat: number;
  expat: number;
}