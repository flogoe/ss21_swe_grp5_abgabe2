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

import type { DataItem, MultiSeries } from '@swimlane/ngx-charts';
import { FindError, Kunde, KundeService } from '../shared'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { first, map, tap } from 'rxjs/operators';

import { Component } from '@angular/core';
import { KeineKundenError } from './errors';
import type { OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import log from 'loglevel';

/**
 * Komponente mit dem Tag &lt;hs-liniendiagramm&gt; zur Visualisierung
 * von Bewertungen durch ein Liniendiagramm.
 */
@Component({
    selector: 'hs-liniendiagramm',
    templateUrl: './liniendiagramm.html',
})
export class LiniendiagrammComponent implements OnInit {
    series!: MultiSeries;

    constructor(
        private readonly kundeService: KundeService,
        private readonly titleService: Title,
    ) {
        log.debug('LiniendiagrammComponent.constructor()');
    }

    /**
     * Daten fuer das Liniendiagramm bereitstellen.
     */
    ngOnInit() {
        log.debug('LiniendiagrammComponent.ngOnInit()');
        this.setSeries();
        this.titleService.setTitle('Liniendiagramm');
    }

    private setSeries() {
        this.kundeService
            .find()
            .pipe(
                map(result => {
                    if (result instanceof FindError) {
                        throw new KeineKundenError();
                    }

                    return result.filter(kunde => kunde.rating !== undefined);
                }),
                first(),
                tap(kundeItems => {
                    const bewertungItems = this.getBewertungItems(kundeItems);
                    const preisItems = this.getPreisItems(kundeItems);
                    this.initSeries(bewertungItems, preisItems);
                }),
            )
            .subscribe();
    }

    // https://swimlane.gitbook.io/ngx-charts/examples/line-area-charts/line-chart
    private getBewertungItems(kunden: Kunde[]) {
        return kunden.map(kunde => {
            const bewertungItem: DataItem = {
                name: kunde._id!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
                value: kunde.rating!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
            };
            return bewertungItem;
        });
    }

    private getPreisItems(kunden: Kunde[]) {
        return kunden.map(kunde => {
            const preisItem: DataItem = {
                name: kunde._id!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
                value: kunde.preis,
            };
            return preisItem;
        });
    }

    private initSeries(bewertungItems: DataItem[], preisItems: DataItem[]) {
        const series: MultiSeries = [
            {
                name: 'Bewertungen',
                series: bewertungItems,
            },
            {
                name: 'Preise',
                series: preisItems,
            },
        ];

        this.series = series;
    }
}
