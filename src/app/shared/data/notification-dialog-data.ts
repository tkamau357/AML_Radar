export interface NotificationDialogData {
    status?: 'error' | 'success' | 'warn';
    message?: string;
    icon?: string;
    buttonText?: string;
}