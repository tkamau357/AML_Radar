// import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
// import { MatTooltip } from '@angular/material/tooltip';

// @Directive({
//   selector: '[appCustomTooltip]',
//   providers: [{ provide: MatTooltip, useExisting: CustomTooltipDirective }]
// })
// export class CustomTooltipDirective extends MatTooltip implements OnInit {
//   @Input() tooltipType: 'default' | 'brand' | 'danger' | 'success' | 'warning' | 'action' | 'light' = 'default';
//   @Input() tooltipIcon: string = '';
//   @Input() tooltipTitle: string = '';
//   @Input() tooltipDescription: string = '';

//   constructor(
//     private el: ElementRef,
//     private renderer: Renderer2
//   ) {
//     super(renderer, null as any, null as any, null as any);
//   }

//   ngOnInit(): void {
//     // Set custom class based on type
//     this.matTooltipClass = `mat-tooltip--${this.tooltipType}`;

//     // Handle tooltip with icon
//     if (this.tooltipIcon) {
//       this.matTooltipClass += ' mat-tooltip--with-icon';
//       // The tooltip content will be rendered with icon
//     }

//     // Handle multiline tooltip
//     if (this.tooltipTitle || this.tooltipDescription) {
//       this.matTooltipClass += ' mat-tooltip--multiline';
      
//       // Build the tooltip message with title and description
//       let message = '';
//       if (this.tooltipTitle) {
//         message += `<span class="tooltip-title">${this.tooltipTitle}</span>`;
//       }
//       if (this.tooltipDescription) {
//         message += `<span class="tooltip-description">${this.tooltipDescription}</span>`;
//       }
      
//       // Note: This would require a custom tooltip component for HTML content
//       // For now, we'll keep it simple with text only
//     }

//     // Set tooltip position
//     this.matTooltipPosition = 'above';
//   }

//   // Override to support icon in tooltip
//   setTooltipWithIcon(icon: string, text: string): void {
//     this.tooltipIcon = icon;
//     // For simple implementation, combine icon and text
//     // In a real implementation, you'd use a custom tooltip component
//     this.message = text;
//   }
// }