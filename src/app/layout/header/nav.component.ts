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

// eslint-disable-next-line import/no-unresolved
import { BasicAuthService } from 'src/app/auth/basic-auth.service';
import { Component } from '@angular/core';
// eslint-disable-next-line import/no-unresolved
import { CookieService } from 'src/app/auth/cookie.service';
import { JwtService } from 'src/app/auth/jwt.service';
import type { OnInit } from '@angular/core';
import { ROLLE_ADMIN } from '../../auth/basic-auth.service';
import { Subject } from 'rxjs';
import log from 'loglevel';
import { tap } from 'rxjs/operators';

/**
 * Komponente f&uuml;r die Navigationsleiste mit dem Tag &lt;hs-nav&gt;.
 */
@Component({
    selector: 'hs-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
    isAdmin$ = new Subject<boolean>();

    isAdmin = false;

    constructor(
        private readonly authService: JwtService,
        private readonly cookieService: CookieService,
    ) {
        log.debug('NavComponent.constructor()');
    }

    ngOnInit() {
        // beobachten, ob es Informationen zur Rolle "admin" gibt
        // Observable.subscribe() aus RxJS liefert ein Subscription Objekt,
        // mit dem man den Request auch abbrechen ("cancel") kann
        // https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/subscribe.md
        // http://stackoverflow.com/questions/34533197/what-is-the-difference-between-rx-observable-subscribe-and-foreach
        // https://xgrommx.github.io/rx-book/content/observable/observable_instance_methods/subscribe.html
        // Funktion als Funktionsargument, d.h. Code als Daten uebergeben
        // Suffix "$" wird als "Finnish Notation" bezeichnet https://medium.com/@benlesh/observables-and-finnish-notation-df8356ed1c9b

        this.authService.rollen$
            .pipe(
                tap((rollen: string[]) =>
                    // ein neues Observable vom Typ boolean
                    // eslint-disable-next-line @typescript-eslint/brace-style
                    {
                        this.isAdmin$.next(rollen.includes(ROLLE_ADMIN));
                        this.isAdmin = rollen.includes(ROLLE_ADMIN);
                    },
                ),
            )
            // das Subject von AuthService abonnieren bzw. beobachten
            .subscribe();

        const rolesArray = this.cookieService.getRoles()?.split(',');
        this.authService.rollen$.next(rolesArray);
    }
}
