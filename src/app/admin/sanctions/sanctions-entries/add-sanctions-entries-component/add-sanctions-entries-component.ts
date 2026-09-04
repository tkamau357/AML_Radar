import { ChangeDetectorRef, Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SnackbarService } from '../../../../shared/services/snackbar.service';
import { SanctionListSourceInfo, SanctionsService, SanctionEntryResponse, ManualEntryRequest } from '../../sanctions.service';

interface BulkEntry {
  id: number;
  source: string;
  sourceDisplayName: string;
  entityType: string;
  fullName: string;
  aliases: string[];
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  idNumber?: string;
  pinNumber?: string;
  passportNumber?: string;
  address?: string;
  program?: string;
  listedDate?: string;
  remarks?: string;
  gazetteNotice?: string;
  caseReference?: string;
  status?: 'pending' | 'success' | 'error';
  errorMessage?: string;
}

@Component({
  selector: 'app-add-sanctions-entries-components',
  standalone: false,
  templateUrl: './add-sanctions-entries-component.html',
  styleUrl: './add-sanctions-entries-component.scss',
})
export class AddSanctionsEntriesComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  editId: number | null = null;
  isEditingBulkEntry = false;
  editingBulkEntryId: number | null = null;

  sources: SanctionListSourceInfo[] = [];
  entityTypes = ['INDIVIDUAL', 'ORGANIZATION', 'ENTITY', 'VESSEL', 'AIRCRAFT', 'UNKNOWN'];

  // Bulk upload properties
  bulkUploadExpanded = false;
  isDownloading = false;
  isUploading = false;
  isDragOver = false;
  selectedFile: File | null = null;
  uploadProgress = 0;
  bulkSource: string = '';
  replaceExisting = false;
  uploadResult: {
    success: boolean;
    message: string;
    entriesCreated?: number;
    errors?: Array<{ row: number; field: string; message: string }>;
  } | null = null;

  // Bulk entry table
  showBulkTable = false;
  bulkEntries: BulkEntry[] = [];
  private entryCounter = 0;

  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private service: SanctionsService,
    private snack: SnackbarService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      source: ['', Validators.required],
      entityType: ['', Validators.required],
      fullName: ['', Validators.required],
      aliases: [''],
      dateOfBirth: [''],
      placeOfBirth: [''],
      nationality: [''],
      idNumber: [''],
      pinNumber: [''],
      passportNumber: [''],
      address: [''],
      program: [''],
      listedDate: [''],
      remarks: [''],
      gazetteNotice: [''],
      caseReference: [''],
    });

    this.loadSources();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (!isNaN(id)) {
        this.isEditMode = true;
        this.editId = id;
        this.loadEntry(id);
      }
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private loadSources(): void {
    const s = this.service.getSources().subscribe({
      next: (sources: SanctionListSourceInfo[]) => {
        this.sources = sources;
        if (sources.length > 0 && !this.isEditMode) {
          this.bulkSource = sources[0].source;
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.cdr.detectChanges();
        this.snack.alertError(err?.error?.message || 'Failed to load sources');
      },
    });
    this.subs.push(s);
  }

  private loadEntry(id: number): void {
    const s = this.service.getEntry(id).subscribe({
      next: (entry: SanctionEntryResponse) => {
        this.form.patchValue({
          source: entry.source,
          sourceEntryId: entry.sourceEntryId || '',
          entityType: entry.entityType,
          fullName: entry.fullName,
          aliases: entry.aliases?.join('; ') || '',
          dateOfBirth: entry.dateOfBirth || '',
          placeOfBirth: entry.placeOfBirth || '',
          nationality: entry.nationality || '',
          program: entry.program || '',
          listedDate: entry.listedDate || '',
          remarks: entry.remarks || '',
        });
        // Disable source on edit (cannot change source)
        this.form.get('source')?.disable();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.cdr.detectChanges();
        this.snack.alertError(err?.error?.message || 'Failed to load entry');
        this.router.navigate(['admin/sanctions']);
      },
    });
    this.subs.push(s);
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    
    // If in bulk mode, add to table instead of submitting
    if (this.showBulkTable) {
      if (this.isEditingBulkEntry && this.editingBulkEntryId !== null) {
        this.updateBulkEntry();
      } else {
        this.addToBulkTable();
      }
      return;
    }

    this.isSubmitting = true;

    const raw = this.form.getRawValue();
    const payload: ManualEntryRequest = {
      source: raw.source,
      sourceEntryId: raw.sourceEntryId?.trim() || undefined,
      entityType: raw.entityType,
      fullName: raw.fullName.trim(),
      aliases: raw.aliases ? raw.aliases.split(';').map((s: string) => s.trim()).filter(Boolean) : [],
      dateOfBirth: raw.dateOfBirth || undefined,
      placeOfBirth: raw.placeOfBirth?.trim() || undefined,
      nationality: raw.nationality?.trim() || undefined,
      idNumber: raw.idNumber?.trim() || undefined,
      pinNumber: raw.pinNumber?.trim() || undefined,
      passportNumber: raw.passportNumber?.trim() || undefined,
      address: raw.address?.trim() || undefined,
      program: raw.program?.trim() || undefined,
      listedDate: raw.listedDate || undefined,
      remarks: raw.remarks?.trim() || undefined,
      gazetteNotice: raw.gazetteNotice?.trim() || undefined,
      caseReference: raw.caseReference?.trim() || undefined,
    };

    const sub = this.service.addEntry(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
        this.snack.alertSuccess('Entry created successfully');
        this.router.navigate(['admin/sanctions']);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
        this.snack.alertError(err?.error?.message || 'Failed to create entry');
      },
    });
    this.subs.push(sub);
  }

  // Add current form data to bulk table
  addToBulkTable(): void {
    if (this.form.invalid) {
      this.snack.alertError('Please fill in all required fields');
      return;
    }

    const raw = this.form.getRawValue();
    const sourceDisplayName = this.sources.find(s => s.source === raw.source)?.displayName || raw.source;

    const entry: BulkEntry = {
      id: ++this.entryCounter,
      source: raw.source,
      sourceDisplayName: sourceDisplayName,
      entityType: raw.entityType,
      fullName: raw.fullName.trim(),
      aliases: raw.aliases ? raw.aliases.split(';').map((s: string) => s.trim()).filter(Boolean) : [],
      dateOfBirth: raw.dateOfBirth || undefined,
      placeOfBirth: raw.placeOfBirth?.trim() || undefined,
      nationality: raw.nationality?.trim() || undefined,
      idNumber: raw.idNumber?.trim() || undefined,
      pinNumber: raw.pinNumber?.trim() || undefined,
      passportNumber: raw.passportNumber?.trim() || undefined,
      address: raw.address?.trim() || undefined,
      program: raw.program?.trim() || undefined,
      listedDate: raw.listedDate || undefined,
      remarks: raw.remarks?.trim() || undefined,
      gazetteNotice: raw.gazetteNotice?.trim() || undefined,
      caseReference: raw.caseReference?.trim() || undefined,
      status: 'pending'
    };

    this.bulkEntries.push(entry);
    this.snack.alertSuccess('Entry added to bulk list');

    // Reset form but keep source
    const source = this.form.get('source')?.value;
    this.form.reset({ source });
    this.cdr.detectChanges();
  }

  // Edit bulk entry - load data into form
  editBulkEntry(entry: BulkEntry): void {
    this.isEditingBulkEntry = true;
    this.editingBulkEntryId = entry.id;

    this.form.patchValue({
      source: entry.source,
      entityType: entry.entityType,
      fullName: entry.fullName,
      aliases: entry.aliases?.join('; ') || '',
      dateOfBirth: entry.dateOfBirth || '',
      placeOfBirth: entry.placeOfBirth || '',
      nationality: entry.nationality || '',
      idNumber: entry.idNumber || '',
      pinNumber: entry.pinNumber || '',
      passportNumber: entry.passportNumber || '',
      address: entry.address || '',
      program: entry.program || '',
      listedDate: entry.listedDate || '',
      remarks: entry.remarks || '',
      gazetteNotice: entry.gazetteNotice || '',
      caseReference: entry.caseReference || '',
    });

    // Scroll to form
    document.querySelector('.form-page')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.snack.alertInfo('Editing entry - update fields and click "Update Entry"');
    this.cdr.detectChanges();
  }

  // Update bulk entry
  updateBulkEntry(): void {
    if (this.form.invalid) {
      this.snack.alertError('Please fill in all required fields');
      return;
    }

    if (this.editingBulkEntryId === null) return;

    const raw = this.form.getRawValue();
    const index = this.bulkEntries.findIndex(e => e.id === this.editingBulkEntryId);
    
    if (index === -1) {
      this.snack.alertError('Entry not found');
      return;
    }

    const sourceDisplayName = this.sources.find(s => s.source === raw.source)?.displayName || raw.source;

    this.bulkEntries[index] = {
      ...this.bulkEntries[index],
      source: raw.source,
      sourceDisplayName: sourceDisplayName,
      entityType: raw.entityType,
      fullName: raw.fullName.trim(),
      aliases: raw.aliases ? raw.aliases.split(';').map((s: string) => s.trim()).filter(Boolean) : [],
      dateOfBirth: raw.dateOfBirth || undefined,
      placeOfBirth: raw.placeOfBirth?.trim() || undefined,
      nationality: raw.nationality?.trim() || undefined,
      idNumber: raw.idNumber?.trim() || undefined,
      pinNumber: raw.pinNumber?.trim() || undefined,
      passportNumber: raw.passportNumber?.trim() || undefined,
      address: raw.address?.trim() || undefined,
      program: raw.program?.trim() || undefined,
      listedDate: raw.listedDate || undefined,
      remarks: raw.remarks?.trim() || undefined,
      gazetteNotice: raw.gazetteNotice?.trim() || undefined,
      caseReference: raw.caseReference?.trim() || undefined,
      status: 'pending'
    };

    this.isEditingBulkEntry = false;
    this.editingBulkEntryId = null;

    // Reset form but keep source
    const source = this.form.get('source')?.value;
    this.form.reset({ source });
    
    this.snack.alertSuccess('Entry updated successfully');
    this.cdr.detectChanges();
  }

  // Cancel editing
  cancelEditBulkEntry(): void {
    this.isEditingBulkEntry = false;
    this.editingBulkEntryId = null;
    const source = this.form.get('source')?.value;
    this.form.reset({ source });
    this.cdr.detectChanges();
  }

  // Submit all bulk entries
  submitBulkEntries(): void {
    if (this.bulkEntries.length === 0) {
      this.snack.alertError('No entries to submit');
      return;
    }

    // Group entries by source
    const entriesBySource = new Map<string, BulkEntry[]>();
    this.bulkEntries.forEach(entry => {
      if (!entriesBySource.has(entry.source)) {
        entriesBySource.set(entry.source, []);
      }
      entriesBySource.get(entry.source)!.push(entry);
    });

    this.isSubmitting = true;

    // Process each source group
    const requests = Array.from(entriesBySource.entries()).map(([source, entries]) => {
      const request = {
        source: source,
        entries: entries.map(e => ({
          source: e.source,
          entityType: e.entityType,
          fullName: e.fullName,
          aliases: e.aliases,
          dateOfBirth: e.dateOfBirth,
          placeOfBirth: e.placeOfBirth,
          nationality: e.nationality,
          idNumber: e.idNumber,
          pinNumber: e.pinNumber,
          passportNumber: e.passportNumber,
          address: e.address,
          program: e.program,
          listedDate: e.listedDate,
          remarks: e.remarks,
          gazetteNotice: e.gazetteNotice,
          caseReference: e.caseReference,
        })),
        replaceExisting: this.replaceExisting
      };
      return this.service.bulkUpload(request).toPromise();
    });

    Promise.all(requests)
      .then(() => {
        this.isSubmitting = false;
        this.snack.alertSuccess(`Successfully uploaded ${this.bulkEntries.length} entries`);
        this.bulkEntries = [];
        this.showBulkTable = false;
        this.isEditingBulkEntry = false;
        this.editingBulkEntryId = null;
        this.cdr.detectChanges();
        this.router.navigate(['admin/sanctions']);
      })
      .catch((err) => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
        this.snack.alertError(err?.error?.message || 'Failed to upload entries');
      });
  }

  // Remove entry from bulk table
  removeBulkEntry(id: number): void {
    if (this.isEditingBulkEntry && this.editingBulkEntryId === id) {
      this.cancelEditBulkEntry();
    }
    this.bulkEntries = this.bulkEntries.filter(e => e.id !== id);
    if (this.bulkEntries.length === 0) {
      this.showBulkTable = false;
    }
    this.cdr.detectChanges();
  }

  // Toggle bulk entry mode
  toggleBulkMode(): void {
    if (this.isEditingBulkEntry) {
      this.cancelEditBulkEntry();
    }
    this.showBulkTable = !this.showBulkTable;
    if (!this.showBulkTable) {
      this.bulkEntries = [];
      this.entryCounter = 0;
    }
  }

  cancel(): void {
    this.router.navigate(['admin/sanctions']);
  }

  err(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  // ── Bulk Upload Methods ─────────────────────────────────────────────────────

  toggleBulkUpload(): void {
    this.bulkUploadExpanded = !this.bulkUploadExpanded;
  }

  downloadTemplate(): void {
    if (!this.bulkSource) {
      this.snack.alertError('Please select a source list first');
      return;
    }

    this.isDownloading = true;
    this.subs.push(
      this.service.downloadTemplate(this.bulkSource).subscribe({
        next: (blob: Blob) => {
          this.isDownloading = false;
          this.cdr.detectChanges();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${this.bulkSource.toLowerCase()}_template.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.snack.alertSuccess('Template downloaded successfully');
        },
        error: (err: any) => {
          this.isDownloading = false;
          this.cdr.detectChanges();
          this.snack.alertError(err?.error?.message || 'Failed to download template');
        },
      })
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.validateAndSetFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndSetFile(files[0]);
    }
  }

  private validateAndSetFile(file: File): void {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      this.snack.alertError('Please upload a valid Excel file (.xlsx or .xls)');
      this.clearSelectedFile();
      return;
    }

    if (file.size > maxSize) {
      this.snack.alertError('File size exceeds the 5MB limit');
      this.clearSelectedFile();
      return;
    }

    this.selectedFile = file;
    this.uploadResult = null;
  }

  clearSelectedFile(): void {
    this.selectedFile = null;
    this.uploadResult = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  clearUploadResult(): void {
    this.uploadResult = null;
  }

  uploadBulkEntries(): void {
    if (!this.selectedFile) {
      this.snack.alertError('Please select a file to upload');
      return;
    }

    if (!this.bulkSource) {
      this.snack.alertError('Please select a source list');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadResult = null;

    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += Math.floor(Math.random() * 10) + 1;
      }
    }, 200);

    this.subs.push(
      this.service.uploadExcel(this.bulkSource, this.selectedFile, this.replaceExisting).subscribe({
        next: (message: string) => {
          clearInterval(progressInterval);
          this.uploadProgress = 100;
          this.isUploading = false;
          this.cdr.detectChanges();

          const countMatch = message.match(/(\d+)\s*entries?/i);
          const count = countMatch ? parseInt(countMatch[1]) : undefined;

          this.uploadResult = {
            success: true,
            message: message || 'Entries uploaded successfully',
            entriesCreated: count,
          };

          this.snack.alertSuccess(message || 'Entries uploaded successfully');
          this.clearSelectedFile();

          setTimeout(() => {
            this.router.navigate(['admin/sanctions']);
          }, 2000);
        },
        error: (err: any) => {
          clearInterval(progressInterval);
          this.uploadProgress = 0;
          this.isUploading = false;
          this.cdr.detectChanges();

          const errorMessage = err?.error?.message || 'Failed to upload entries';

          this.uploadResult = {
            success: false,
            message: 'Upload failed',
            errors: err?.error?.errors || [{ row: 0, field: 'file', message: errorMessage }],
          };

          this.snack.alertError(errorMessage);
        },
      })
    );
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}