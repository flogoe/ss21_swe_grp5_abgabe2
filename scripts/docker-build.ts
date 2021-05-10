/*
 * Copyright (C) 2021 - present Juergen Zimmermann, Hochschule Karlsruhe
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
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const shelljs = require('shelljs'); // eslint-disable-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, unicorn/prefer-module

const dockerAccount = 'juergenzimmermann';
const imageName = 'buchweb';
const imageTag = '1.0.0';

const image = `docker.io/${dockerAccount}/${imageName}:${imageTag}`;

// Dockerfile im aktuellen Verzeichnis
shelljs.exec(`docker build --tag ${image} .`);
