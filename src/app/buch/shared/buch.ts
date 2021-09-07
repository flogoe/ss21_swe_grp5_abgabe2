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

export type ArtType = 'D' | 'M' | 'W';

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
    preisrabatt: PreisRabatt;
    art?: ArtType | '';
    familienstand: FamilienstandType;
    erscheinungsdatum?: string;
    lieferbar?: boolean;
    version?: number;
    // eslint-disable-next-line no-use-before-define
    user?: User;
}

export interface PreisRabatt {
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

    erscheinungsdatum: Date | undefined;

    // wird aufgerufen von fromServer() oder von fromForm()
    // eslint-disable-next-line max-params
    private constructor(
        public _id: string | undefined, // eslint-disable-line @typescript-eslint/naming-convention
        public titel: string,
        public verlag: string,
        public preisrabatt: PreisRabatt,
        public familienstand: FamilienstandType,
        public art: ArtType | '' | undefined,
        erscheinungsdatum: string | undefined,
        public lieferbar: boolean | undefined,
        public schlagwoerter: string[],
        public version: number | undefined,
        public user?: User | undefined,
    ) {
        // TODO Parsing, ob der Erscheinungsdatum-String valide ist
        this.erscheinungsdatum =
            erscheinungsdatum === undefined
                ? new Date()
                : new Date(erscheinungsdatum);
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
            preisrabatt,
            familienstand,
            art,
            erscheinungsdatum,
            lieferbar,
            schlagwoerter,
        } = buchServer;
        const buch = new Buch(
            id,
            titel ?? 'unbekannt',
            verlag,
            preisrabatt,
            familienstand,
            art,
            erscheinungsdatum,
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
    static fromForm(buchForm: BuchForm) {
        log.debug('Buch.fromForm(): buchForm=', buchForm);
        const schlagwoerter: string[] = [];
        if (buchForm.sport === true) {
            schlagwoerter.push('S');
        }
        if (buchForm.lesen === true) {
            schlagwoerter.push('L');
        }
        if (buchForm.reisen === true) {
            schlagwoerter.push('R');
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
            buchForm.preisrabatt,
            buchForm.familienstand,
            buchForm.art,
            buchForm.erscheinungsdatum,
            buchForm.lieferbar,
            schlagwoerter,
            buchForm.version,
            user,
        );
        log.debug('Buch.fromForm(): buch=', buch);
        return buch;
    }

    // Property in TypeScript wie in C#
    // https://www.typescriptlang.org/docs/handbook/classes.html#accessors
    get erscheinungsdatumFormatted() {
        // z.B. 7. Mai 2020
        const formatter = new Intl.DateTimeFormat('de', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        return this.erscheinungsdatum === undefined
            ? ''
            : formatter.format(this.erscheinungsdatum);
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
        familienstand: FamilienstandType,
        art: ArtType | '' | undefined,
        erscheinungsdatum: Date | undefined,
    ) {
        this.titel = titel;
        (this.verlag = verlag),
            (this.preisrabatt = preisrabatt),
            (this.familienstand = familienstand);
        this.art = art;
        this.erscheinungsdatum =
            erscheinungsdatum === undefined ? new Date() : erscheinungsdatum;
    }

    /**
     * Abfrage, ob es zum Buch auch Schlagw&ouml;rter gibt.
     * @return true, falls es mindestens ein Interesse gibt. Sonst false.
     */
    hasSchlagwoerter() {
        return this.schlagwoerter.length > 0;
    }

    /**
     * Abfrage, ob es zum Buch das angegebene Interesse gibt.
     * @param interesse das zu &uuml;berpr&uuml;fende Interesse
     * @return true, falls es das Interesse gibt. Sonst false.
     */
    hasInteresse(interesse: string) {
        return this.schlagwoerter.includes(interesse);
    }

    /**
     * Aktualisierung der Schlagwoerter des Buch-Objekts.
     * @param javascript ist das Interesse JAVASCRIPT gesetzt
     * @param typescript ist das Interesse TYPESCRIPT gesetzt
     */
    updateSchlagwoerter(sport: boolean, lesen: boolean, reisen: boolean) {
        this.resetSchlagwoerter();
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
        const erscheinungsdatum =
            this.erscheinungsdatum === undefined
                ? undefined
                : this.erscheinungsdatum.toISOString().split('T')[0];
        log.debug(`toJson(): erscheinungsdatum=${erscheinungsdatum}`);
        return {
            _id: this._id, // eslint-disable-line @typescript-eslint/naming-convention
            titel: this.titel,
            verlag: this.verlag,
            preisrabatt: this.preisrabatt,
            familienstand: this.familienstand,
            art: this.art,
            erscheinungsdatum,
            lieferbar: this.lieferbar,
            schlagwoerter: this.schlagwoerter,
            user: this.user,
        };
    }

    toString() {
        // eslint-disable-next-line no-null/no-null,unicorn/no-null
        return JSON.stringify(this, null, Buch.SPACE);
    }

    private resetSchlagwoerter() {
        this.schlagwoerter = [];
    }

    private addInteresse(interesse: string) {
        this.schlagwoerter.push(interesse);
    }
}
/* eslint-enable max-lines */
/* eslint-enable no-extra-parens */
/* eslint-enable no-sequences */
/* eslint-enable no-unused-expressions */