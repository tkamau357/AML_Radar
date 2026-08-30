import { Injectable, Inject } from "@angular/core";
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: "root",
})
export class LanguageService {
  public languages: string[] = ["en", "fr"];

  constructor(@Inject(DOCUMENT) private document: Document) {}

  public setLanguage(lang: string) {
    sessionStorage.setItem("lang", lang);
    this.document.documentElement.lang = lang;
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
  }

  public getCurrentLanguage(): string {
    return sessionStorage.getItem("lang") || 'en';
  }
}
