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

export type GeschlechtType = 'MAENNLICH' | 'WEIBLICH' | 'DIVERS';

export type FamilienstandType =
    | 'LEDIG'
    | 'VERHEIRATET'
    | 'GESCHIEDEN'
    | 'VERWITWET';

export const ISBN_REGEX =
    /\d{3}-\d-\d{5}-\d{3}-\d|\d-\d{5}-\d{3}-\d|\d-\d{4}-\d{4}-\d|\d{3}-\d{10}/u;

/**
 * Gemeinsame Datenfelder unabh&auml;ngig, ob die Kundedaten von einem Server
 * (z.B. RESTful Web Service) oder von einem Formular kommen.
 */
export interface KundeShared {
    _id?: string; // eslint-disable-line @typescript-eslint/naming-convention
    nachname: string | undefined;
    email: string;
    adresse: Adresse;
    geschlecht?: GeschlechtType | '';
    familienstand: FamilienstandType;
    datum?: string;
    newsletter?: boolean;
    version?: number;
}

export interface Adresse {
    plz: string;
    ort: string;
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
export interface KundeForm extends KundeShared {
    sport?: boolean;
    lesen?: boolean;
    reisen?: boolean;
}

/**
 * Model als Plain-Old-JavaScript-Object (POJO) fuer die Daten *UND*
 * Functions fuer Abfragen und Aenderungen.
 */
export class Kunde {
    private static readonly SPACE = 2;

    datum: Date | undefined;

    // wird aufgerufen von fromServer() oder von fromForm()
    // eslint-disable-next-line max-params
    private constructor(
        public _id: string | undefined, // eslint-disable-line @typescript-eslint/naming-convention
        public nachname: string,
        public email: string,
        public adresse: Adresse,
        public familienstand: FamilienstandType,
        public geschlecht: GeschlechtType | '' | undefined,
        datum: string | undefined,
        public newsletter: boolean | undefined,
        public interessen: string[],
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
            nachname,
            email,
            adresse,
            familienstand,
            geschlecht,
            datum,
            newsletter,
            interessen,
        } = kundeServer;
        const kunde = new Kunde(
            id,
            nachname ?? 'unbekannt',
            email,
            adresse,
            familienstand,
            geschlecht,
            datum,
            newsletter,
            interessen ?? [],
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
        const interessen: string[] = [];
        if (kundeForm.sport === true) {
            interessen.push('S');
        }
        if (kundeForm.lesen === true) {
            interessen.push('L');
        }
        if (kundeForm.reisen === true) {
            interessen.push('R');
        }

        const kunde = new Kunde(
            kundeForm._id,
            kundeForm.nachname ?? 'unbekannt',
            kundeForm.email,
            kundeForm.adresse,
            kundeForm.familienstand,
            kundeForm.geschlecht,
            kundeForm.datum,
            kundeForm.newsletter,
            interessen,
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
     * Abfrage, ob im Nachname der angegebene Teilstring enthalten ist. Dabei
     * wird nicht auf Gross-/Kleinschreibung geachtet.
     * @param nachname Zu &uuml;berpr&uuml;fender Teilstring
     * @return true, falls der Teilstring im Nachname enthalten ist. Sonst
     *         false.
     */
    containsNachname(nachname: string) {
        return this.nachname.toLowerCase().includes(nachname.toLowerCase());
    }

    /**
     * Abfrage, ob der Kunde dem angegebenen Geschlecht zugeordnet ist.
     * @param geschlechtType das Geschlecht
     * @return true, falls der Kunde dem Geschlecht zugeordnet ist. Sonst false.
     */
    hasGeschlechtType(geschlechtType: string) {
        return this.geschlecht === geschlechtType;
    }

    /**
     * Aktualisierung der Stammdaten des Kunde-Objekts.
     * @param nachname Der neue Nachname
     * @param familienstand Der neue Familienstand
     * @param geschlecht Das neue Geschlecht
     */
    // eslint-disable-next-line max-params
    updateStammdaten(
        nachname: string,
        familienstand: FamilienstandType,
        geschlecht: GeschlechtType | '' | undefined,
        datum: Date | undefined,
    ) {
        this.nachname = nachname;
        this.familienstand = familienstand;
        this.geschlecht = geschlecht;
        /* eslint-enable unicorn/no-new-array */
        this.datum = datum === undefined ? new Date() : datum;
    }

    /**
     * Abfrage, ob es zum Kunde auch Schlagw&ouml;rter gibt.
     * @return true, falls es mindestens ein Interesse gibt. Sonst false.
     */
    hasInteressen() {
        return this.interessen.length > 0;
    }

    /**
     * Abfrage, ob es zum Kunde das angegebene Interesse gibt.
     * @param interesse das zu &uuml;berpr&uuml;fende Interesse
     * @return true, falls es das Interesse gibt. Sonst false.
     */
    hasInteresse(interesse: string) {
        return this.interessen.includes(interesse);
    }

    /**
     * Aktualisierung der Schlagw&ouml;rter des Kunde-Objekts.
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
            nachname: this.nachname,
            email: this.email,
            adresse: this.adresse,
            familienstand: this.familienstand,
            geschlecht: this.geschlecht,
            datum,
            newsletter: this.newsletter,
            interessen: this.interessen,
        };
    }

    toString() {
        // eslint-disable-next-line no-null/no-null,unicorn/no-null
        return JSON.stringify(this, null, Kunde.SPACE);
    }

    private resetInteressen() {
        this.interessen = [];
    }

    private addInteresse(interesse: string) {
        this.interessen.push(interesse);
    }
}
/* eslint-enable max-lines */
