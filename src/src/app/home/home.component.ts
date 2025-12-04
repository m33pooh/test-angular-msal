import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { Subject, filter, takeUntil } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
    loginDisplay = false;
    username = '';
    private readonly _destroying$ = new Subject<void>();

    constructor(
        @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
        private authService: MsalService,
        private msalBroadcastService: MsalBroadcastService
    ) { }

    ngOnInit(): void {
        this.msalBroadcastService.inProgress$
            .pipe(
                filter((status: InteractionStatus) => status === InteractionStatus.None),
                takeUntil(this._destroying$)
            )
            .subscribe(() => {
                this.setLoginDisplay();
            });
    }

    setLoginDisplay() {
        const accounts = this.authService.instance.getAllAccounts();
        this.loginDisplay = accounts.length > 0;
        if (this.loginDisplay) {
            this.username = accounts[0].name || accounts[0].username;
        }
    }

    login() {
        if (this.msalGuardConfig.authRequest) {
            this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
        } else {
            this.authService.loginRedirect();
        }
    }

    logout() {
        this.authService.logoutRedirect({
            postLogoutRedirectUri: "http://localhost:4200"
        });
    }

    ngOnDestroy(): void {
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }
}
