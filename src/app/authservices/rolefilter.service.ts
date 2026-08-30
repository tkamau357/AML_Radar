// src/app/authservices/rolefilter.service.ts
import { Injectable } from "@angular/core";
import { TokenStorageService } from "../core/service/token-storage.service";

@Injectable({
  providedIn: "root",
})
export class RolefilterService {

  user_privileges: Set<string> = new Set<string>();
  constructor(private tokenStorage: TokenStorageService) {
    const user = this.tokenStorage.getUser();

    if (user && user.roles && user.roles.length > 0 && user.roles[0].accessRights) {
      this.user_privileges = new Set(
        user.roles[0].accessRights.map(
          (Privilege: any) => Privilege.accessRights
        ));
    }
  }
  public hasAllRoles(roles: string[]): boolean {
    for (const authority of roles) {
      if (!this.user_privileges.has(authority)) {
        return false;
      }
    }
    return true;
  }
  public hasAtleastOneRole(roles: string[]): boolean {
    for (const authority of roles) {
      if (this.user_privileges.has(authority)) {
        return true;
      }
    }
    return false;
  };

  public hasRole(authority: string): boolean {
    for (const right of this.user_privileges) {
      console.log(right, authority);
      if (right == authority) return true;
    }
    return false;
  }
}