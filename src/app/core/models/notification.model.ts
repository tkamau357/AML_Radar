export type NotificationType =
  | 'LOGIN_OTP' | 'PASSWORD' | 'PASSWORD_RESET' | 'PASSWORD_FORGOT_REQUEST'
  | 'SFTP_FAILURE' | 'CHECKER' | 'MAKER' | 'RECONCILIATION'
  | 'ROLLBACK' | 'REPORTS' | 'DATARETRIEVAL';

export type ActionType =
  | 'APPROVE_ROLLBACK' | 'APPROVE_ROLLBACK_UPDATE' | 'APPROVE_MANUAL_MATCH'
  | 'APPROVE_STATUS_CLASSIFICATION' | 'APPROVE_STATUS_CLASSIFICATION_UPDATE'
  | 'APPROVE_USER' | 'APPROVE_USER_UPDATE' | 'APPROVE_ROLE' | 'APPROVE_ROLE_UPDATE'
  | 'APPROVE_POLICY' | 'APPROVE_POLICY_UPDATE'
  | 'APPROVE_GL_MAINTENANCE' | 'APPROVE_GL_MAINTENANCE_UPDATE';

export interface Notification {
  id: number;
  actionType: ActionType | null;
  readByThisUser: boolean;
  notificationTime: string;
  notificationType: NotificationType;
  message: string;
  navigation: string | null;
  outcome: string | null;
  entityId: number | null;
}

export interface NotificationPage {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  number: number;  // current page
}
