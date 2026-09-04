import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TableAction, HeaderAction } from '../../../shared/components/dynamic-tables/dynamic-tables.component';
import { UserResponse } from '../../user/users.service';

@Component({
  selector: 'app-case',
  standalone: false,
  templateUrl: './case.html',
  styleUrl: './case.scss',
})
export class Case implements OnInit, OnDestroy {
  cases: any[] = [];
  isLoading = false;

  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;

  columns = [
    { label: '#',            field: 'index' },
    { label: 'Name',   field: 'firstName' },
    { label: 'Date Received',    field: 'lastName' },
    { label: 'Title',        field: 'email' },
    { label: 'Reference No',       field: 'branchName' },
    { label: 'Status',       field: 'status', type: 'badge' },    
  ];

  actions: TableAction<UserResponse>[] = [
    {
      label: 'View',
      icon: 'visibility',
      onClick: (row) => this.viewCase(row),
    },
  ];

  headerActions: HeaderAction[] = [
    {
      icon: 'refresh',
      tooltip: 'Refresh',
      onClick: () => this.loadCases(),
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

  loadCases() {

  }

  viewCase(row: any) {

  }
}
