import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UserInfoService, UserInfo } from '../userinfo.service';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me';

type ProfileType = {
    displayName?: string;
    mail?: string;
    userPrincipalName?: string;
    jobTitle?: string;
    mobilePhone?: string;
    officeLocation?: string;
};

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
    profile: ProfileType = {};
    loading = true;
    error = false;

    // User info from home page
    userInfo: UserInfo | null = null;

    private readonly _destroying$ = new Subject<void>();

    constructor(
        private http: HttpClient,
        private userInfoService: UserInfoService
    ) { }

    ngOnInit(): void {
        this.getProfile();

        // Subscribe to userinfo from service
        this.userInfoService.userInfo$
            .pipe(takeUntil(this._destroying$))
            .subscribe(info => {
                this.userInfo = info;
                console.log('ProfileComponent: Received user info', info);
            });
    }

    getProfile() {
        this.loading = true;
        this.error = false;

        this.http.get<ProfileType>(GRAPH_ENDPOINT)
            .subscribe({
                next: (profile) => {
                    this.profile = profile;
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error fetching profile:', err);
                    this.error = true;
                    this.loading = false;
                }
            });
    }

    ngOnDestroy(): void {
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }
}

