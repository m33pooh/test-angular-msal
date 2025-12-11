import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { Subject, filter, takeUntil } from 'rxjs';
import { RouterLink } from '@angular/router';
import { UserInfoService } from '../userinfo.service';

type UserInfo = {
    [key: string]: any;
};

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
    userInfo: UserInfo | null = null;
    userInfoLoading = false;
    userInfoError = '';
    private readonly _destroying$ = new Subject<void>();

    constructor(
        @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
        private authService: MsalService,
        private msalBroadcastService: MsalBroadcastService,
        private http: HttpClient,
        private userInfoService: UserInfoService
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
            this.fetchUserInfo();
        }
    }

    fetchUserInfo() {
        this.userInfoLoading = true;
        this.userInfoError = '';
        this.userInfo = null;

        this.http.get<UserInfo>('/api/userinfo')
            .subscribe({
                next: (data) => {
                    this.userInfo = data;
                    this.userInfoService.setUserInfo(data); // Store in service
                    this.userInfoLoading = false;
                    console.log('User info fetched:', data);
                },
                error: (err) => {
                    console.error('Error fetching user info:', err);
                    this.userInfoError = err.message || 'Failed to fetch user info';
                    this.userInfoLoading = false;
                }
            });
    }

    login() {
        if (this.msalGuardConfig.authRequest) {
            this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
        } else {
            this.authService.loginRedirect();
        }
    }

    logout() {
        this.userInfoService.clearUserInfo(); // Clear on logout
        this.authService.logoutRedirect({
            postLogoutRedirectUri: "http://localhost:4200"
        });
    }

    ngOnDestroy(): void {
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }
}
