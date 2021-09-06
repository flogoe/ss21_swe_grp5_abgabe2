/*
 * Copyright (C) 2015 - present Juergen Zimmermann, Hochschule Karlsruhe
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

import { BasicAuthService } from 'src/app/auth/basic-auth.service';
import { Component } from '@angular/core';
import { CookieService } from 'src/app/auth/cookie.service';
import { HOME_PATH } from '../../shared';
import { JwtService } from 'src/app/auth/jwt.service';
import type { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import log from 'loglevel';

/**
 * Komponente f&uuml;r das Login mit dem Tag &lt;hs-login-logout&gt;.
 */
@Component({
    selector: 'hs-login-logout',
    templateUrl: './login-logout.component.html',
    styleUrls: ['./login-logout-component.scss'],
})
export class LoginLogoutComponent implements OnInit {
    username: string | undefined;
    password: string | undefined;

    // Observable.subscribe() aus RxJS liefert ein Subscription Objekt,
    // mit dem man den Request auch abbrechen ("cancel") kann
    // https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/subscribe.md
    // http://stackoverflow.com/questions/34533197/what-is-the-difference-between-rx-observable-subscribe-and-foreach
    // https://xgrommx.github.io/rx-book/content/observable/observable_instance_methods/subscribe.html
    // Funktion als Funktionsargument, d.h. Code als Daten uebergeben
    // Suffix "$" wird als "Finnish Notation" bezeichnet https://medium.com/@benlesh/observables-and-finnish-notation-df8356ed1c9b
    isLoggedIn$!: Subject<boolean>;
    init!: boolean;

    constructor(
        private readonly authService: JwtService,
        private readonly router: Router,
        private readonly cookieService: CookieService,
    ) {
        log.debug('LoginLogoutComponent.constructor()');
    }

    ngOnInit() {
        log.debug(
            `LoginLogoutComponent.ngOnInit(): ${this.authService.isLoggedIn}`,
        );
        this.isLoggedIn$ = this.authService.isLoggedIn$;
        this.isLoggedIn$.subscribe();
        // Initialisierung, falls zwischenzeitlich der Browser geschlossen wurde
        this.init = this.authService.isLoggedIn;
    }

    onLogin() {
        log.debug('LoginLogoutComponent.onLogin()');
        const loginResult = this.authService.login(
            this.username,
            this.password,
        );
        this.init = false;
        console.log('LOGIN RESULT', loginResult);
        return loginResult;
    }

    /**
     * Ausloggen und dabei Benutzername und Passwort zur&uuml;cksetzen.
     */
    onLogout() {
        log.debug('LoginLogoutComponent.onLogout()');
        this.authService.logout();
        this.init = false;
        this.isLoggedIn$.next(false);
        return this.router.navigate([HOME_PATH]);
    }
}
