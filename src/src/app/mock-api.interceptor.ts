import { Injectable, Inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { MSAL_INSTANCE } from '@azure/msal-angular';
import { IPublicClientApplication } from '@azure/msal-browser';

@Injectable()
export class MockApiInterceptor implements HttpInterceptor {
    constructor(@Inject(MSAL_INSTANCE) private msalInstance: IPublicClientApplication) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Mock /api/userinfo endpoint
        if (req.url.endsWith('/api/userinfo')) {
            console.log('MockApiInterceptor: Intercepting /api/userinfo request');

            // Extract token info from the request header (if available)
            const authHeader = req.headers.get('Authorization');
            const hasToken = authHeader && authHeader.startsWith('Bearer ');

            // Get actual user data from MSAL login
            const accounts = this.msalInstance.getAllAccounts();
            const account = accounts.length > 0 ? accounts[0] : null;

            const mockUserInfo = {
                // User identity from MSAL
                id: account?.localAccountId || 'unknown',
                username: account?.username || 'unknown',
                name: account?.name || 'Unknown User',
                email: account?.username || 'unknown@example.com',

                // Tenant info from MSAL
                tenantId: account?.tenantId || 'unknown',
                homeAccountId: account?.homeAccountId || 'unknown',
                environment: account?.environment || 'unknown',

                // ID token claims (if available)
                givenName: (account?.idTokenClaims as any)?.given_name || null,
                familyName: (account?.idTokenClaims as any)?.family_name || null,
                jobTitle: (account?.idTokenClaims as any)?.jobTitle || null,
                preferredUsername: (account?.idTokenClaims as any)?.preferred_username || null,
                oid: (account?.idTokenClaims as any)?.oid || null,

                // Request metadata
                tokenReceived: hasToken ? 'Yes' : 'No',
                timestamp: new Date().toISOString()
            };

            console.log('MockApiInterceptor: Returning user info from MSAL account:', mockUserInfo);

            // Simulate network delay
            return of(new HttpResponse({
                status: 200,
                body: mockUserInfo
            })).pipe(delay(500));
        }

        // Pass through other requests
        return next.handle(req);
    }
}
