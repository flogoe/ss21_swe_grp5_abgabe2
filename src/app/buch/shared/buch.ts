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

export type ArtType = 'DRUCKAUSGABE' | 'KINDLE';

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
    isbn: string;
    rating: number;
    // eslint-disable-next-line no-use-before-define
    preis: number;
    rabatt: number;
    art?: ArtType | '';
    datum?: string;
    lieferbar?: boolean;
    version?: number;
    // eslint-disable-next-line no-use-before-define
    user?: User;
}

export interface PreisRabatt {
    preis: number;
    rabatt: number;
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
    schlagwoerter?: string[];
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
    javascript?: boolean;
    typescript?: boolean;
}

/**
 * Model als Plain-Old-JavaScript-Object (POJO) fuer die Daten *UND*
 * Functions fuer Abfragen und Aenderungen.
 */
export class Buch {
    private static readonly SPACE = 2;

    datum: Date | undefined;

    // wird aufgerufen von fromServer() oder von fromForm()
    // eslint-disable-next-line max-params
    private constructor(
        public _id: string | undefined, // eslint-disable-line @typescript-eslint/naming-convention
        public titel: string,
        public verlag: string,
        public isbn: string,
        public preis: number,
        public rabatt: number,
        public rating: number,
        public art: ArtType | '' | undefined,
        datum: string | undefined,
        public lieferbar: boolean | undefined,
        public schlagwoerter: string[],
        public version: number | undefined, // public user?: User | undefined,
    ) {
        // TODO Parsing, ob der Datum-String valide ist
        this.datum = datum === undefined ? new Date() : new Date(datum);
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
            isbn,
            preis,
            rabatt,
            rating,
            art,
            datum,
            lieferbar,
            schlagwoerter,
        } = buchServer;
        const buch = new Buch(
            id,
            titel ?? 'unbekannt',
            verlag,
            isbn,
            preis,
            rabatt,
            rating,
            art,
            datum,
            lieferbar,
            schlagwoerter ?? [],
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
    static fromForm(buchForm: BuchForm | any) {
        log.debug('Buch.fromForm(): buchForm=', buchForm);
        const schlagwoerter: string[] = [];
        if (buchForm.javascript === true) {
            schlagwoerter.push('JAVASCRIPT');
        }
        if (buchForm.typescript === true) {
            schlagwoerter.push('TYPESCRIPT');
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
            buchForm.isbn,
            buchForm.preisrabatt.preis,
            buchForm.preisrabatt.rabatt,
            buchForm.rating,
            buchForm.art,
            buchForm.datum,
            buchForm.lieferbar,
            schlagwoerter,
            buchForm.version,
        );
        log.debug('Buch.fromForm(): buch=', buch);
        return buch;
    }

    // Property in TypeScript wie in C#
    // https://www.typescriptlang.org/docs/handbook/classes.html#accessors
    get datumFormatted() {
        // z.B. 7. Mai 2020
        const formatter = new Intl.DateTimeFormat('de', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        return this.datum === undefined ? '' : formatter.format(this.datum);
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
     * Abfrage, ob der Buch dem angegebenen Art zugeordnet ist.
     * @param artType das Art
     * @return true, falls der Buch dem Art zugeordnet ist. Sonst false.
     */
    hasArtType(artType: string) {
        return this.art === artType;
    }

    /**
     * Aktualisierung der Stammdaten des Buch-Objekts.
     * @param titel Der neue Titel
     * @param familienstand Der neue Familienstand
     * @param art Das neue Art
     */
    // eslint-disable-next-line max-params
    updateStammdaten(
        titel: string,
        verlag: string,
        preisrabatt: PreisRabatt,
        art: ArtType | '' | undefined,
        datum: Date | undefined,
    ) {
        this.titel = titel;
        (this.verlag = verlag),
            (this.preis = preisrabatt.preis),
            (this.rabatt = preisrabatt.rabatt),
            (this.art = art);
        this.datum = datum === undefined ? new Date() : datum;
    }

    /**
     * Abfrage, ob es zum Buch auch Schlagw&ouml;rter gibt.
     * @return true, falls es mindestens ein Schlagwort gibt. Sonst false.
     */
    hasSchlagwoerter() {
        return this.schlagwoerter.length > 0;
    }

    /**
     * Abfrage, ob es zum Buch das angegebene Schlagwort gibt.
     * @param schlagwort das zu &uuml;berpr&uuml;fende Schlagwort
     * @return true, falls es das Schlagwort gibt. Sonst false.
     */
    hasSchlagwort(schlagwort: string) {
        return this.schlagwoerter.includes(schlagwort);
    }

    /**
     * Aktualisierung der Schlagwoerter des Buch-Objekts.
     * @param javascript ist das Schlagwort JAVASCRIPT gesetzt
     * @param typescript ist das Schlagwort TYPESCRIPT gesetzt
     */
    updateSchlagwoerter(javascript: boolean, typescript: boolean) {
        this.resetSchlagwoerter();
        if (javascript) {
            this.addSchlagwort('JAVASCRIPT');
        }
        if (typescript) {
            this.addSchlagwort('TYPESCRIPT');
        }
    }

    /**
     * Konvertierung des Buchobjektes in ein JSON-Objekt f&uuml;r den RESTful
     * Web Service.
     * @return Das JSON-Objekt f&uuml;r den RESTful Web Service
     */
    toJSON(): BuchServer {
        const datum =
            this.datum === undefined
                ? undefined
                : this.datum.toISOString().split('T')[0];
        log.debug(`toJson(): datum=${datum}`);
        return {
            _id: this._id, // eslint-disable-line @typescript-eslint/naming-convention
            titel: this.titel,
            verlag: this.verlag,
            isbn: this.isbn,
            preis: this.preis,
            rabatt: this.rabatt,
            rating: this.rating,
            art: this.art,
            datum,
            lieferbar: this.lieferbar,
            schlagwoerter: this.schlagwoerter,
        };
    }

    toString() {
        // eslint-disable-next-line no-null/no-null,unicorn/no-null
        return JSON.stringify(this, null, Buch.SPACE);
    }

    private resetSchlagwoerter() {
        this.schlagwoerter = [];
    }

    private addSchlagwort(schlagwort: string) {
        this.schlagwoerter.push(schlagwort);
    }
}
/* eslint-enable max-lines */
/* eslint-enable no-extra-parens */
/* eslint-enable no-sequences */
/* eslint-enable no-unused-expressions */
