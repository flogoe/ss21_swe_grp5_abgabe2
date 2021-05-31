# Copyright (C) 2021 - present Juergen Zimmermann
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

# ==============================================================================
#   B u i l d   S t a g e   m i t   T y p e S c r i p t
#
#   Node mit Debian als Basis einschl. GNU C/C++
# ==============================================================================

FROM node:16.2.0-buster AS builder

# Arbeitsverzeichnis setzen und implizit erstellen
WORKDIR /webapp

# package.json, package-lock.json und .npmrc in das Arbeitsverzeichnis kopieren
COPY package.json package-lock.json .npmrc tsconfig*.json angular.json ngsw-config.json ./
COPY src ./src

# npm, dependencies (NICHT: devDependencies) und TypeScript fuer die Uebersetzung installieren
ENV NPM_VERSION 7.15.0
RUN npm i -g npm@$NPM_VERSION && \
    npm i --prod --no-audit --no-fund --force && \
    npm i -D typescript @angular-devkit/build-angular@12.1.0-next.3 @angular/cli@12.1.0-next.3 @angular/compiler-cli@12.1.0-next.3 @angular/language-service@12.1.0-next.3 --force && \
    npm exec ng build --configuration=development

# ==============================================================================
#   R u n   S t a g e
#
#   nginx als Basis (mit ash)
#   eigener, uebersetzter JS- bzw. Angular-Code
# ==============================================================================
FROM nginx:1.21.0-alpine

COPY config/nginx.conf /etc/nginx/

WORKDIR /usr/share/nginx

# Default index.html entfernen
RUN rm -f html/*.html
COPY --from=builder /webapp/dist/acme ./html
COPY config/key.pem config/certificate.cer ./

# EXPOSE 80 443
EXPOSE 80

# https://medium.com/@bhargavbachina/how-to-serve-angular-application-with-nginx-and-docker-3af45be5b854
ENTRYPOINT ["nginx", "-g", "daemon off;"]
