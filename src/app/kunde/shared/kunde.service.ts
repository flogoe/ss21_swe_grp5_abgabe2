/* eslint-disable max-lines,no-null/no-null */
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

import { BASE_PATH_REST, KUNDEN_PATH_REST } from '../../shared';
import type { FamilienstandType, GeschlechtType, KundeServer } from './kunde';
import { FindError, RemoveError, SaveError, UpdateError } from './errors';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
    HttpClient,
    HttpHeaders,
    HttpParams,
    HttpResponse,
} from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

import type { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Kunde } from './kunde';
import type { Observable } from 'rxjs';
import log from 'loglevel';
import { of } from 'rxjs';

export interface Suchkriterien {
    nachname: string;
    geschlechtType: GeschlechtType | '';
    familienstand: FamilienstandType | '';
    interessen: { sport: boolean; lesen: boolean; reisen: boolean };
}

// Methoden der Klasse HttpClient
//  * get(url, options) – HTTP GET request
//  * post(url, body, options) – HTTP POST request
//  * put(url, body, options) – HTTP PUT request
//  * patch(url, body, options) – HTTP PATCH request
//  * delete(url, options) – HTTP DELETE request

// Eine Service-Klasse ist eine "normale" Klasse gemaess ES 2015, die mittels
// DI in eine Komponente injiziert werden kann, falls sie innerhalb von
// provider: [...] bei einem Modul oder einer Komponente bereitgestellt wird.
// Eine Komponente realisiert gemaess MVC-Pattern den Controller und die View.
// Die Anwendungslogik wird vom Controller an Service-Klassen delegiert.

/**
 * Die Service-Klasse zu B&uuml;cher wird zum "Root Application Injector"
 * hinzugefuegt und ist in allen Klassen der Webanwendung verfuegbar.
 */
/* eslint-disable no-underscore-dangle */
@Injectable({ providedIn: 'root' })
export class KundeService {
    private readonly baseUrlKunden!: string;

    private _kunde: Kunde | undefined;

    /**
     * @param httpClient injizierter Service HttpClient (von Angular)
     * @return void
     */
    constructor(private readonly httpClient: HttpClient) {
        this.baseUrlKunden = `${BASE_PATH_REST}/${KUNDEN_PATH_REST}`;
        log.debug(
            `KundeService.constructor(): baseUrlKunden=${this.baseUrlKunden}`,
        );
    }

    /**
     * Ein Kunde-Objekt puffern.
     * @param kunde Das Kunde-Objekt, das gepuffert wird.
     * @return void
     */
    set kunde(kunde: Kunde) {
        log.debug('KundeService.set kunde()', kunde);
        this._kunde = kunde;
    }

    /**
     * Kunden anhand von Suchkriterien suchen
     * @param suchkriterien Die Suchkriterien
     * @returns Gefundene Kunden oder Statuscode des fehlerhaften GET-Requests
     */
    find(
        suchkriterien: Suchkriterien | undefined = undefined, // eslint-disable-line unicorn/no-useless-undefined
    ): Observable<Kunde[] | FindError> {
        log.debug('KundeService.find(): suchkriterien=', suchkriterien);
        const params = this.suchkriterienToHttpParams(suchkriterien);
        const url = this.baseUrlKunden;
        log.debug(`KundeService.find(): url=${url}`);

        return (
            this.httpClient
                .get<KundeServer[]>(url, { params })

                // Observable: mehrere Werte werden "lazy" bereitgestellt, statt in einem JSON-Array
                // pipe ist eine "pure" Funktion, die ein Observable in ein NEUES Observable transformiert
                .pipe(
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    catchError((err: unknown, _$) => {
                        const errResponse = err as HttpErrorResponse;
                        return of(this.buildFindError(errResponse));
                    }),

                    // entweder Observable<KundeServer[]> oder Observable<FindError>
                    map(result => this.findResultToKundeArray(result)),
                )
        );

        // Same-Origin-Policy verhindert Ajax-Datenabfragen an einen Server in
        // einer anderen Domain. JSONP (= JSON mit Padding) ermoeglicht die
        // Uebertragung von JSON-Daten ueber Domaingrenzen.
        // Falls benoetigt, gibt es in Angular dafuer den Service Jsonp.
    }

    private findResultToKundeArray(res: any | FindError): Kunde[] | FindError {
        if (res instanceof FindError) {
            return res;
        }
        const result = res._embedded.kundeList as KundeServer[];
        const kunden = result.map(kunde => Kunde.fromServer(kunde));
        log.debug('KundeService.mapFindResult(): kunden=', kunden);
        return kunden;
    }

    /**
     * Ein Kunde anhand der ID suchen
     * @param id Die ID des gesuchten Kundes
     */
    findById(id: string | undefined): Observable<Kunde | FindError> {
        log.debug(`KundeService.findById(): id=${id}`);

        if (id === undefined) {
            log.debug('KundeService.findById(): Keine Id');
            return of(this.buildFindError());
        }

        // Gibt es ein gepuffertes Kunde mit der gesuchten ID und Versionsnr.?
        if (
            this._kunde !== undefined &&
            this._kunde._id === id &&
            this._kunde.version !== undefined
        ) {
            log.debug(
                `KundeService.findById(): Kunde gepuffert, version=${this._kunde.version}`,
            );
            return of(this._kunde);
        }

        // wegen fehlender Versionsnummer (im ETag) nachladen
        const url = `${this.baseUrlKunden}/${id}`;
        log.debug(`KundeService.findById(): url=${url}`);

        return (
            this.httpClient
                /* eslint-disable object-curly-newline */
                .get<KundeServer>(url, {
                    observe: 'response',
                })
                /* eslint-enable object-curly-newline */

                .pipe(
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    catchError((err: unknown, _$) => {
                        const errResponse = err as HttpErrorResponse;
                        return of(this.buildFindError(errResponse));
                    }),

                    // entweder Observable<HttpResponse<KundeServer>> oder Observable<FindError>
                    map(result => this.findByIdResultToKunde(result)),
                )
        );
    }

    private findByIdResultToKunde(
        result: FindError | HttpResponse<KundeServer>,
    ): Kunde | FindError {
        if (result instanceof FindError) {
            return result;
        }

        const { body, headers } = result;
        if (body === null) {
            return this.buildFindError();
        }

        const etag = headers.get('ETag') ?? undefined;
        log.debug(`KundeService.findByIdResultToKunde(): etag=${etag}`);

        this._kunde = Kunde.fromServer(body, etag);
        return this._kunde;
    }

    /**
     * Ein neues Kunde anlegen
     * @param neuesKunde Das JSON-Objekt mit dem neuen Kunde
     */
    save(kunde: Kunde): Observable<SaveError | string> {
        log.debug('KundeService.save(): kunde=', kunde);
        kunde.geburtsdatum = new Date();

        /* eslint-disable @typescript-eslint/naming-convention */
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'text/plain',
        });
        /* eslint-enable @typescript-eslint/naming-convention */

        return this.httpClient
            .post(this.baseUrlKunden, kunde.toJSON(), {
                headers,
                observe: 'response',
                responseType: 'text',
            })
            .pipe(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                catchError((err: unknown, _$) => {
                    const errResponse = err as HttpErrorResponse;
                    return of(new SaveError(errResponse.status, errResponse));
                }),

                // entweder Observable<HttpResponse<string>> oder Observable<SaveError>
                map(result => this.mapSaveResultToId(result)),
            );
    }

    private mapSaveResultToId(
        result: HttpResponse<string> | SaveError,
    ): SaveError | string {
        if (!(result instanceof HttpResponse)) {
            return result;
        }

        const response = result;
        log.debug('KundeService.save(): map(): response', response);

        // id aus Header "Locaction" extrahieren
        const location = response.headers.get('Location');
        const id = location?.slice(location.lastIndexOf('/') + 1);

        if (id === undefined) {
            return new SaveError(-1, 'Keine Id');
        }

        return id;
    }

    /**
     * Ein vorhandenes Kunde aktualisieren
     * @param kunde Das JSON-Objekt mit den aktualisierten Kundedaten
     */
    update(kunde: Kunde): Observable<Kunde | UpdateError> {
        log.debug('KundeService.update(): kunde=', kunde);

        const { version, _id } = kunde; // eslint-disable-line @typescript-eslint/naming-convention
        if (version === undefined) {
            const msg = `Keine Versionsnummer fuer das Kunde ${_id}`;
            log.debug(msg);
            return of(new UpdateError(-1, msg));
        }

        const url = `${this.baseUrlKunden}/${_id}`;
        /* eslint-disable @typescript-eslint/naming-convention */
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'text/plain',
            'If-Match': `"${version}"`,
        });
        /* eslint-enable @typescript-eslint/naming-convention */
        log.debug('KundeService.update(): headers=', headers);

        return this.httpClient
            .put(url, kunde, { headers, observe: 'response' })
            .pipe(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                catchError((err: unknown, _$) => {
                    const errResponse = err as HttpErrorResponse;
                    return of(new UpdateError(errResponse.status, errResponse));
                }),

                map(result => this.mapUpdateResultToVersion(result)),

                map(versionOderError => {
                    if (versionOderError instanceof UpdateError) {
                        return versionOderError;
                    }
                    kunde.version = versionOderError;
                    return kunde;
                }),
            );
    }

    private mapUpdateResultToVersion(
        result: HttpResponse<unknown> | UpdateError,
    ): UpdateError | number {
        if (result instanceof UpdateError) {
            return result;
        }

        const response = result;
        log.debug('KundeService.mapUpdateResult(): response', response);
        const etag = response.headers.get('ETag');
        log.debug(`KundeService.mapUpdateResult(): etag=${etag}`);

        const ende = etag?.lastIndexOf('"');
        const versionStr = etag?.slice(1, ende) ?? '1';
        return Number.parseInt(versionStr, 10);
    }

    /**
     * Ein Kunde l&ouml;schen
     * @param kunde Das JSON-Objekt mit dem zu loeschenden Kunde
     */
    remove(kunde: Kunde): Observable<Record<string, unknown> | RemoveError> {
        log.debug('KundeService.remove(): kunde=', kunde);
        const url = `${this.baseUrlKunden}/${kunde._id}`;

        return this.httpClient.delete(url).pipe(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            catchError((err: unknown, _$) => {
                const errResponse = err as HttpErrorResponse;
                return of(new RemoveError(errResponse.status));
            }),

            map(result => {
                if (result instanceof RemoveError) {
                    return result;
                }
                return {};
            }),
        );
    }

    /**
     * Suchkriterien in Request-Parameter konvertieren.
     * @param suchkriterien Suchkriterien fuer den GET-Request.
     * @return Parameter fuer den GET-Request
     */
    private suchkriterienToHttpParams(
        suchkriterien: Suchkriterien | undefined,
    ): HttpParams {
        log.debug(
            'KundeService.suchkriterienToHttpParams(): suchkriterien=',
            suchkriterien,
        );
        let httpParams = new HttpParams();

        if (suchkriterien === undefined) {
            return httpParams;
        }

        const { nachname, geschlechtType, familienstand, interessen } =
            suchkriterien;
        const { sport, lesen, reisen } = interessen;

        if (nachname !== '') {
            httpParams = httpParams.set('nachname', nachname);
        }
        if (familienstand !== '') {
            httpParams = httpParams.set('familienstand', familienstand);
        }
        if (geschlechtType !== '') {
            httpParams = httpParams.set('geschlechtType', geschlechtType);
        }
        if (sport) {
            httpParams = httpParams.set('sport', 'true');
        }
        if (lesen) {
            httpParams = httpParams.set('lesen', 'true');
        }
        if (reisen) {
            httpParams = httpParams.set('reisen', 'true');
        }
        return httpParams;
    }

    private buildFindError(err?: HttpErrorResponse) {
        if (err === undefined) {
            return new FindError(-1);
        }

        if (err.error instanceof ProgressEvent) {
            const msg = 'Client-seitiger oder Netzwerkfehler';
            log.error(msg, err.error);
            return new FindError(-1, err);
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { status, error } = err;
        log.debug(
            `KundeService.buildFindError(): status=${status}, Response-Body=`,
            error,
        );
        return new FindError(status, err);
    }
}
/* eslint-enable no-underscore-dangle */
/* eslint-enable max-lines,no-null/no-null */
