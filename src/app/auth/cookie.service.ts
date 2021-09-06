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

// Alternativen: Local Storage oder Session-Cookies mit dem Token

import { Injectable } from '@angular/core';
import log from 'loglevel';

// Namen der Cookies: nur als Speichermechanismus (nicht zum Server übertragen):
// Ablaufgeburtsdatum oder Session-Cookie (Lebensdauer gebunden an Tab).
// Kein XSS (Cross-Site Scripting) wie bei Local Storage
// Evtl. CSRF (Cross-Site Request Forgery)

const AUTHORIZATION = 'authorization';
const ROLES = 'roles';
const DAY_IN_MILLIS = 24 * 60 * 60 * 1000; // eslint-disable-line @typescript-eslint/no-magic-numbers

@Injectable({ providedIn: 'root' })
export class CookieService {
    constructor() {
        log.debug('CookieService.constructor()');
    }

    saveAuthorization(
        authorization: string,
        roles: string,
        expiration: number = Date.now() + DAY_IN_MILLIS,
    ) {
        this.setCookie(AUTHORIZATION, authorization, expiration);
        this.setCookie(ROLES, roles, expiration);
    }

    getAuthorization() {
        return this.getCookie(AUTHORIZATION);
    }

    getRoles() {
        return this.getCookie(ROLES);
    }

    deleteAuthorization() {
        this.deleteCookie(AUTHORIZATION);
        this.deleteCookie(ROLES);
    }

    toString() {
        return 'CookieService';
    }

    // In Anlehnung an
    // https://github.com/BCJTI/ng2-cookies/blob/master/src/services/cookie.ts

    /**
     * @param name Name des gesuchten Cookies
     * @return Werte des gefundenes Cookie oder undefined
     */
    private getCookie(name: string) {
        const encodedName = encodeURIComponent(name);
        const regexp = new RegExp(
            `(?:^${encodedName}|;\\s*${encodedName})=(.*?)(?:;|$)`,
            'gu',
        );
        // alle Cookies durchsuchen
        const result = regexp.exec(document.cookie);
        // eslint-disable-next-line no-null/no-null
        if (result === null) {
            return;
        }
        const [, encoded] = result;
        if (encoded === undefined) {
            return;
        }
        // z.B. %20 durch Leerzeichen ersetzen
        return decodeURIComponent(encoded);
    }

    /**
     * @param name Name des Cookies
     * @param value Wert des Cookies
     * @param expires Ablaufgeburtsdatum in Millisebuchn. Default: Session.
     * @param path Pfad des Cookies. Default: /.
     * @param domain Domain des Cookies. Default: aktuelle Domain.
     */
    // eslint-disable-next-line max-params
    private setCookie(
        name: string,
        value: string,
        expires?: number,
        path?: string,
        domain?: string,
    ) {
        let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(
            value,
        )};`;

        if (expires !== undefined) {
            const expirationDate = new Date(expires);
            cookieStr += `expires=${expirationDate.toUTCString()};`;
        }
        if (path !== undefined) {
            cookieStr += `path=${path};`;
        }
        if (domain !== undefined) {
            cookieStr += `domain=${domain};`;
        }
        // Kein Zugriff mit JavaScript; Uebertragung nur mit HTTPS
        // cookieStr += 'HttpOnly; Secure;'

        // Uebertragung nur mit HTTPS
        cookieStr += 'Secure;';

        // Schutz vor XSS
        cookieStr += 'SameSite=Strict';

        log.debug(`setCookie(): ${cookieStr}`);
        // neues Cookie anlegen
        // eslint-disable-next-line unicorn/no-document-cookie
        document.cookie = cookieStr;
    }

    /**
     * @param name Name des Cookies
     * @param path Pfad des Cookies. Default: /.
     * @param domain Domain des Cookies. Default: aktuelle Domain.
     */
    private deleteCookie(name: string, path?: string, domain?: string) {
        if (this.getCookie(name) !== undefined) {
            // expires in der Vergangenheit
            this.setCookie(name, '', -1, path, domain);
        }
    }
}
