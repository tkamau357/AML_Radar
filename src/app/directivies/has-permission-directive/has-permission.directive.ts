import { Directive, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
// import { AccessControlService } from 'src/app/data/services/_AccessControlService.service';
import { SnackbarService } from '../../shared/services/snackbar.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: false,
})
export class HasPermissionDirective implements OnChanges {

  @Input('appHasPermission') permissionInput!: string | [string, any?];
  @Input('appHasPermissionWarnUser') warnUser: boolean = false;

  constructor(
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    // private accessControlService: AccessControlService,
    private snackbarService: SnackbarService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['permissionInput'] || changes['warnUser']) {
      this.updateView();
    }
  }

  private formatPermissionName(permission: string): string {
    // 'VIEW_MODULE_TYPE' → 'View Module Type'
    return permission
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private updateView(): void {
    if (!this.permissionInput || (Array.isArray(this.permissionInput) && !this.permissionInput[0])) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      return;
    }
    
    const permission = Array.isArray(this.permissionInput)
      ? this.permissionInput[0]
      : this.permissionInput;

    
    const moduleId = Array.isArray(this.permissionInput)
      ? this.permissionInput[1]
      : undefined;

    const hasAccess = moduleId
      // ? this.accessControlService.canAccessResource(permission, moduleId)
      // : this.accessControlService.canTakeAction([permission]);

    this.viewContainer.clear();

    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      return;
    } else if (this.warnUser) {
      const view = this.viewContainer.createEmbeddedView(this.templateRef);
      const rootNode = view.rootNodes[0] as HTMLElement;

      // Disable all interactive elements
      rootNode.querySelectorAll('input, select, mat-select, button, textarea')
        .forEach(el => el.setAttribute('disabled', 'true'));
      rootNode.style.opacity = '0.6';
      rootNode.style.pointerEvents = 'none';

      // Build 403 pill
      const pillNode = document.createElement('span');
      pillNode.textContent = '403';
      pillNode.className = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600  w-fit';

      // Build message
      const message = `You do not have access to ${this.formatPermissionName(permission)}`;
      const messageNode = document.createElement('p');
      messageNode.textContent = message;
      messageNode.className = 'my-auto text-xs text-red-500';

      // Wrap both in a container
      const container = document.createElement('div');
      container.className = 'flex flex-row items-center gap-2 mt-1';
      container.appendChild(pillNode);
      container.appendChild(messageNode);

      rootNode.insertAdjacentElement('afterend', container);
      this.snackbarService.alertError(`You do not have access to ${this.formatPermissionName(permission)}`);
    }
  }
}
