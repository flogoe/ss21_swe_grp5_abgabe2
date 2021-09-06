/* eslint-disable no-extra-parens */
/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */
/* eslint-disable max-lines */
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

import log from 'loglevel';

export type GeschlechtType = 'D' | 'M' | 'W';

export type FamilienstandType = 'G' | 'L' | 'VH' | 'VW';

export const ISBN_REGEX =
    /\d{3}-\d-\d{5}-\d{3}-\d|\d-\d{5}-\d{3}-\d|\d-\d{4}-\d{4}-\d|\d{3}-\d{10}/u;

/**
 * Gemeinsame Datenfelder unabh&auml;ngig, ob die Buchdaten von einem Server
 * (z.B. RESTful Web Service) oder von einem Formular kommen.
 */
export interface BuchShared {
    _id?: string; // eslint-disable-line @typescript-eslint/naming-convention
    titel: string | undefined;
    verlag: string;
    // eslint-disable-next-line no-use-before-define
    adresse: Adresse;
    geschlecht?: GeschlechtType | '';
    familienstand: FamilienstandType;
    geburtsdatum?: string;
    newsletter?: boolean;
    version?: number;
    // eslint-disable-next-line no-use-before-define
    user?: User;
}

export interface Adresse {
    plz: string;
    ort: string;
}

export interface User {
    username: string;
    password: string;
}

interface Link {
    href: string;
}

/**
 * Daten vom und zum REST-Server:
 * <ul>
 *  <li> Arrays f&uuml;r mehrere Werte, die in einem Formular als Checkbox
 *       dargestellt werden.
 *  <li> Daten mit Zahlen als Datentyp, die in einem Formular nur als
 *       String handhabbar sind.
 * </ul>
 */
export interface BuchServer extends BuchShared {
    interessen?: string[];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _links?: {
        self: Link;
        list?: Link;
        add?: Link;
        update?: Link;
        remove?: Link;
    };
}

/**
 * Daten aus einem Formular:
 * <ul>
 *  <li> je 1 Control fuer jede Checkbox und
 *  <li> au&szlig;erdem Strings f&uuml;r Eingabefelder f&uuml;r Zahlen.
 * </ul>
 */
export interface BuchForm extends BuchShared {
    sport?: boolean;
    lesen?: boolean;
    reisen?: boolean;
}

/**
 * Model als Plain-Old-JavaScript-Object (POJO) fuer die Daten *UND*
 * Functions fuer Abfragen und Aenderungen.
 */
export class Buch {
    private static readonly SPACE = 2;

    geburtsdatum: Date | undefined;

    // wird aufgerufen von fromServer() oder von fromForm()
    // eslint-disable-next-line max-params
    private constructor(
        public _id: string | undefined, // eslint-disable-line @typescript-eslint/naming-convention
        public titel: string,
        public verlag: string,
        public adresse: Adresse,
        public familienstand: FamilienstandType,
        public geschlecht: GeschlechtType | '' | undefined,
        geburtsdatum: string | undefined,
        public newsletter: boolean | undefined,
        public interessen: string[],
        public version: number | undefined,
        public user?: User | undefined,
    ) {
        // TODO Parsing, ob der Geburtsdatum-String valide ist
        this.geburtsdatum =
            geburtsdatum === undefined ? new Date() : new Date(geburtsdatum);
        log.debug('Buch(): this=', this);
    }

    /**
     * Ein Buch-Objekt mit JSON-Daten erzeugen, die von einem RESTful Web
     * Service kommen.
     * @param buch JSON-Objekt mit Daten vom RESTful Web Server
     * @return Das initialisierte Buch-Objekt
     */
    static fromServer(buchServer: BuchServer, etag?: string) {
        let selfLink: string | undefined;
        const { _links } = buchServer; // eslint-disable-line @typescript-eslint/naming-convention
        if (_links !== undefined) {
            const { self } = _links;
            selfLink = self.href;
        }
        let id: string | undefined;
        if (selfLink !== undefined) {
            const lastSlash = selfLink.lastIndexOf('/');
            id = selfLink.slice(lastSlash + 1);
        }

        let version: number | undefined;
        if (etag !== undefined) {
            // Anfuehrungszeichen am Anfang und am Ende entfernen
            const versionStr = etag.slice(1, -1);
            version = Number.parseInt(versionStr, 10);
        }

        const {
            titel,
            verlag,
            adresse,
            familienstand,
            geschlecht,
            geburtsdatum,
            newsletter,
            interessen,
        } = buchServer;
        const buch = new Buch(
            id,
            titel ?? 'unbekannt',
            verlag,
            adresse,
            familienstand,
            geschlecht,
            geburtsdatum,
            newsletter,
            interessen ?? [],
            version,
        );
        log.debug('Buch.fromServer(): buch=', buch);
        return buch;
    }

    /**
     * Ein Buch-Objekt mit JSON-Daten erzeugen, die von einem Formular kommen.
     * @param buch JSON-Objekt mit Daten vom Formular
     * @return Das initialisierte Buch-Objekt
     */
    static fromForm(buchForm: BuchForm) {
        log.debug('Buch.fromForm(): buchForm=', buchForm);
        const interessen: string[] = [];
        if (buchForm.sport === true) {
            interessen.push('S');
        }
        if (buchForm.lesen === true) {
            interessen.push('L');
        }
        if (buchForm.reisen === true) {
            interessen.push('R');
        }

        const user: User = {
            username: buchForm.titel?.toLocaleLowerCase() ?? 'neuerUser',
            password: 'p',
        };

        console.log('gibt es user?', user);

        const buch = new Buch(
            buchForm._id,
            buchForm.titel ?? 'unbekannt',
            buchForm.verlag,
            buchForm.adresse,
            buchForm.familienstand,
            buchForm.geschlecht,
            buchForm.geburtsdatum,
            buchForm.newsletter,
            interessen,
            buchForm.version,
            user,
        );
        log.debug('Buch.fromForm(): buch=', buch);
        return buch;
    }

    // Property in TypeScript wie in C#
    // https://www.typescriptlang.org/docs/handbook/classes.html#accessors
    get geburtsdatumFormatted() {
        // z.B. 7. Mai 2020
        const formatter = new Intl.DateTimeFormat('de', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        return this.geburtsdatum === undefined
            ? ''
            : formatter.format(this.geburtsdatum);
    }

    /**
     * Abfrage, ob im Titel der angegebene Teilstring enthalten ist. Dabei
     * wird nicht auf Gross-/Kleinschreibung geachtet.
     * @param titel Zu &uuml;berpr&uuml;fender Teilstring
     * @return true, falls der Teilstring im Titel enthalten ist. Sonst
     *         false.
     */
    containsTitel(titel: string) {
        return this.titel.toLowerCase().includes(titel.toLowerCase());
    }

    /**
     * Abfrage, ob der Buch dem angegebenen Geschlecht zugeordnet ist.
     * @param geschlechtType das Geschlecht
     * @return true, falls der Buch dem Geschlecht zugeordnet ist. Sonst false.
     */
    hasGeschlechtType(geschlechtType: string) {
        return this.geschlecht === geschlechtType;
    }

    /**
     * Aktualisierung der Stammdaten des Buch-Objekts.
     * @param titel Der neue Titel
     * @param familienstand Der neue Familienstand
     * @param geschlecht Das neue Geschlecht
     */
    // eslint-disable-next-line max-params
    updateStammdaten(
        titel: string,
        verlag: string,
        adresse: Adresse,
        familienstand: FamilienstandType,
        geschlecht: GeschlechtType | '' | undefined,
        geburtsdatum: Date | undefined,
    ) {
        this.titel = titel;
        (this.verlag = verlag),
            (this.adresse = adresse),
            (this.familienstand = familienstand);
        this.geschlecht = geschlecht;
        this.geburtsdatum =
            geburtsdatum === undefined ? new Date() : geburtsdatum;
    }

    /**
     * Abfrage, ob es zum Buch auch Schlagw&ouml;rter gibt.
     * @return true, falls es mindestens ein Interesse gibt. Sonst false.
     */
    hasInteressen() {
        return this.interessen.length > 0;
    }

    /**
     * Abfrage, ob es zum Buch das angegebene Interesse gibt.
     * @param interesse das zu &uuml;berpr&uuml;fende Interesse
     * @return true, falls es das Interesse gibt. Sonst false.
     */
    hasInteresse(interesse: string) {
        return this.interessen.includes(interesse);
    }

    /**
     * Aktualisierung der Interessen des Buch-Objekts.
     * @param javascript ist das Interesse JAVASCRIPT gesetzt
     * @param typescript ist das Interesse TYPESCRIPT gesetzt
     */
    updateInteressen(sport: boolean, lesen: boolean, reisen: boolean) {
        this.resetInteressen();
        if (sport) {
            this.addInteresse('S');
        }
        if (lesen) {
            this.addInteresse('L');
        }
        if (reisen) {
            this.addInteresse('R');
        }
    }

    /**
     * Konvertierung des Buchobjektes in ein JSON-Objekt f&uuml;r den RESTful
     * Web Service.
     * @return Das JSON-Objekt f&uuml;r den RESTful Web Service
     */
    toJSON(): BuchServer {
        const geburtsdatum =
            this.geburtsdatum === undefined
                ? undefined
                : this.geburtsdatum.toISOString().split('T')[0];
        log.debug(`toJson(): geburtsdatum=${geburtsdatum}`);
        return {
            _id: this._id, // eslint-disable-line @typescript-eslint/naming-convention
            titel: this.titel,
            verlag: this.verlag,
            adresse: this.adresse,
            familienstand: this.familienstand,
            geschlecht: this.geschlecht,
            geburtsdatum,
            newsletter: this.newsletter,
            interessen: this.interessen,
            user: this.user,
        };
    }

    toString() {
        // eslint-disable-next-line no-null/no-null,unicorn/no-null
        return JSON.stringify(this, null, Buch.SPACE);
    }

    private resetInteressen() {
        this.interessen = [];
    }

    private addInteresse(interesse: string) {
        this.interessen.push(interesse);
    }
}
/* eslint-enable max-lines */
/* eslint-enable no-extra-parens */
/* eslint-enable no-sequences */
/* eslint-enable no-unused-expressions */
