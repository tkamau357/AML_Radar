import { Component, computed, Inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuditingComponent } from '../auditing/auditing.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-audit-details',
  imports: [CommonModule],
  templateUrl: './view-audit-details.component.html',
  styleUrl: './view-audit-details.component.scss'
})
export class ViewAuditDetailsComponent implements OnInit {

  auditInfo: any
  hasMetadata: boolean = false

  constructor(
    public dialogRef: MatDialogRef<AuditingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {

  }

  ngOnInit(): void {
    this.auditInfo = this.data.record
    const meta = this.auditInfo.metadata;
    this.hasMetadata = meta && Object.keys(meta).length > 0;
  }

  selectedLog = signal<AuditLog | null>(null);
  searchTerm = signal('');
  filterCategory = signal('all');

  getCategoryClass(category: string): string {
    const map: Record<string, string> = {
      'USER ACCOUNTS': 'bg-primary bg-opacity-10 text-primary border-primary border-opacity-25',
      'AUTHENTICATION': 'bg-blue bg-opacity-10 text-blue border-blue border-opacity-25',
      'SYSTEM': 'bg-secondary bg-opacity-10 text-secondary border-secondary border-opacity-25'
    };
    return map[category] || map['SYSTEM'];
  }

  getEventIcon(event: string): string {
    const map: Record<string, string> = {
      'UPDATE': 'timeline',
      'LOGIN': 'person',
      'LOGOUT': 'logout',
      'READ': 'visibility'
    };
    return map[event] || 'timeline';
  }

  objectEntries(obj: any): [string, any][] {
    return obj ? Object.entries(obj) : [];
  }
}


interface Change {
  from: string;
  to: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  category: string;
  event: string;
  status: string;
  actor: string;
  message: string;
  ip: string;
  userAgent: string;
  changes: Record<string, Change> | null;
}