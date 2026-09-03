import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ScreeningResponse, MatchResult } from '../screening.service';

@Component({
  selector: 'app-screening-dialog',
  standalone: false,
  templateUrl: './screening-dialog.html',
  styleUrl: './screening-dialog.scss',
})
export class ScreeningDialog {
  constructor(
    public dialogRef: MatDialogRef<ScreeningDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ScreeningResponse
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  viewAll(): void {
    this.dialogRef.close({ action: 'viewAll' });
  }

  viewMatch(match: MatchResult): void {
    this.dialogRef.close({ 
      action: 'viewMatch', 
      match: match 
    });
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'check_circle';
      case 'PARTIAL':
        return 'warning';
      case 'FAILED':
        return 'error';
      default:
        return 'info';
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) {
      return 'linear-gradient(135deg, #dc3545, #e74c3c)';
    } else if (score >= 60) {
      return 'linear-gradient(135deg, #ff9800, #f57c00)';
    } else if (score >= 40) {
      return 'linear-gradient(135deg, #2196f3, #1565c0)';
    } else {
      return 'linear-gradient(135deg, #4caf50, #2e7d32)';
    }
  }

  getMatchTypeClass(matchType: string): string {
    return matchType.toLowerCase();
  }
}