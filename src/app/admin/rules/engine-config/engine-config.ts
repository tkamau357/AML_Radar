import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RulesService, EngineConfigRules } from '../rules.service';
import { NotificationToastService } from '../../../data/services/notification-toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-engine-config',
  standalone: false,
  templateUrl: './engine-config.html',
  styleUrl: './engine-config.scss',
})
export class EngineConfig implements OnInit, OnDestroy {
  configForm: FormGroup;
  engineConfig: EngineConfigRules | null = null;
  isLoading = false;
  
  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private rulesService: RulesService,
    private snackbar: NotificationToastService,
  ) {
    this.configForm = this.fb.group({
      rawSubEngineEnabled: [true],
      alertThreshold: [40, [Validators.required, Validators.min(0), Validators.max(100)]],
    });
  }

  ngOnInit(): void {
    this.loadConfig();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadConfig(): void {
    this.isLoading = true;
    this.subs.push(
      this.rulesService.getConfig().subscribe({
        next: (response) => {
          this.engineConfig = response.result;
          if (this.engineConfig) {
            this.configForm.patchValue({
              rawSubEngineEnabled: this.engineConfig.rawSubEngineEnabled,
              alertThreshold: this.engineConfig.alertThreshold,
            });
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.snackbar.alertError('Failed to load engine config');
          this.isLoading = false;
        },
      })
    );
  }

  onSubmit(): void {
    if (this.configForm.invalid) return;
    
    const { rawSubEngineEnabled, alertThreshold } = this.configForm.value;
    this.isLoading = true;
    
    this.subs.push(
      this.rulesService.patchSubEngine({ enabled: rawSubEngineEnabled, alertThreshold }).subscribe({
        next: (response) => {
          this.snackbar.alertSuccess('Engine config updated successfully');
          this.engineConfig = response.result;
          this.router.navigate(['/admin/assessments/rules']);
          this.isLoading = false;
        },
        error: (err) => {
          this.snackbar.alertError('Failed to update engine config');
          this.isLoading = false;
        },
      })
    );
  }

  getThresholdClass(threshold: number): string {
    if (threshold >= 80) return 'threshold-critical';
    if (threshold >= 60) return 'threshold-high';
    if (threshold >= 40) return 'threshold-medium';
    return 'threshold-low';
  }

  getRiskLevel(threshold: number): string {
    if (threshold >= 80) return 'Strict';
    if (threshold >= 60) return 'Moderate';
    if (threshold >= 40) return 'Balanced';
    return 'Lenient';
  }

  getRiskBadgeClass(threshold: number): string {
    if (threshold >= 80) return 'bg-danger';
    if (threshold >= 60) return 'bg-warning text-dark';
    if (threshold >= 40) return 'bg-info text-dark';
    return 'bg-success';
  }
}