// src/app/admin/dashboard/auditing/data/audit-data.ts

/**
 * Audit Data Interface
 * Matches the backend AuditResponse record structure
 * and includes additional UI-specific fields
 */
export interface AuditData {
  // ── Core Fields (matches AuditResponse) ──────────────────────────────
  
  /** Unique identifier for the audit log entry */
  id?: number;
  
  /** The action performed (matches AuditAction enum) */
  action?: string;
  
  /** Email of the user who performed the action */
  userEmail: string;
  
  /** Branch code of the user */
  userBranchCode?: string;
  
  /** Type of entity affected (e.g., User, Branch, Role) */
  entityType?: string;
  
  /** ID of the entity affected */
  entityId?: string;
  
  /** Detailed description of the action */
  details?: string;
  
  /** IP address of the user */
  ipAddress?: string;
  
  /** Whether the action was successful */
  success?: boolean;
  
  /** Error message if the action failed */
  errorMessage?: string;
  
  /** Timestamp of the audit event */
  timestamp: Date | string;

  // ── Legacy/Compatibility Fields ──────────────────────────────────────
  // These fields are kept for backward compatibility with existing code
  
  /** @deprecated Use 'action' instead */
  eventType?: string;
  
  /** @deprecated Use 'details' instead */
  activity?: string;
  
  /** @deprecated Use 'success' instead */
  status?: string;
  
  /** @deprecated Use 'entityType' instead */
  moduleType?: string;
  
  /** @deprecated Use 'userEmail' instead */
  user?: string;

  // ── UI-Specific Fields ───────────────────────────────────────────────
  
  /** Device information (derived from IP or user agent) */
  device?: string;
  
  /** Formatted timestamp for display */
  formattedTimestamp?: string;
  
  /** Human-readable action description */
  actionLabel?: string;
  
  /** Status display text */
  statusDisplay?: string;
  
  /** CSS class for status badge */
  statusClass?: string;
  
  /** Material icon name for the action */
  iconName?: string;
  
  /** Creation timestamp (audit log creation) */
  createdAt?: Date | string;
  
  /** Last update timestamp */
  updatedAt?: Date | string;
}

// ── Helper Types ──────────────────────────────────────────────────────

/**
 * Audit Action Types (matches AuditAction enum from backend)
 */
export type AuditActionType =
  // Auth
  | 'LOGIN_ATTEMPT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'OTP_SENT'
  | 'OTP_VERIFIED'
  | 'PASSWORD_CHANGED'
  // User
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_STATUS_CHANGED'
  // Role
  | 'ROLE_CREATED'
  | 'ROLE_UPDATED'
  | 'ROLE_DELETED'
  | 'PERMISSION_ASSIGNED'
  | 'PERMISSION_REVOKED'
  // Branch
  | 'BRANCH_CREATED'
  | 'BRANCH_UPDATED'
  | 'BRANCH_DELETED'
  | 'BRANCH_UPLOADED'
  // Data Access
  | 'DATA_VIEWED'
  | 'DATA_EXPORTED'
  | 'REPORT_GENERATED'
  // Sanctions
  | 'SANCTION_SCREENED'
  | 'SANCTION_BATCH_SCREENED'
  | 'SANCTION_LIST_SYNCED'
  | 'SANCTION_HIT_FOUND'
  | 'SANCTION_ENTRY_VIEWED'
  | 'SANCTION_ENTRY_CREATED'
  | 'SANCTION_ENTRY_DELETED'
  | 'SANCTION_ENTRY_DEACTIVATED'
  | 'SANCTION_BULK_UPLOAD';

/**
 * Audit Status Types
 */
export type AuditStatusType = 'SUCCESS' | 'FAILED' | 'PENDING';

/**
 * Audit Status with optional display name
 */
export interface AuditStatus {
  value: AuditStatusType;
  label: string;
  cssClass: string;
}

// ── Constants ─────────────────────────────────────────────────────────

/**
 * Mapping of audit actions to display labels
 */
export const ACTION_LABELS: Record<string, string> = {
  // Auth
  LOGIN_ATTEMPT: 'Login Attempt',
  LOGIN_SUCCESS: 'Login Success',
  LOGIN_FAILED: 'Login Failed',
  LOGOUT: 'Logout',
  OTP_SENT: 'OTP Sent',
  OTP_VERIFIED: 'OTP Verified',
  PASSWORD_CHANGED: 'Password Changed',
  // User
  USER_CREATED: 'User Created',
  USER_UPDATED: 'User Updated',
  USER_DELETED: 'User Deleted',
  USER_STATUS_CHANGED: 'User Status Changed',
  // Role
  ROLE_CREATED: 'Role Created',
  ROLE_UPDATED: 'Role Updated',
  ROLE_DELETED: 'Role Deleted',
  PERMISSION_ASSIGNED: 'Permission Assigned',
  PERMISSION_REVOKED: 'Permission Revoked',
  // Branch
  BRANCH_CREATED: 'Branch Created',
  BRANCH_UPDATED: 'Branch Updated',
  BRANCH_DELETED: 'Branch Deleted',
  BRANCH_UPLOADED: 'Branch Uploaded',
  // Data Access
  DATA_VIEWED: 'Data Viewed',
  DATA_EXPORTED: 'Data Exported',
  REPORT_GENERATED: 'Report Generated',
  // Sanctions
  SANCTION_SCREENED: 'Sanction Screened',
  SANCTION_BATCH_SCREENED: 'Sanction Batch Screened',
  SANCTION_LIST_SYNCED: 'Sanction List Synced',
  SANCTION_HIT_FOUND: 'Sanction Hit Found',
  SANCTION_ENTRY_VIEWED: 'Sanction Entry Viewed',
  SANCTION_ENTRY_CREATED: 'Sanction Entry Created',
  SANCTION_ENTRY_DELETED: 'Sanction Entry Deleted',
  SANCTION_ENTRY_DEACTIVATED: 'Sanction Entry Deactivated',
  SANCTION_BULK_UPLOAD: 'Sanction Bulk Upload',
};

/**
 * Mapping of audit actions to Material icons
 */
export const ACTION_ICONS: Record<string, string> = {
  // Auth
  LOGIN_ATTEMPT: 'login',
  LOGIN_SUCCESS: 'check_circle',
  LOGIN_FAILED: 'error_outline',
  LOGOUT: 'logout',
  OTP_SENT: 'sms',
  OTP_VERIFIED: 'verified',
  PASSWORD_CHANGED: 'vpn_key',
  // User
  USER_CREATED: 'person_add',
  USER_UPDATED: 'person',
  USER_DELETED: 'person_remove',
  USER_STATUS_CHANGED: 'toggle_on',
  // Role
  ROLE_CREATED: 'admin_panel_settings',
  ROLE_UPDATED: 'admin_panel_settings',
  ROLE_DELETED: 'remove_circle',
  PERMISSION_ASSIGNED: 'lock_open',
  PERMISSION_REVOKED: 'lock',
  // Branch
  BRANCH_CREATED: 'business',
  BRANCH_UPDATED: 'business_center',
  BRANCH_DELETED: 'business',
  BRANCH_UPLOADED: 'cloud_upload',
  // Data Access
  DATA_VIEWED: 'visibility',
  DATA_EXPORTED: 'file_download',
  REPORT_GENERATED: 'assessment',
  // Sanctions
  SANCTION_SCREENED: 'search',
  SANCTION_BATCH_SCREENED: 'batch_prediction',
  SANCTION_LIST_SYNCED: 'sync',
  SANCTION_HIT_FOUND: 'warning',
  SANCTION_ENTRY_VIEWED: 'description',
  SANCTION_ENTRY_CREATED: 'add_circle_outline',
  SANCTION_ENTRY_DELETED: 'delete_outline',
  SANCTION_ENTRY_DEACTIVATED: 'block',
  SANCTION_BULK_UPLOAD: 'cloud_upload',
};

/**
 * Status configuration - using explicit object type instead of Record
 */
export const STATUS_CONFIG: {
  SUCCESS: AuditStatus;
  FAILED: AuditStatus;
  PENDING: AuditStatus;
} = {
  SUCCESS: {
    value: 'SUCCESS',
    label: 'Success',
    cssClass: 'badge-success',
  },
  FAILED: {
    value: 'FAILED',
    label: 'Failed',
    cssClass: 'badge-failed',
  },
  PENDING: {
    value: 'PENDING',
    label: 'Pending',
    cssClass: 'badge-pending',
  },
};

/**
 * Default status for unknown status values
 */
export const DEFAULT_STATUS: AuditStatus = {
  value: 'PENDING',
  label: 'Pending',
  cssClass: 'badge-default',
};

// ── Helper Functions ──────────────────────────────────────────────────

/**
 * Get display label for an action
 */
export function getActionLabel(action: string): string {
  return ACTION_LABELS[action] || action || 'Unknown Action';
}

/**
 * Get icon name for an action
 */
export function getActionIcon(action: string): string {
  return ACTION_ICONS[action] || 'event_note';
}

/**
 * Get status configuration based on status value
 */
export function getStatusConfig(status: string | boolean | undefined): AuditStatus {
  if (typeof status === 'boolean') {
    return status ? STATUS_CONFIG.SUCCESS : STATUS_CONFIG.FAILED;
  }
  if (typeof status === 'string') {
    const upperStatus = status.toUpperCase();
    if (upperStatus === 'SUCCESS') return STATUS_CONFIG.SUCCESS;
    if (upperStatus === 'FAILED') return STATUS_CONFIG.FAILED;
    if (upperStatus === 'PENDING') return STATUS_CONFIG.PENDING;
  }
  return DEFAULT_STATUS;
}

/**
 * Get CSS class for status badge
 */
export function getStatusClass(status: string | boolean | undefined): string {
  return getStatusConfig(status).cssClass;
}

/**
 * Get display label for status
 */
export function getStatusLabel(status: string | boolean | undefined): string {
  return getStatusConfig(status).label;
}

/**
 * Get all available actions as an array for dropdowns
 */
export function getAllActions(): { value: string; label: string }[] {
  return Object.entries(ACTION_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
}

/**
 * Get all available statuses as an array for dropdowns
 */
export function getAllStatuses(): AuditStatus[] {
  return Object.values(STATUS_CONFIG);
}

/**
 * Normalize audit data from API response to AuditData interface
 */
export function normalizeAuditData(item: any): AuditData {
  const action = item.action || item.eventType || '';
  const success = item.success ?? (item.status?.toUpperCase() === 'SUCCESS');
  const status = item.status || (success ? 'SUCCESS' : 'FAILED');
  const statusConfig = getStatusConfig(status);
  
  return {
    // Core fields
    id: item.id,
    action: action,
    userEmail: item.userEmail || item.user || '',
    userBranchCode: item.userBranchCode,
    entityType: item.entityType || item.moduleType,
    entityId: item.entityId,
    details: item.details || item.activity || '',
    ipAddress: item.ipAddress,
    success: success,
    errorMessage: item.errorMessage,
    timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
    
    // Legacy compatibility
    eventType: action,
    activity: item.details || item.activity || '',
    status: status,
    moduleType: item.entityType || item.moduleType,
    
    // UI fields
    formattedTimestamp: item.timestamp ? 
      new Date(item.timestamp).toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }) : '',
    actionLabel: getActionLabel(action),
    statusDisplay: statusConfig.label,
    statusClass: statusConfig.cssClass,
    iconName: getActionIcon(action),
    
    // Metadata
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
  };
}

/**
 * Normalize an array of audit data items
 */
export function normalizeAuditDataArray(data: any[]): AuditData[] {
  if (!Array.isArray(data)) return [];
  return data.map(normalizeAuditData);
}

/**
 * Check if the audit action is authentication related
 */
export function isAuthAction(action: string): boolean {
  const authActions = ['LOGIN_ATTEMPT', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'OTP_SENT', 'OTP_VERIFIED', 'PASSWORD_CHANGED'];
  return authActions.includes(action);
}

/**
 * Check if the audit action is user management related
 */
export function isUserAction(action: string): boolean {
  const userActions = ['USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_STATUS_CHANGED'];
  return userActions.includes(action);
}

/**
 * Check if the audit action is role/permission related
 */
export function isRoleAction(action: string): boolean {
  const roleActions = ['ROLE_CREATED', 'ROLE_UPDATED', 'ROLE_DELETED', 'PERMISSION_ASSIGNED', 'PERMISSION_REVOKED'];
  return roleActions.includes(action);
}

/**
 * Check if the audit action is branch related
 */
export function isBranchAction(action: string): boolean {
  const branchActions = ['BRANCH_CREATED', 'BRANCH_UPDATED', 'BRANCH_DELETED', 'BRANCH_UPLOADED'];
  return branchActions.includes(action);
}

/**
 * Check if the audit action is sanction related
 */
export function isSanctionAction(action: string): boolean {
  const sanctionActions = [
    'SANCTION_SCREENED', 'SANCTION_BATCH_SCREENED', 'SANCTION_LIST_SYNCED', 
    'SANCTION_HIT_FOUND', 'SANCTION_ENTRY_VIEWED', 'SANCTION_ENTRY_CREATED',
    'SANCTION_ENTRY_DELETED', 'SANCTION_ENTRY_DEACTIVATED', 'SANCTION_BULK_UPLOAD'
  ];
  return sanctionActions.includes(action);
}

/**
 * Get category for an action
 */
export function getActionCategory(action: string): 'auth' | 'user' | 'role' | 'branch' | 'data' | 'sanction' | 'other' {
  if (isAuthAction(action)) return 'auth';
  if (isUserAction(action)) return 'user';
  if (isRoleAction(action)) return 'role';
  if (isBranchAction(action)) return 'branch';
  if (isSanctionAction(action)) return 'sanction';
  if (['DATA_VIEWED', 'DATA_EXPORTED', 'REPORT_GENERATED'].includes(action)) return 'data';
  return 'other';
}

/**
 * Get color for action category
 */
export function getActionCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    auth: '#2563eb',    // blue
    user: '#16a34a',    // green
    role: '#7c3aed',    // purple
    branch: '#d97706',  // amber
    data: '#0891b2',    // cyan
    sanction: '#dc2626', // red
    other: '#6b7280',   // gray
  };
  return colors[category];
}