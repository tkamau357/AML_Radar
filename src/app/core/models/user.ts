export interface User {
  id?: string | number;
  firstName?: string;
  lastName?: string;
  email: string;
  username?: string;
  roles: Role[];
  permissions: Permission[];
  branches: string[];
  lastLogin?: Date;
  isActive: boolean;
  isLocked: boolean;
  mfaEnabled: boolean;
  firstLogin?: boolean;
  mustChangePassword?: boolean;
  hasAcceptedTerms?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Role {
  id: string | number;
  name: string;
  description?: string;
  permissions: Permission[];
  accessRights?: AccessRight[];
}

export interface Permission {
  id: string | number;
  name: string;
  category: string;
  description?: string;
}

export interface AccessRight {
  accessRights: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}