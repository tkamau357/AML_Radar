import { ChangeDetectorRef, Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BranchService, BranchResponse, CreateBranchRequest } from '../branch.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';

@Component({
  selector: 'app-add-branch',
  standalone: false,
  templateUrl: './add-branch-component.html',
  styleUrl: './add-branch-component.scss',
})
export class AddBranchComponent implements OnInit, OnDestroy {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  editCode: string | null = null;

  // Status options based on BranchStatus enum
  statusOptions = ['ACTIVE', 'INACTIVE'];

  // Bulk upload properties
  bulkUploadExpanded = false;
  isDownloading = false;
  isUploading = false;
  isDragOver = false;
  selectedFile: File | null = null;
  uploadProgress = 0;
  uploadResult: {
    success: boolean;
    message: string;
    branchesCreated?: number;
    errors?: Array<{ row: number; field: string; message: string }>;
  } | null = null;

  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private service: BranchService,
    private snack: SnackbarService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      branchCode: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      branchName: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      address: [''],
      region: [''],
    });

    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      this.isEditMode = true;
      this.editCode = code;
      this.loadBranch(code);
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ── Existing methods ────────────────────────────────────────────────────────

  private loadBranch(code: string): void {
    const s = this.service.getBranchByCode(code).subscribe({
      next: (b: BranchResponse) => {
        this.form.patchValue({
          branchCode: b.branchCode,
          branchName: b.branchName,
          description: b.description || '',
          address: b.address || '',
          region: b.region || '',
        });
        this.form.get('branchCode')!.disable();
      },
      error: err => {
        this.snack.alertError(err?.error?.message || 'Failed to load branch');
        this.router.navigate(['admin/configurations/branches']);
      },
    });
    this.subs.push(s);
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const raw = this.form.getRawValue();
    const payload: CreateBranchRequest = {
      branchCode: raw.branchCode.trim().toUpperCase(),
      branchName: raw.branchName.trim(),
      description: raw.description?.trim() || undefined,
      address: raw.address?.trim() || undefined,
      region: raw.region?.trim() || undefined,
    };

    const call$ = this.isEditMode && this.editCode !== null
      ? this.service.updateBranchByCode(this.editCode, payload)
      : this.service.createBranch(payload);

    const sub = call$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
        this.snack.alertSuccess(
          this.isEditMode ? 'Branch updated successfully' : 'Branch created successfully'
        );
        this.router.navigate(['admin/configurations/branches']);
      },
      error: err => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
        this.snack.alertError(err?.error?.message || 'Operation failed');
      },
    });
    this.subs.push(sub);
  }

  cancel(): void {
    this.router.navigate(['admin/configurations/branches']);
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
    this.isDownloading = true;
    const sub = this.service.downloadTemplate().subscribe({
      next: (blob: Blob) => {
        this.isDownloading = false;
        this.cdr.detectChanges();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'branch_template.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.snack.alertSuccess('Template downloaded successfully');
      },
      error: (err) => {
        this.isDownloading = false;
        this.cdr.detectChanges();
        this.snack.alertError(err?.error?.message || 'Failed to download template');
      },
    });
    this.subs.push(sub);
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

    // Validate file type
    if (!validTypes.includes(file.type) &&
        !file.name.match(/\.(xlsx|xls)$/i)) {
      this.snack.alertError('Please upload a valid Excel file (.xlsx or .xls)');
      this.clearSelectedFile();
      return;
    }

    // Validate file size
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

  uploadBulkBranches(): void {
    if (!this.selectedFile) {
      this.snack.alertError('Please select a file to upload');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadResult = null;

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += Math.floor(Math.random() * 10) + 1;
      }
    }, 200);

    const sub = this.service.uploadBranches(this.selectedFile).subscribe({
      next: (response: BranchResponse[]) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        this.isUploading = false;
        this.cdr.detectChanges();

        this.uploadResult = {
          success: true,
          message: 'Branches uploaded successfully',
          branchesCreated: response.length,
        };

        this.snack.alertSuccess(`${response.length} branch(es) created successfully`);

        // Reset file input
        this.clearSelectedFile();
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }

        // Optionally navigate to branches list after a delay
        setTimeout(() => {
          this.router.navigate(['admin/configurations/branches']);
        }, 2000);
      },
      error: (err) => {
        clearInterval(progressInterval);
        this.uploadProgress = 0;
        this.isUploading = false;
        this.cdr.detectChanges();

        const errorMessage = err?.error?.message || 'Failed to upload branches';

        this.uploadResult = {
          success: false,
          message: 'Upload failed',
          errors: err?.error?.errors || [{ row: 0, field: 'file', message: errorMessage }],
        };

        this.snack.alertError(errorMessage);
      },
    });
    this.subs.push(sub);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}