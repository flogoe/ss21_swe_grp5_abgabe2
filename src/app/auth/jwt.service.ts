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
import { CookieService } from './cookie.service';
import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import log from 'loglevel';

interface LoginResponse {
    token: string;
    roles: string[];
}

@Injectable({ providedIn: 'root' })
export class JwtService {
    private static readonly MILLIS_PER_SECOND = 1000;

    private static readonly SECOND_PER_MINUTE = 60;

    private static readonly TIMEZONE_OFFSET_MS =
        new Date().getTimezoneOffset() *
        JwtService.SECOND_PER_MINUTE *
        JwtService.MILLIS_PER_SECOND;

    constructor(private readonly cookieService: CookieService) {
        log.debug('JwtService.constructor()');
    }

    /* eslint-disable max-lines-per-function,max-statements */
    async login(
        username: string | undefined,
        password: string | undefined,
    ): Promise<string[]> {
        const loginUri = `${BASE_PATH_REST}/login`;
        log.debug(`JwtService.login(): loginUri=${loginUri}`);

        // GET-Request durch fetch() statt HttpClient von Angular
        // https://fetch.spec.whatwg.org als Standard fuer Webbrowser

        const headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        const request = new Request(loginUri, {
            method: 'POST',
            headers,
            body: `username=${username}&password=${password}`,
        });

        let response: Response | undefined;
        try {
            response = await fetch(request);
            // Optional catch binding parameters
        } catch {
            log.error(
                'JwtService.login(): Kommunikationsfehler mit dem Appserver',
            );
        }
        if (response === undefined) {
            return Promise.reject(
                new Error('Kommunikationsfehler mit dem Appserver'),
            );
        }

        const { status } = response;
        log.debug(`JwtService.login(): status=${status}`);
        if (status !== HttpStatusCode.Ok) {
            const { statusText } = response;
            return Promise.reject(new Error(statusText));
        }

        const json: LoginResponse = await response.json(); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        log.debug('JwtService.login(): json', json);
        const { token, roles } = json;
        const authorization = `Bearer ${token}`;
        log.debug(`JwtService.login(): authorization=${authorization}`);

        // Array von Strings als 1 String
        const rolesStr: string = roles.join();
        log.debug(`JwtService.login(): rolesStr=${rolesStr}`);

        const decodedToken = this.decodeToken(token); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        log.debug('JwtService.login(): decodedToken', decodedToken);
        if (decodedToken.exp === undefined) {
            return Promise.resolve([]);
        }

        // Expiration beim Token: Sekunden seit 1.1.1970 UTC
        // Cookie: Millisekunden in eigener Zeitzone
        const expiration =
            decodedToken.exp * JwtService.MILLIS_PER_SECOND +
            JwtService.TIMEZONE_OFFSET_MS;
        log.debug(`JwtService.login(): expiration=${expiration}`);
        this.cookieService.saveAuthorization(
            authorization,
            rolesStr,
            expiration,
        );

        return Promise.resolve(roles);
    }
    /* eslint-enable max-lines-per-function,max-statements */

    // https://github.com/auth0/angular2-jwt/blob/master/angular2-jwt.ts#L147
    private decodeToken(token: string) {
        // Destructuring
        const [, payload, signature]: (string | undefined)[] = token.split('.');
        if (signature === undefined) {
            log.error('JwtService.decodeToken(): JWT enthaelt keine Signature');
            return;
        }

        let base64Token = payload?.replace(/-/gu, '+')?.replace(/_/gu, '/');
        if (base64Token === undefined) {
            return Promise.reject(new Error('Interner Fehler beim Einloggen'));
        }
        /* eslint-disable @typescript-eslint/no-magic-numbers */
        switch (base64Token.length % 4) {
            case 0:
                break;
            case 2:
                base64Token += '==';
                break;
            case 3:
                base64Token += '=';
                break;
            default:
                log.error(
                    'JwtService.decodeToken(): Laenge des JWT in Base64 ist falsch.',
                );
                return;
        }
        /* eslint-enable @typescript-eslint/no-magic-numbers */

        // http://xkr.us/articles/javascript/encode-compare
        // http://stackoverflow.com/questions/75980/when-are-you-supposed-to-use-escape-instead-of-encodeuri-encodeuricomponent#23842171
        const decodedStr = decodeURIComponent(
            encodeURIComponent(window.atob(base64Token)),
        );

        return JSON.parse(decodedStr);
    }
}
