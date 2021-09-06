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

/**
 * Pfade an der Weboberflaeche
 */
export const HOME_PATH = 'home';

/**
 * Basis-Pfad fuer den REST-Server wahlweise via:
 * 1) Reverse Proxy oder
 * 2) CORS bei Kubernetes, wozu Port-Forwarding fuer den Web Service
 *    erforderlich ist.
 */
// export const BASE_PATH_REST = '/rest';
export const BASE_PATH_REST = 'http://localhost:3000/api'; //DevSkim: ignore DS137138 until 2021-10-06

/**
 * Pfad beim REST-Server fuer kunden
 */
export const KUNDEN_PATH_REST = '';
// export const KUNDEN_PATH_REST = 'kunden';
