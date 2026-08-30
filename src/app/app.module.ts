// src/app/app.module.ts
import { ErrorHandler, NgModule, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

// Browser/Routing
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Import modules
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { ComponentsModule } from './shared/components/components.module';

// Interceptors
import { AuthInterceptor } from './core/interceptor/auth.interceptor';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { NgClickOutsideDirective } from 'ng-click-outside2';
import { BnNgIdleService } from 'bn-ng-idle';
import { GlobalErrorHandlerService } from './shared/services/global-error-handler.service';

// NG-Bootstrap
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Feather Icons
import { FeatherModule } from 'angular-feather';
import {
    Menu, Settings, LogOut, Maximize, Minimize, Key, Home, Bell, BellOff,
    CheckCircle, UserCheck, Info, X, ArrowLeft, Shield, AlertTriangle,
    FileText, Users, Activity, TrendingUp, BarChart2, Lock, List,
    Search, ChevronDown, GitBranch
} from 'angular-feather/icons';

const icons = {
    Menu, Settings, LogOut, Maximize, Minimize, Key, Home, Bell, BellOff,
    CheckCircle, UserCheck, Info, X, ArrowLeft, Shield, AlertTriangle,
    FileText, Users, Activity, TrendingUp, BarChart2, Lock, List,
    Search, ChevronDown, GitBranch
};

// Material Modules
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // ✅ Make sure both are imported
import { NgIdleModule } from '@ng-idle/core';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { ServiceWorkerModule } from '@angular/service-worker';

// Layout Components
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';

// Auth Components
import { SigninComponent } from './authentication/signin/signin.component';
import { OtpComponent } from './authentication/otp/otp.component';
import { Page404Component } from './authentication/page404/page404.component';
import { Page403Component } from './authentication/page403/page403.component';
import { IdleWarningComponent } from './layout/idle-warning-component/idle-warning-component';import { FullLayout } from './layout/full-layout/full-layout';

// Register locales
registerLocaleData(localeFr);
registerLocaleData(localeEn);

@NgModule({
    declarations: [
        AppComponent,
        // Layout Components
        IdleWarningComponent,
        SidebarComponent,
        HeaderComponent,
        FullLayout,
        // Dashboard
        // Auth Components
        SigninComponent,
        OtpComponent,
        Page404Component,
        Page403Component,
    ],
    imports: [
        BrowserModule,
        CommonModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,          // ✅ For template-driven forms
        ReactiveFormsModule,  // ✅ For reactive forms (formGroup, formControl, etc.)
        
        // Feather Icons
        FeatherModule.pick(icons),
        
        // Material
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        MatCardModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatSlideToggleModule,
        MatTooltipModule,
        
        // 3rd Party
        NgbModule,
        NgClickOutsideDirective,
        
        // Core/Shared
        CoreModule,
        SharedModule,
        ComponentsModule,
        
        // Idle Management
        NgIdleModule.forRoot(),
        NgIdleKeepaliveModule.forRoot(),
        
        // Service Worker
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
        })
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        BnNgIdleService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
