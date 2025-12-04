import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

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
export class ProfileComponent implements OnInit {
    profile: ProfileType = {};
    loading = true;
    error = false;

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.getProfile();
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
}
