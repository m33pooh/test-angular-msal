import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserCacheLocation, InteractionType, IPublicClientApplication, LogLevel, PublicClientApplication } from '@azure/msal-browser';
import {
  MsalGuard,
  MsalInterceptor,
  MsalBroadcastService,
  MsalInterceptorConfiguration,
  MsalModule,
  MsalService,
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalGuardConfiguration
} from '@azure/msal-angular';

import { routes } from './app.routes';
import { RuntimeConfig } from './config.service';

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

// Load configuration synchronously
function loadRuntimeConfig(): RuntimeConfig {
  const request = new XMLHttpRequest();
  request.open('GET', '/assets/config/config.json', false); // Synchronous request
  request.send(null);

  if (request.status === 200) {
    const config = JSON.parse(request.responseText);
    console.log('Runtime configuration loaded:', config);
    return config;
  } else {
    throw new Error(`Failed to load configuration: ${request.status}`);
  }
}

const runtimeConfig = loadRuntimeConfig();

export function MSALInstanceFactory(): IPublicClientApplication {
  const msalConfig = runtimeConfig.msalConfig;

  return new PublicClientApplication({
    auth: {
      clientId: msalConfig.auth.clientId,
      authority: msalConfig.auth.authority,
      redirectUri: msalConfig.auth.redirectUri,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: isIE
    },
    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) {
            return;
          }
          switch (level) {
            case LogLevel.Error:
              console.error(message);
              return;
            case LogLevel.Info:
              console.info(message);
              return;
            case LogLevel.Verbose:
              console.debug(message);
              return;
            case LogLevel.Warning:
              console.warn(message);
              return;
          }
        }
      }
    }
  });
}

// Initialize MSAL and handle redirects on app startup
export function initializeMSAL(msalService: MsalService) {
  return () => {
    return msalService.instance.initialize().then(() => {
      return msalService.instance.handleRedirectPromise().then(() => {
        // Redirect handling complete
      });
    });
  };
}

// MSAL Guard is required to protect routes and require authentication before accessing protected routes
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['user.read']
    }
  };
}

// MSAL Interceptor is required to request access tokens in order to access the protected resource (Graph)
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', ['user.read']);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(MsalModule),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeMSAL,
      deps: [MsalService],
      multi: true
    }
  ]
};
