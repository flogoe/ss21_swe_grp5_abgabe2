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

const MAX_RATING = 5;

export type Verlag = 'BAR_VERLAG' | 'FOO_VERLAG';

export type KundeArt = 'DRUCKAUSGABE' | 'KINDLE';

// eslint-disable-next-line max-len
export const ISBN_REGEX =
    /\d{3}-\d-\d{5}-\d{3}-\d|\d-\d{5}-\d{3}-\d|\d-\d{4}-\d{4}-\d|\d{3}-\d{10}/u;

/**
 * Gemeinsame Datenfelder unabh&auml;ngig, ob die Kundedaten von einem Server
 * (z.B. RESTful Web Service) oder von einem Formular kommen.
 */
export interface KundeShared {
    _id?: string; // eslint-disable-line @typescript-eslint/naming-convention
    titel: string | undefined;
    verlag?: Verlag | '';
    art: KundeArt;
    preis: number;
    rabatt: number | undefined;
    datum?: string;
    lieferbar?: boolean;
    isbn: string;
    version?: number;
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
export interface KundeServer extends KundeShared {
    rating?: number;
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
export interface KundeForm extends KundeShared {
    rating: string;
    javascript?: boolean;
    typescript?: boolean;
}

/**
 * Model als Plain-Old-JavaScript-Object (POJO) fuer die Daten *UND*
 * Functions fuer Abfragen und Aenderungen.
 */
export class Kunde {
    private static readonly SPACE = 2;

    ratingArray: boolean[] =
        /* eslint-disable unicorn/no-new-array, unicorn/prefer-spread */
        this.rating === undefined
            ? new Array<boolean>(MAX_RATING).fill(false)
            : new Array<boolean>(this.rating)
                  .fill(true)
                  .concat(new Array(MAX_RATING - this.rating).fill(false));
    /* eslint-enable unicorn/no-new-array, unicorn/prefer-spread */

    datum: Date | undefined;

    // wird aufgerufen von fromServer() oder von fromForm()
    // eslint-disable-next-line max-params
    private constructor(
        public _id: string | undefined, // eslint-disable-line @typescript-eslint/naming-convention
        public titel: string,
        public rating: number | undefined,
        public art: KundeArt,
        public verlag: Verlag | '' | undefined,
        datum: string | undefined,
        public preis: number,
        public rabatt: number,
        public lieferbar: boolean | undefined,
        public schlagwoerter: string[],
        public isbn: string,
        public version: number | undefined,
    ) {
        // TODO Parsing, ob der Datum-String valide ist
        this.datum = datum === undefined ? new Date() : new Date(datum);
        log.debug('Kunde(): this=', this);
    }

    /**
     * Ein Kunde-Objekt mit JSON-Daten erzeugen, die von einem RESTful Web
     * Service kommen.
     * @param kunde JSON-Objekt mit Daten vom RESTful Web Server
     * @return Das initialisierte Kunde-Objekt
     */
    static fromServer(kundeServer: KundeServer, etag?: string) {
        let selfLink: string | undefined;
        const { _links } = kundeServer; // eslint-disable-line @typescript-eslint/naming-convention
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
            rating,
            art,
            verlag,
            datum,
            preis,
            rabatt,
            lieferbar,
            schlagwoerter,
            isbn,
        } = kundeServer;
        const kunde = new Kunde(
            id,
            titel ?? 'unbekannt',
            rating,
            art,
            verlag,
            datum,
            preis,
            rabatt ?? 0,
            lieferbar,
            schlagwoerter ?? [],
            isbn,
            version,
        );
        log.debug('Kunde.fromServer(): kunde=', kunde);
        return kunde;
    }

    /**
     * Ein Kunde-Objekt mit JSON-Daten erzeugen, die von einem Formular kommen.
     * @param kunde JSON-Objekt mit Daten vom Formular
     * @return Das initialisierte Kunde-Objekt
     */
    static fromForm(kundeForm: KundeForm) {
        log.debug('Kunde.fromForm(): kundeForm=', kundeForm);
        const schlagwoerter: string[] = [];
        if (kundeForm.javascript === true) {
            schlagwoerter.push('JAVASCRIPT');
        }
        if (kundeForm.typescript === true) {
            schlagwoerter.push('TYPESCRIPT');
        }

        const rabatt =
            kundeForm.rabatt === undefined ? 0 : kundeForm.rabatt / 100; // eslint-disable-line @typescript-eslint/no-magic-numbers
        const kunde = new Kunde(
            kundeForm._id,
            kundeForm.titel ?? 'unbekannt',
            Number(kundeForm.rating),
            kundeForm.art,
            kundeForm.verlag,
            kundeForm.datum,
            kundeForm.preis,
            rabatt,
            kundeForm.lieferbar,
            schlagwoerter,
            kundeForm.isbn,
            kundeForm.version,
        );
        log.debug('Kunde.fromForm(): kunde=', kunde);
        return kunde;
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
     * Abfrage, ob im Kundetitel der angegebene Teilstring enthalten ist. Dabei
     * wird nicht auf Gross-/Kleinschreibung geachtet.
     * @param titel Zu &uuml;berpr&uuml;fender Teilstring
     * @return true, falls der Teilstring im Kundetitel enthalten ist. Sonst
     *         false.
     */
    containsTitel(titel: string) {
        return this.titel.toLowerCase().includes(titel.toLowerCase());
    }

    /**
     * Die Bewertung ("rating") des Kundees um 1 erh&ouml;hen
     */
    rateUp() {
        if (this.rating !== undefined && this.rating < MAX_RATING) {
            this.rating++;
        }
    }

    /**
     * Die Bewertung ("rating") des Kundees um 1 erniedrigen
     */
    rateDown() {
        if (this.rating !== undefined && this.rating > 0) {
            this.rating--;
        }
    }

    /**
     * Abfrage, ob das Kunde dem angegebenen Verlag zugeordnet ist.
     * @param verlag der Name des Verlags
     * @return true, falls das Kunde dem Verlag zugeordnet ist. Sonst false.
     */
    hasVerlag(verlag: string) {
        return this.verlag === verlag;
    }

    /**
     * Aktualisierung der Stammdaten des Kunde-Objekts.
     * @param titel Der neue Kundetitel
     * @param rating Die neue Bewertung
     * @param art Die neue Kundeart (DRUCKAUSGABE oder KINDLE)
     * @param verlag Der neue Verlag
     * @param preis Der neue Preis
     * @param rabatt Der neue Rabatt
     */
    // eslint-disable-next-line max-params
    updateStammdaten(
        titel: string,
        art: KundeArt,
        verlag: Verlag | '' | undefined,
        rating: number | undefined,
        datum: Date | undefined,
        preis: number,
        rabatt: number,
        isbn: string,
    ) {
        this.titel = titel;
        this.art = art;
        this.verlag = verlag;
        this.rating = rating;
        /* eslint-disable unicorn/no-new-array */
        this.ratingArray =
            rating === undefined
                ? new Array<boolean>(MAX_RATING).fill(false)
                : new Array<boolean>(rating).fill(true);
        /* eslint-enable unicorn/no-new-array */
        this.datum = datum === undefined ? new Date() : datum;
        this.preis = preis;
        this.rabatt = rabatt;
        this.isbn = isbn;
    }

    /**
     * Abfrage, ob es zum Kunde auch Schlagw&ouml;rter gibt.
     * @return true, falls es mindestens ein Schlagwort gibt. Sonst false.
     */
    hasSchlagwoerter() {
        return this.schlagwoerter.length > 0;
    }

    /**
     * Abfrage, ob es zum Kunde das angegebene Schlagwort gibt.
     * @param schlagwort das zu &uuml;berpr&uuml;fende Schlagwort
     * @return true, falls es das Schlagwort gibt. Sonst false.
     */
    hasSchlagwort(schlagwort: string) {
        return this.schlagwoerter.includes(schlagwort);
    }

    /**
     * Aktualisierung der Schlagw&ouml;rter des Kunde-Objekts.
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
     * Konvertierung des Kundeobjektes in ein JSON-Objekt f&uuml;r den RESTful
     * Web Service.
     * @return Das JSON-Objekt f&uuml;r den RESTful Web Service
     */
    toJSON(): KundeServer {
        const datum =
            this.datum === undefined
                ? undefined
                : this.datum.toISOString().split('T')[0];
        log.debug(`toJson(): datum=${datum}`);
        return {
            _id: this._id, // eslint-disable-line @typescript-eslint/naming-convention
            titel: this.titel,
            rating: this.rating,
            art: this.art,
            verlag: this.verlag,
            datum,
            preis: this.preis,
            rabatt: this.rabatt,
            lieferbar: this.lieferbar,
            schlagwoerter: this.schlagwoerter,
            isbn: this.isbn,
        };
    }

    toString() {
        // eslint-disable-next-line no-null/no-null,unicorn/no-null
        return JSON.stringify(this, null, Kunde.SPACE);
    }

    private resetSchlagwoerter() {
        this.schlagwoerter = [];
    }

    private addSchlagwort(schlagwort: string) {
        this.schlagwoerter.push(schlagwort);
    }
}
/* eslint-enable max-lines */
