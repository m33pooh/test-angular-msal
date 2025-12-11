import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserInfo {
    [key: string]: any;
}

@Injectable({
    providedIn: 'root'
})
export class UserInfoService {
    private userInfoSubject = new BehaviorSubject<UserInfo | null>(null);

    // Observable for components to subscribe
    userInfo$: Observable<UserInfo | null> = this.userInfoSubject.asObservable();

    // Set user info (called from HomeComponent after API call)
    setUserInfo(userInfo: UserInfo): void {
        this.userInfoSubject.next(userInfo);
        console.log('UserInfoService: User info stored', userInfo);
    }

    // Set mock user info for testing
    setMockUserInfo(): void {
        const mockUserInfo: UserInfo = {
            id: 'mock-user-001',
            username: 'john.doe@contoso.com',
            name: 'John Doe',
            email: 'john.doe@contoso.com',
            tenantId: '12345678-1234-1234-1234-123456789abc',
            givenName: 'John',
            familyName: 'Doe',
            jobTitle: 'Software Engineer',
            department: 'Engineering',
            officeLocation: 'Building 42',
            mobilePhone: '+1-555-123-4567',
            preferredLanguage: 'en-US',
            timestamp: new Date().toISOString()
        };
        this.setUserInfo(mockUserInfo);
        console.log('UserInfoService: Mock user info set');
    }

    // Get current user info value
    getUserInfo(): UserInfo | null {
        return this.userInfoSubject.getValue();
    }

    // Clear user info (on logout)
    clearUserInfo(): void {
        this.userInfoSubject.next(null);
        console.log('UserInfoService: User info cleared');
    }
}
