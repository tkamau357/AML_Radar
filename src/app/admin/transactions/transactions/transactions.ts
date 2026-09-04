import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TableAction, HeaderAction } from '../../../shared/components/dynamic-tables/dynamic-tables.component';
import { UserResponse } from '../../user/users.service';

@Component({
  selector: 'app-transactions',
  standalone: false,
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit, OnDestroy {
  transactions: any[] = [];
  isLoading = false;

  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;

  columns = [
    { label: '#',            field: 'index' },
    { label: 'Transaction No',   field: 'firstName' },
    { label: 'Date Received',    field: 'lastName' },
    { label: 'Amount',        field: 'email' },
    { label: 'Reference No',       field: 'branchName' },
    { label: 'Status',       field: 'status', type: 'badge' },    
  ];

  actions: TableAction<UserResponse>[] = [
    {
      label: 'View',
      icon: 'visibility',
      onClick: (row) => this.viewTransaction(row),
    },
  ];

  headerActions: HeaderAction[] = [
    {
      icon: 'refresh',
      tooltip: 'Refresh',
      onClick: () => this.loadTransactions(),
    },
  ];

  private subs: Subscription[] = [];

  constructor(
  ) {}

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadTransactions() {

  }

  viewTransaction(row: any) {

  }
}
