import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface MsalAuthConfig {
    clientId: string;
    authority: string;
    redirectUri: string;
}

export interface MsalCacheConfig {
    cacheLocation: string;
    storeAuthStateInCookie: boolean;
}

export interface MsalConfig {
    auth: MsalAuthConfig;
    cache: MsalCacheConfig;
}

export interface ProtectedResource {
    endpoint: string;
    scopes: string[];
}

export interface RuntimeConfig {
    msalConfig: MsalConfig;
    protectedResources: {
        graphApi: ProtectedResource;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private config: RuntimeConfig | null = null;

    constructor(private http: HttpClient) { }

    loadConfig(): Observable<RuntimeConfig> {
        return this.http.get<RuntimeConfig>('/assets/config/config.json').pipe(
            tap(config => {
                this.config = config;
                console.log('Runtime configuration loaded:', config);
            })
        );
    }

    getConfig(): RuntimeConfig {
        if (!this.config) {
            throw new Error('Configuration not loaded. Make sure loadConfig() is called during app initialization.');
        }
        return this.config;
    }

    getMsalConfig(): MsalConfig {
        return this.getConfig().msalConfig;
    }
}
