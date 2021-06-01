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
 * You should have received a copy oSf the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Component, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { SucheFamilienstandComponent } from './suche-familienstand.component';
import { SucheSchlagwoerterComponent } from './suche-schlagwoerter.component';
import { SucheNachnameComponent } from './suche-nachname.component';
import { SucheGeschlechtTypeComponent } from './suche-geschlechtType.component';
import type { Suchkriterien } from '../../shared';
import { fadeIn } from '../../../shared';
import log from 'loglevel';

/**
 * Komponente f&uuml;r das Tag <code>hs-suchformular</code>
 */
@Component({
    selector: 'hs-suchformular',
    templateUrl: './suchformular.component.html',
    animations: [fadeIn],
})
export class SuchformularComponent {
    // Event Binding: <hs-suchformular (suchkriterien)="...">
    // in RxJS: Observables = Event-Streaming mit Promises
    // Subject fuer @Output, nicht die Basisklasse Observable
    // Ein Subject kann MEHRERE Observer benachrichtigen ("Multicast")
    // https://angular.io/guide/component-interaction#parent-listens-for-child-event
    // Suffix "$" wird als "Finnish Notation" bezeichnet https://medium.com/@benlesh/observables-and-finnish-notation-df8356ed1c9b
    @Output()
    readonly suchkriterien$ = new Subject<Suchkriterien>();

    // DI der Child-Komponente, um auf deren Attribut (hier: "nachname") zuzugreifen
    // @Output in SucheNachnameComponent wuerde Subject<> erfordern
    // https://angular.io/guide/component-interaction#parent-calls-an-viewchild
    // query results available in ngOnInit
    @ViewChild(SucheNachnameComponent, { static: true })
    private readonly sucheNachnameComponent!: SucheNachnameComponent;

    @ViewChild(SucheGeschlechtTypeComponent, { static: true })
    private readonly sucheGeschlechtTypeComponent!: SucheGeschlechtTypeComponent;

    @ViewChild(SucheFamilienstandComponent, { static: true })
    private readonly sucheFamilienstandComponent!: SucheFamilienstandComponent;

    @ViewChild(SucheSchlagwoerterComponent, { static: true })
    private readonly sucheSchlagwoerterComponent!: SucheSchlagwoerterComponent;

    // DI: Constructor Injection (React hat uebrigens keine DI)
    // Empfehlung: Konstruktor nur fuer DI
    constructor() {
        log.debug('SuchformularComponent.constructor()');
    }

    /**
     * Suche nach B&uuml;chern, die den spezfizierten Suchkriterien entsprechen
     * @return false, um das durch den Button-Klick ausgel&ouml;ste Ereignis
     *         zu konsumieren.
     */
    onSubmit() {
        const { nachname } = this.sucheNachnameComponent;
        const { geschlechtType } = this.sucheGeschlechtTypeComponent;
        const { familienstand } = this.sucheFamilienstandComponent;
        const { javascript } = this.sucheSchlagwoerterComponent;
        const { typescript } = this.sucheSchlagwoerterComponent;
        log.debug(
            `SuchformularComponent.onFind(): nachname=${nachname}, geschlechtType=${geschlechtType}, familienstand=${familienstand}, javascript=${javascript}, typescript=${typescript}`,
        );

        this.suchkriterien$.next({
            nachname,
            geschlechtType,
            familienstand,
            schlagwoerter: { javascript, typescript },
        });

        // Inspektion der Komponente mit dem Tag-Namen "app" im Debugger
        // Voraussetzung: globale Variable ng deklarieren (s.o.)
        // const app = document.querySelector('app')
        // global.ng.probe(app)

        // damit das (Submit-) Ereignis konsumiert wird und nicht an
        // uebergeordnete Eltern-Komponenten propagiert wird bis zum
        // Refresh der gesamten Seite.
        return false;
    }
}
