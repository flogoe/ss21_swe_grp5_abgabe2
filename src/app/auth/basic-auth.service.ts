/*
 * Copyright (C) 2016 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { BASE_PATH_REST } from '../shared';
import { CookieService } from './cookie.service'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import log from 'loglevel';

enum Rolle {
    ROLE_ADMIN = 'admin',
    ROLE_KUNDE = 'kunde',
    ROLE_MITARBEITER = 'mitarbeiter',
}

export interface Identity {
    username: string;
    rollen: Rolle[];
    password?: string;
}

@Injectable({ providedIn: 'root' })
export class BasicAuthService {
    readonly isLoggedIn$ = new Subject<boolean>();

    constructor(private readonly cookieService: CookieService) {
        log.debug('BasicAuthService.constructor()');
    }

    /**
     * @param username als String
     * @param password als String
     * @return void
     */
    // eslint-disable-next-line max-statements
    async login(username: string | undefined, password: string | undefined) {
        log.debug(
            `BasicAuthService.login(): username=${username}, password=${password}`,
        );
        const loginUri = `${BASE_PATH_REST}/auth/rollen`;
        log.debug(`BasicAuthService.login(): loginUri=${loginUri}`);

        const base64 = window.btoa(`${username}:${password}`);
        const basicAuth = `Basic ${base64}`;

        // GET-Request durch fetch() statt HttpClient von Angular
        // https://fetch.spec.whatwg.org als Standard fuer Webbrowser

        const headers = new Headers();
        headers.append('Authorization', basicAuth);
        const request = new Request(loginUri, {
            method: 'GET',
            headers,
        });

        let response: Response | undefined;
        try {
            response = await fetch(request);
            // Optional catch binding parameters
        } catch {
            log.error(
                'BasicAuthService.login(): Kommunikationsfehler mit d. Appserver',
            );
        }
        if (response === undefined) {
            return Promise.reject(
                new Error('Kommunikationsfehler mit dem Appserver'),
            );
        }

        const { status } = response;
        log.debug(`BasicAuthService.login(): status=${status}`);
        if (status !== HttpStatusCode.Ok) {
            const { statusText } = response;
            return Promise.reject(new Error(statusText));
        }

        const json: string[] = await response.json(); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        log.debug('BasicAuthService.login(): json', json);
        // Array von Strings als 1 String
        const roles: string = json.join();
        log.debug(`BasicAuthService.login(): roles=${roles}`);

        this.cookieService.saveAuthorization(
            // Base64-String fuer 1 Tag speichern
            basicAuth,
            roles,
        );
        this.isLoggedIn$.next(true);
        return roles;
    }

    /**
     * Statische Abfrage, z.B. beim Start des Browsers, wenn noch kein
     * Click-Ereignis eingetreten ist.
     * @return true, falls ein User eingeloggt ist; sonst false.
     */
    get isLoggedIn() {
        return this.cookieService.getAuthorization() !== undefined;
    }
}
