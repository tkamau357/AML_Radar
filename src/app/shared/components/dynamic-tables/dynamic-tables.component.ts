import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  OnInit,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SelectionModel } from '@angular/cdk/collections';
import { PermissionsReference } from '../../../data/types/permissions-reference';
import { LoadingService } from '../../../core/service/loading.service';

export interface ModuleTypeOption {
  id: number | null;
  name: string;
}

export interface CustomFilterOption {
  value: any;
  label: string;
}

export interface TableAction<T = any> {
  label: string;
  icon: string;
  permission?: Permissions;
  show?: (row: T) => boolean;
  onClick: (row: T) => void;
}

export interface HeaderAction {
  icon: string;
  label?: string;
  permission?: string;
  onClick: () => void;
  tooltip?: string;
  className?: string;
  disabled?: () => boolean;
  show?: () => boolean;
}

@Component({
  selector: 'app-dynamic-tables',
  standalone: false,
  templateUrl: './dynamic-tables.component.html',
  styleUrl: './dynamic-tables.component.scss',
})
export class DynamicTablesComponent implements OnChanges, OnInit, OnDestroy {
  protected readonly permissionsReference = PermissionsReference
  @Input() actions: TableAction[] = [];
  @Input() headerActions: HeaderAction[] = [];
  @Input() userPermissions: Permissions[] = [];
  @Input() showModuleTypeFilter = false;
  @Input() moduleTypes: ModuleTypeOption[] = [];
  @Input() selectedModuleTypeId: number | null = null;

  @Input() pageTitle = '';
  @Input() pageSubtitle = '';
  @Input() TableSubtitle = '';
  @Input() addButtonLabel = 'Add';
  @Input() showAddButton = true;
  @Input() buttonPermission: string = '';
  @Output() add = new EventEmitter<void>();
  @Input() secondaryButtonLabel = '';
  @Input() showSecondaryButton = false;
  @Input() secondaryButtonPermission: string = '';
  @Input() secondaryButtonClass =
    'text-[#2A5CAA] text-sm px-4 py-2 rounded-md border border-[#2A5CAA] transition-all duration-200 hover:bg-[#2A5CAA]/10';
  @Output() secondaryButtonClick = new EventEmitter<void>();
  @Input() isLoading = false;
  
  /**
   * Optional: Subscribe to a loading observable instead of using isLoading input.
   * When provided, this takes precedence over the isLoading input.
   * Use with LoadingService.loading$ for centralized loading state.
   */
  @Input() loading$?: Observable<boolean>;
  
  /**
   * Whether to use the global LoadingService automatically.
   * When true, subscribes to LoadingService.loading$ instead of using isLoading input.
   * Default: false (for backward compatibility)
   */
  @Input() useGlobalLoading = false;
  
  // Internal loading state (resolved from isLoading, loading$, or global service)
  internalLoading = false;
  private loadingSub?: Subscription;
  
  @Input() noRecordsMessage = 'No records available at the moment.';
  @Input() addButtonClass =
    'text-white text-sm px-4 py-2 rounded-md transition-all duration-200 hover:brightness-110 active:brightness-95';
  @Input() addButtonBackground: string | null = 'linear-gradient(135deg, #00a5e4 0%, #2a5caa 100%)';
  @Input() serverSideSearch = false;

  @Input() totalDataCount: number = 0;
  @Output() paginationChange = new EventEmitter<{ pageNumber: number; pageSize: number }>();

  searchText: string = '';
  @Output() search = new EventEmitter<string>();

  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  @Input() buttons: string[] = [];

  @Input() showExcel: boolean = true;
  @Input() showPdf: boolean = true;

  @Input() showSearch = true;
  @Input() searchPlaceholder = 'Search';
  @Input() ModuleTypefilter = '';

  @Input() maxVisibleActions: number = 2;
  @Input() customFilters: CustomFilterOption[] = [];
  @Input() customFilterLabel = 'Filter by Approval Status';
  @Output() customFilterChange = new EventEmitter<any>();

  selectedCustomFilter: any = null;
  filteredCustomFilters: CustomFilterOption[] = [];

  private allCustomFilterOption: CustomFilterOption = {
    value: null,
    label: 'All records'
  };

  private isSelectingCustomFilter = false;

  customFilterControl = new FormControl<CustomFilterOption | string | null>(null);

  @ViewChild('customFilterAuto') customFilterAutocomplete!: MatAutocomplete;

  module = '';
  component = 'recon-status';

  @Output() moduleTypeChanged = new EventEmitter<number | null>();
  @ViewChild('moduleAuto') moduleAutocomplete!: MatAutocomplete;

  moduleControl = new FormControl<ModuleTypeOption | string | null>(null);
  filteredModuleTypes: ModuleTypeOption[] = [];

  private allOption: ModuleTypeOption = { id: null, name: 'All records' };

  private destroy$ = new Subject<void>();
  private valueChangesSub?: Subscription;

  private isSelecting = false;

  private getPermittedModuleTypeIds(): number[] {
    const ids = new Set<number>();

    (this.userPermissions || []).forEach((policy: any) => {
      if (!policy || !Array.isArray(policy.modules)) {
        return;
      }

      policy.modules.forEach((module: any) => {
        const id = module?.id ?? module?.moduleTypeId ?? module?.moduleId;
        const numericId = typeof id === 'string' ? Number(id) : id;

        if (typeof numericId === 'number' && !isNaN(numericId)) {
          ids.add(numericId);
        }
      });
    });

    return Array.from(ids);
  }

  private getPermittedModuleTypes(): ModuleTypeOption[] {
    const permittedIds = new Set(this.getPermittedModuleTypeIds());
    return this.moduleTypes.filter(
      module => module.id !== null && permittedIds.has(module.id)
    );
  }

  private updateFilteredModuleTypes(): void {
    this.filteredModuleTypes = [this.allOption, ...this.getPermittedModuleTypes()];
  }

  private isPermittedModule(module: ModuleTypeOption | null): boolean {
    return !!module && module.id !== null && this.getPermittedModuleTypeIds().includes(module.id);
  }

  @Input() pageIndex = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 25, 50, 100];
  @Input() checkboxDisabled: (row: any) => boolean = () => false;

  @Output() rowClick = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() selectionToggle = new EventEmitter<{ row: any; selected: boolean }>();

  // kept for backward compatibility with non-server-side users
  filteredData: any[] = [];
  pagedData: any[] = [];
  private originalData: any[] = [];

  @Input() serverSideSorting = false;

  @Output() sortChange = new EventEmitter<{
    field: string;
    direction: 'asc' | 'desc' | null;
  }>();

  activeSortField: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;

  rowsPerPage = 10;
  rowsPerPageOptions = [5, 10, 20, 50, 100];

  constructor(
    private cdr: ChangeDetectorRef,
    private loadingService: LoadingService,
  ) {
    this.moduleControl.setValue(this.allOption, { emitEvent: false });
    this.filteredModuleTypes = [this.allOption];
    
    this.customFilterControl.setValue(this.allCustomFilterOption, { emitEvent: false });
    this.filteredCustomFilters = [this.allCustomFilterOption, ...this.customFilters];
  }

  ngOnInit(): void {
    this.setPageSize();
    window.addEventListener('resize', () => this.setPageSize());

    // Setup loading state subscription
    this.setupLoadingSubscription();

      this.valueChangesSub = this.moduleControl.valueChanges.pipe(
        debounceTime(350),
        distinctUntilChanged((prev, curr) => {
          const prevId = prev && typeof prev === 'object' ? prev.id : prev;
          const currId = curr && typeof curr === 'object' ? curr.id : curr;
          return prevId === currId;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        if (typeof value === 'string') {
          return;
        }
        if (!value || (value && typeof value === 'object' && value.id === null)) {
          this.moduleTypeChanged.emit(null);
          return;
        }
        const selected = value as ModuleTypeOption;
        this.moduleTypeChanged.emit(selected.id);
      });
    this.syncDisplayData();
  }

  /**
   * Setup loading state subscription based on configuration.
   * Priority: loading$ input > useGlobalLoading > isLoading input
   */
  private setupLoadingSubscription(): void {
    // Unsubscribe from any existing subscription
    this.loadingSub?.unsubscribe();

    // Determine which loading source to use
    let source$: Observable<boolean> | undefined;
    
    if (this.loading$) {
      // Custom loading observable provided
      source$ = this.loading$;
    } else if (this.useGlobalLoading) {
      // Use global loading service
      source$ = this.loadingService.loading$;
    }

    if (source$) {
      this.loadingSub = source$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(loading => {
        this.internalLoading = loading;
        this.cdr.markForCheck();
      });
    } else {
      // Fallback to input-based loading
      this.internalLoading = this.isLoading;
    }
  }

  /**
   * Get the effective loading state.
   * Used by the template to show/hide loading indicator.
   */
  get effectiveLoading(): boolean {
    // If using observable-based loading, use internal state
    if (this.loading$ || this.useGlobalLoading) {
      return this.internalLoading;
    }
    // Otherwise use the input
    return this.isLoading;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.loadingSub?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['moduleTypes'] || changes['userPermissions']) {
      this.updateFilteredModuleTypes();

      const current = this.moduleControl.value;
      if (
        !current ||
        (typeof current === 'object' &&
          current.id !== null &&
          !this.isPermittedModule(current as ModuleTypeOption))
      ) {
        this.moduleControl.setValue(this.allOption, { emitEvent: false });
      }
    }

    if (
      changes['selectedModuleTypeId'] ||
      changes['moduleTypes'] ||
      changes['userPermissions']
    ) {
      this.syncSelectedModuleType();
    }

    if (changes['customFilters']) {
      this.updateFilteredCustomFilters();
    }

    if (changes['selectedCustomFilter']) {
      this.syncSelectedCustomFilter();
    }

    if (changes['data']) {
      this.syncDisplayData();
    }

    // Force change detection when loading state or data changes
    // This ensures the view updates correctly when parent components update these values
    if (changes['isLoading'] || changes['data']) {
      // Sync internal loading state if not using observable
      if (!this.loading$ && !this.useGlobalLoading && changes['isLoading']) {
        this.internalLoading = this.isLoading;
      }
      this.cdr.markForCheck();
    }

    // Re-setup loading subscription if loading$ or useGlobalLoading changes
    if (changes['loading$'] || changes['useGlobalLoading']) {
      this.setupLoadingSubscription();
    }
  }

  setPageSize() {
    const height = window.innerHeight;

    if (height > 1200) {
      this.pageSize = 20;
    } else if (height > 900) {
      this.pageSize = 15;
    } else {
      this.pageSize = 10;
    }

    this.syncDisplayData();
  }

  /**
   * True when the backend is driving pagination (totalDataCount provided).
   * Falls back to client-side slicing when totalDataCount is 0 / not supplied.
   */
  get isServerPaginated(): boolean {
    return this.totalDataCount > 0;
  }

  /** Syncs filteredData/pagedData from incoming data. */
  syncDisplayData(): void {
    this.originalData = [...(this.data || [])];
    this.filteredData = [...this.originalData];

    if (this.isServerPaginated) {
      this.pagedData = [...this.filteredData];
    } else {
      this.updatePagedData();
    }

    if (this.activeSortField && this.sortDirection) {
      this.sortDisplayedData();
    }

    this.reconcileSelectionWithVisibleRows();
  }

  private syncSelectedModuleType(): void {
    // No selected module type means "All records"
    if (this.selectedModuleTypeId === null || this.selectedModuleTypeId === undefined) {
      this.moduleControl.setValue(this.allOption, {
        emitEvent: false,
      });

      return;
    }

    const selectedModule = this.moduleTypes.find(
      (module) => module.id === Number(this.selectedModuleTypeId)
    );

    if (selectedModule) {
      this.moduleControl.setValue(selectedModule, {
        emitEvent: false,
      });
    } else {
      this.moduleControl.setValue(this.allOption, {
        emitEvent: false,
      });
    }
  }

  displayModuleType(option: any): string {
    return option && typeof option === 'object' ? option.name : (option || '');
  }

  onModuleFocus(): void {
    this.updateFilteredModuleTypes();
  }

  onModuleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value.trim().toLowerCase();

    const baseList = this.getPermittedModuleTypes();
    if (inputValue) {
      this.filteredModuleTypes = [
        this.allOption,
        ...baseList.filter(m => m.name.toLowerCase().includes(inputValue)),
      ];
    } else {
      this.filteredModuleTypes = [this.allOption, ...baseList];
    }
  }

  onModuleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.filteredModuleTypes.length > 0) {
      const first = this.filteredModuleTypes[0];
      this.isSelecting = true;
      this.moduleControl.setValue(first, { emitEvent: false });
      this.moduleTypeChanged.emit(first.id ?? null);
      event.preventDefault();
    }

    const val = this.moduleControl.value;
    if (
      typeof val === 'object' &&
      val !== null &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey &&
      event.key.length === 1 &&
      /^[a-zA-Z0-9 ]$/.test(event.key)
    ) {
      this.moduleControl.setValue('');
    }
  }

  onModuleSelected(event: any): void {
    console.log('Option selected:', event.option.value);
    this.isSelecting = true;
    const selected = event.option.value as ModuleTypeOption | null;
    this.moduleControl.setValue(selected, { emitEvent: false });
    this.moduleTypeChanged.emit(selected?.id ?? null);

    setTimeout(() => {
      this.isSelecting = false;
    }, 200);
  }

  onModuleBlur(): void {
    if (this.isSelecting) {
      return;
    }

    if (this.moduleAutocomplete?.isOpen) {
      return;
    }

    const value = this.moduleControl.value;

    if (typeof value === 'string' && value.trim()) {
      const matched = this.moduleTypes.find(
        m => m.name.toLowerCase() === value.trim().toLowerCase()
      );

      if (matched && this.isPermittedModule(matched)) {
        this.moduleControl.setValue(matched, { emitEvent: false });
        this.moduleTypeChanged.emit(matched.id);
      } else {
        this.moduleControl.setValue(this.allOption, { emitEvent: false });
        this.moduleTypeChanged.emit(null);
      }
    }
  }

  isSelectedModule(): boolean {
    const value = this.moduleControl.value;
    return !!value && typeof value === 'object' && (value as ModuleTypeOption).id !== null;
  }

  clearModuleFilter(): void {
    this.moduleControl.setValue(this.allOption, { emitEvent: false });
    this.moduleTypeChanged.emit(null);
  }

  private updateFilteredCustomFilters(): void {
    this.filteredCustomFilters = [this.allCustomFilterOption, ...(this.customFilters || [])];
  }

  private syncSelectedCustomFilter(): void {
    if (
      this.selectedCustomFilter === null ||
      this.selectedCustomFilter === undefined ||
      this.selectedCustomFilter === ''
    ) {
      this.customFilterControl.setValue(this.allCustomFilterOption, { emitEvent: false });

      return;
    }

    const selected = this.customFilters.find(
      filter => String(filter.value) === String(this.selectedCustomFilter)
    );

    if (selected) {
      this.customFilterControl.setValue(selected, { emitEvent: false });
      this.cdr.detectChanges();
    } else {
      this.customFilterControl.setValue(this.allCustomFilterOption, { emitEvent: false });
    }
  }

  displayCustomFilter(option: any): string {
    return option && typeof option === 'object'
      ? option.label
      : (option || '');
  }

  onCustomFilterFocus(): void {
    this.updateFilteredCustomFilters();
  }

  onCustomFilterInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value.trim().toLowerCase();

    const baseList = this.customFilters || [];

    if (inputValue) {
      this.filteredCustomFilters = [this.allCustomFilterOption, ...baseList.filter(filter =>
        filter.label.toLowerCase().includes(inputValue)
      )];
    } else {
      this.filteredCustomFilters = [this.allCustomFilterOption, ...baseList];
    }
  }

  onCustomFilterSelected(event: any): void {
    console.log('Custom filter selected:', event.option.value);

    this.isSelectingCustomFilter = true;

    const selected = event.option.value as CustomFilterOption | null;

    if (!selected || selected.value === null) {
      this.selectedCustomFilter = null;

      this.customFilterControl.setValue(this.allCustomFilterOption, { emitEvent: false });

      this.customFilterChange.emit(null);
    } else {
      this.selectedCustomFilter = selected.value;

      this.customFilterControl.setValue(selected, { emitEvent: false });

      this.customFilterChange.emit(selected.value);
    }

    setTimeout(() => {
      this.isSelectingCustomFilter = false;
    }, 200);
  }

  onCustomFilterKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.filteredCustomFilters.length > 0) {
      const first = this.filteredCustomFilters[0];

      this.isSelectingCustomFilter = true;

      this.customFilterControl.setValue(first, { emitEvent: false });

      if (first.value === null) {
        this.selectedCustomFilter = null;
        this.customFilterChange.emit(null);
      } else {
        this.selectedCustomFilter = first.value;
        this.customFilterChange.emit(first.value);
      }

      event.preventDefault();

      setTimeout(() => {
        this.isSelectingCustomFilter = false;
      }, 200);

      return;
    }

    const val = this.customFilterControl.value;

    if (typeof val === 'object' && val !== null && !event.ctrlKey && !event.altKey &&
      !event.metaKey && event.key.length === 1 && /^[a-zA-Z0-9 ]$/.test(event.key)) {
      this.customFilterControl.setValue('', {emitEvent: false});
    }
  }

  onCustomFilterBlur(): void {
    if (this.isSelectingCustomFilter) {
      return;
    }

    if (this.customFilterAutocomplete?.isOpen) {
      return;
    }

    const value = this.customFilterControl.value;

    if (typeof value === 'string' && value.trim()) {
      const matched = this.customFilters.find(filter =>
        filter.label.toLowerCase() ===
        value.trim().toLowerCase()
      );

      if (matched) {
        this.customFilterControl.setValue(matched, { emitEvent: false });

        this.selectedCustomFilter = matched.value;

        this.customFilterChange.emit(matched.value);
      } else {
        this.customFilterControl.setValue(this.allCustomFilterOption, { emitEvent: false });

        this.selectedCustomFilter = null;
        this.customFilterChange.emit(null);
      }
    }
  }

  isSelectedCustomFilter(): boolean {
    const value = this.customFilterControl.value;

    return !!(value &&typeof value === 'object' && (value as CustomFilterOption).value !== null);
  }

  clearCustomFilter(): void {
    this.customFilterControl.setValue(this.allCustomFilterOption, { emitEvent: false });

    this.selectedCustomFilter = null;
    this.customFilterChange.emit(null);
  }


  onAdd(): void {
    this.add.emit();
  }

  onSecondaryButton(): void {
    this.secondaryButtonClick.emit();
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.search.emit(this.searchText);
    if (!this.serverSideSearch) {
      this.applyFilter();
    }
  }

  /** Client-side filter — only used when serverSideSearch is false */
  applyFilter(): void {
    const term = this.searchText?.trim().toLowerCase();
    this.filteredData = !term
      ? [...this.data]
      : this.data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(term)
        )
      );
    this.pageIndex = 0;
    this.updatePagedData();
  }

  updatePagedData(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedData = this.filteredData.slice(start, start + this.pageSize);
  }

  pageChangeEvent(): void {
    console.log("pagenumber", this.pageIndex)
    console.log("pagesize", this.pageSize)
    this.paginationChange.emit({ pageNumber: this.pageIndex, pageSize: this.pageSize });
  }

  onPageSizeChange(): void {
    this.pageIndex = 0;
    if (this.serverSideSearch || this.isServerPaginated) {
      this.pageChangeEvent();
    } else {
      this.updatePagedData();
    }
  }

  get totalPages(): number[] {
    const count = (this.serverSideSearch || this.isServerPaginated)
      ? Math.ceil(this.totalDataCount / this.pageSize)
      : Math.ceil(this.filteredData.length / this.pageSize);
    return Array.from({ length: count }, (_, i) => i);
  }

  get pageStart(): number {
    return this.data.length ? this.pageIndex * this.pageSize + 1 : 0;
  }

  get pageEnd(): number {
    return (this.serverSideSearch || this.isServerPaginated)
      ? Math.min((this.pageIndex + 1) * this.pageSize, this.totalDataCount)
      : Math.min((this.pageIndex + 1) * this.pageSize, this.filteredData.length);
  }

  get totalElements(): number {
    return (this.serverSideSearch || this.isServerPaginated) ? this.totalDataCount : this.filteredData.length;
  }

  goToPage(index: number): void {
    this.pageIndex = index;
    if (this.serverSideSearch || this.isServerPaginated) {
      this.pageChangeEvent();
    } else {
      this.updatePagedData();
    }
  }

  prevPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      if (this.serverSideSearch || this.isServerPaginated) {
        this.pageChangeEvent();
      } else {
        this.updatePagedData();
      }
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages.length - 1) {
      this.pageIndex++;
      if (this.serverSideSearch || this.isServerPaginated) {
        this.pageChangeEvent();
      } else {
        this.updatePagedData();
      }
    }
  }

  toggleRowActions(row: any, event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    const dropdownHeight = 160;
    const viewportWidth = window.innerWidth;
    this.pagedData.forEach(r => {
      if (r !== row) {
        r.showMoreActions = false;
        r.dropdownPosition = null;
      }
    });
    if (row.showMoreActions) {
      row.showMoreActions = false;
      row.dropdownPosition = null;
      return;
    }
    if (viewportWidth < 850) {
      row.dropdownPosition = 'top';
    } else {
      const rect = button.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      row.dropdownPosition = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight
        ? 'top'
        : 'bottom';
    }

    row.showMoreActions = true;
  }

  closeRowActions(row: any) {
    row.showMoreActions = false;
  }
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const targetElement = event.target as HTMLElement;
    const clickedInsideDropdown = targetElement.closest('.row-actions-container');
    const clickedOnButton = targetElement.closest('.ellipsis-btn');
    if (clickedInsideDropdown || clickedOnButton) return;
    this.pagedData.forEach(row => row.showMoreActions = false);
  }

  get isAnyDropdownOpen(): boolean {
    return this.pagedData.some(row => row.showMoreActions);
  }

  formatBackendDate(value: any): Date | null {
    if (!value) return null;

    // LocalDate → [yyyy, mm, dd]
    if (Array.isArray(value) && value.length === 3) {
      const [year, month, day] = value;
      return new Date(year, month - 1, day);
    }

    // LocalDateTime → [yyyy, mm, dd, hh, mm, ss, nanos]
    if (Array.isArray(value) && value.length >= 6) {
      const [year, month, day, hour, minute, second] = value;
      return new Date(year, month - 1, day, hour, minute, second);
    }

    // Already a valid date/string
    return new Date(value);
  }

  getStatusBadgeClass(status: any): { text: string; class: string } {
    const value = String(status)?.toLowerCase();
    if (status === true || status === 1 || value === 'active') {
      return {
        text: 'Active',
        class: 'text-[#2A5CAA] bg-[#2A5CAA]/10'
      };
    }
    if (status === false || status === 0 || value === 'inactive') {
      return {
        text: 'Inactive',
        class: 'text-white bg-[#2A5CAA]'
      };
    }
    if (value === 'locked') {
      return {
        text: 'locked',
        class: 'text-white bg-[#2A5CAA]'
      };
    }
    if (value === 'approved') {
      return {
        text: 'Approved',
        class: 'text-[#2A5CAA] bg-[#2A5CAA]/10'
      };
    }
    if (value === 'pending') {
      return {
        text: 'Pending',
        class: 'text-white bg-[#2A5CAA]'
      };
    }
    if (value === 'pending_delete') {
      return {
        text: 'Pending Delete',
        class: 'text-red-400 bg-[#2A5CAA]/10'
      };
    }
    if (value === 'rejected') {
      return {
        text: 'Rejected',
        class: 'text-red-400 bg-[#2A5CAA]/10'
      };
    }
    if (value === 'completed') {
      return {
        text: 'Completed',
        class: 'text-[#2A5CAA] bg-[#2A5CAA]/10'
      };
    }
    if (value === 'in_progress') {
      return {
        text: 'Pending',
        class: 'text-white bg-[#2A5CAA]'
      };
    }
    if (value === 'failed') {
      return {
        text: 'Failed',
        class: 'text-red-400 bg-[#2A5CAA]/10'
      };
    }
    return {
      text: String(status),
      class: 'text-gray-600 bg-gray-200'
    };
  }

  getActionLabel(icon: string): string {
    const map: Record<string, string> = {
      visibility: 'View',
      edit: 'Edit',
      delete: 'Delete',
      lock: 'Lock',
      lock_open: 'Unlock',
      block: 'Block',
      check_circle: 'Activate',
      download: 'View',
      reset_iso: 'Update Role',
      vpn_key: 'Reset Password',
      logout: 'Kill Session'
    };

    return map[icon] || '';
  }

  clearSearch() {
    this.searchText = '';
    this.search.emit('');
    if (!this.serverSideSearch) {
      this.applyFilter();
    }
  }

  getRowNumber(index: number): number {
    return index + 1 + this.pageIndex * this.pageSize;
  }

  getVisibleActions(row: any): TableAction[] {
    // Flatten all permissions from all policies
    const userPermissionNames = this.userPermissions
      .flatMap((policy: any) => policy.permissions || [])
      .map((perm: any) => perm.permissionName);

    return this.actions.filter(action => {
      const passesShow = !action.show || action.show(row);
      const passesPermission = !action.permission || userPermissionNames.includes(action.permission);

      return passesShow && passesPermission;
    });
  }

  hasAnyVisibleActions(): boolean {
    const userPermissionNames = this.userPermissions
      .flatMap((policy: any) => policy.permissions || [])
      .map((perm: any) => perm.permissionName);

    return this.actions.some(action => !action.permission || userPermissionNames.includes(action.permission));
  }

  getVisibleHeaderActions(): HeaderAction[] {
    const userPermissionNames = this.userPermissions
      .flatMap((policy: any) => policy.permissions || [])
      .map((perm: any) => perm.permissionName);

    return (this.headerActions || []).filter((action) => {
      const passesShow = !action.show || action.show();
      const passesPermission = !action.permission || userPermissionNames.includes(action.permission);
      return passesShow && passesPermission;
    });
  }

  exportToExcel(): void {
    const source = (this.serverSideSearch || this.isServerPaginated) ? this.data : this.filteredData;
    const exportData = source.map(row => {
      const obj: any = {};
      this.columns.forEach(col => {
        if (col.type === 'badge') {
          obj[col.label] = this.getStatusBadgeClass(row[col.field]).text;
        } else if (col.type === 'date') {
          obj[col.label] = row[col.field] ? new Date(row[col.field]).toLocaleDateString() : '';
        } else {
          obj[col.label] = row[col.field];
        }
      });
      return obj;
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${this.pageTitle || 'export'}.xlsx`);
  }

  exportToPDF(): void {
    const source = (this.serverSideSearch || this.isServerPaginated) ? this.data : this.filteredData;
    if (!source.length) return;

    const doc = new jsPDF();

    const head = [this.columns.map(col => col.label)];

    const body = source.map(row =>
      this.columns.map(col => {
        if (col.type === 'badge') {
          return this.getStatusBadgeClass(row[col.field]).text;
        } else if (col.type === 'date') {
          return row[col.field] ? new Date(row[col.field]).toLocaleDateString() : '';
        } else {
          return row[col.field];
        }
      })
    );

    autoTable(doc, {
      head,
      body,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [42, 92, 170] },
    });

    doc.save(`${this.pageTitle || 'export'}.pdf`);
  }

  isSortable(col: any): boolean {
    return (col.type !== 'checkbox' && col.field !== 'index' && col.sortable !== false);
  }

  onSort(col: any): void {
    if (!this.isSortable(col)) {
      return;
    }

    if (this.activeSortField !== col.field) {
      this.activeSortField = col.field;
      this.sortDirection = 'asc';
    } else if (this.sortDirection === 'asc') {
      this.sortDirection = 'desc';
    } else if (this.sortDirection === 'desc') {
      this.sortDirection = null;
      this.activeSortField = null;
    } else {
      this.activeSortField = col.field;
      this.sortDirection = 'asc';
    }

    if (this.serverSideSorting) {
      this.sortChange.emit({
        field: this.activeSortField || '',
        direction: this.sortDirection
      });

      return;
    }

    this.sortDisplayedData();
  }

  private sortDisplayedData(): void {
    if (!this.activeSortField || !this.sortDirection) {
      this.filteredData = [...this.originalData];

      if (this.isServerPaginated) {
        this.pagedData = [...this.filteredData];
      } else {
        this.updatePagedData();
      }

      return;
    }

    const field = this.activeSortField;
    const direction = this.sortDirection === 'asc' ? 1 : -1;

    this.filteredData = [...this.filteredData].sort((a, b) => {
      const column = this.columns.find(
        col => col.field === field
      );

      const valueA = column?.formatter
        ? column.formatter(a)
        : a?.[field];

      const valueB = column?.formatter
        ? column.formatter(b)
        : b?.[field];

      return this.compareValues(
        valueA,
        valueB,
        direction
      );
    });

    if (this.isServerPaginated) {
      this.pagedData = [...this.filteredData];
    } else {
      this.updatePagedData();
    }
  }

  private compareValues(valueA: any, valueB: any, direction: number): number {
    // Null values always go to the bottom
    if (valueA === null || valueA === undefined || valueA === '') {
      return 1;
    }

    if (valueB === null || valueB === undefined || valueB === '') {
      return -1;
    }

    // Boolean sorting
    if (typeof valueA === 'boolean' || typeof valueB === 'boolean') {
      return (Number(valueA) - Number(valueB)) * direction;
    }

    // Number sorting
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return (valueA - valueB) * direction;
    }

    // Date sorting
    const dateA = new Date(valueA);
    const dateB = new Date(valueB);

    const isDateA = !isNaN(dateA.getTime()) && typeof valueA !== 'number';

    const isDateB = !isNaN(dateB.getTime()) && typeof valueB !== 'number';

    if (isDateA && isDateB) {
      return (dateA.getTime() - dateB.getTime()) * direction;
    }

    // String sorting
    return String(valueA).localeCompare(
      String(valueB),
      undefined,
      {
        numeric: true,
        sensitivity: 'base'
      }
    ) * direction;
  }

  selection = new SelectionModel<any>(true, []);
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = (this.serverSideSearch || this.isServerPaginated) ? this.data.length : this.filteredData.length;
    return numSelected === numRows;
  }

  masterToggle(event: Event): void {
    event.stopPropagation();

    const rows = (this.serverSideSearch || this.isServerPaginated) ? this.data : this.filteredData;
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      rows.forEach(row => this.selection.select(row));
    }
    this.cdr.detectChanges();
    this.selectionChange.emit(this.selection.selected);
  }

  isIndeterminate(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = (this.serverSideSearch || this.isServerPaginated) ? this.data.length : this.filteredData.length;
    return numSelected > 0 && numSelected < numRows;
  }

  toggleRow(row: any, event: Event): void {
    event.stopPropagation();
    this.selection.toggle(row);
    this.cdr.detectChanges();
    this.selectionToggle.emit({ row, selected: this.selection.isSelected(row) });
    this.selectionChange.emit(this.selection.selected);
  }

  syncSelectionState(): void {
    this.reconcileSelectionWithVisibleRows();
    this.cdr.detectChanges();
    this.selectionChange.emit(this.selection.selected);
  }

  /**
 * Get the appropriate tooltip class based on action icon
 */
  getTooltipClass(icon: string): string {
    const map: Record<string, string> = {
      'visibility': 'mat-tooltip--action',
      'edit': 'mat-tooltip--brand',
      'delete': 'mat-tooltip--danger',
      'lock': 'mat-tooltip--warning',
      'lock_open': 'mat-tooltip--success',
      'block': 'mat-tooltip--danger',
      'check_circle': 'mat-tooltip--success',
      'download': 'mat-tooltip--action',
      'vpn_key': 'mat-tooltip--brand',
      'logout': 'mat-tooltip--danger'
    };
    
    return map[icon] || 'mat-tooltip--action';
  }

  private reconcileSelectionWithVisibleRows(): void {
    const rows = (this.serverSideSearch || this.isServerPaginated) ? this.data : this.pagedData;
    if (!Array.isArray(rows)) {
      return;
    }

    rows.forEach((row) => {
      if (row?.selected && !this.selection.isSelected(row)) {
        this.selection.select(row);
      } else if (!row?.selected && this.selection.isSelected(row)) {
        this.selection.deselect(row);
      }
    });
  }
}
