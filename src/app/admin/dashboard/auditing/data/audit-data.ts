// src/app/admin/dashboard/auditing/data/audit-data.ts (or wherever it's located)
export interface AuditData {
    id?: number;
    timestamp: Date | string;
    activity: string;
    userEmail: string;
    device: string;
    moduleType?: string;
    eventType?: string;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;
}