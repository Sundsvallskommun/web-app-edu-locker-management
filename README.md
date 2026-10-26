# Locker management

## APIer som används

Dessa APIer används i projektet, applikationsanvändaren i WSO2 måste prenumerera på dessa. Systemet utgår ifrån /backend/api-config.ts där dessa står specificerade.

| API             | Version |
| --------------- | ------: |
| SimulatorServer |     2.0 |
| Education       |     2.0 |
| Citizen         |     3.0 |
| PupilLocker     |     1.0 |
| Messaging       |     7.3 |

**BEHÖVER BÅDE v 1 och 2 av education, då vissa endpoints fortfarande saknas i v.2**

## Utveckling

### Krav

- Node >= 20 LTS
- Yarn

### Steg för steg

1. Klona ner repot till en mapp "<web-app-projektnamn>" och skapa nytt git repo

```
npx tiged --mode=git git@github.com:Sundsvallskommun/web-app-starter.git <web-app-projektnamn>
cd <web-app-projektnamn>
git init
```

2. Installera dependencies för både `backend` och `frontend`

```
cd frontend
yarn install

cd backend
yarn install
```

3. Skapa .env-fil för `frontend`

```
cd frontend
cp .env-example .env
```

Redigera `.env` för behov, för utveckling bör exempelvärdet fungera.

4. Skapa .env-fil för `backend`

```
cd backend
cp .env.example.local .env.development.local
cp .env.example.local .env.test.local
```

redigera `.env.development.local` för behov. URLer, nycklar och cert behöver fyllas i korrekt.

- `CLIENT_KEY` och `CLIENT_SECRET` måste fyllas i för att APIerna ska fungera, du måste ha en applikation från WSO2-portalen som abonnerar på de microtjänster du anropar
- `SAML_ENTRY_SSO` behöver pekas till en SAML IDP
- `SAML_IDP_PUBLIC_CERT` ska stämma överens med IDPens cert
- `SAML_PRIVATE_KEY` och `SAML_PUBLIC_KEY` behöver bara fyllas i korrekt om man kör mot en riktig IDP

5. Synca datamodeller för api:er

   Se till att README och /backend/src/config/api-config.ts matchar och justera utefter de api:er som önskas användas.

   - För backend, i /backend kör `yarn generate:contracts` för att få ned de senaste datamodellerna för samtliga api:er
     -- Justera om så behövs utifrån de uppdaterade modellerna

   - För frontend, se till att backend är igång (`yarn dev`), i /frontend kör `yarn generate:contracts` för att synca backend med frontend
     -- Justera om så behövs utifrån de uppdaterade modellerna

### Session-hantering (Memory / File / Redis)

Backend använder `express-session` för sessionshantering. Session store väljs via miljövariabeln `SESSION_STORE`.

| Värde    | Beskrivning                          | Rekommenderad miljö   |
| -------- | ------------------------------------ | --------------------- |
| `memory` | In-memory store (default)            | Lokal utveckling      |
| `file`   | Filbaserad store (`./data/sessions`) | Lokal test / legacy   |
| `redis`  | Redis-baserad store                  | OpenShift / multi-pod |

I OpenShift används Redis för sessioner, vilket gör backend stateless så att flera poddar kan köras. I produktion med Redis delas även OAuth-token mot API-gatewayn mellan poddarna via Redis (`src/services/api-token-service/redis-api-token.service.ts`).

Följande miljövariabler sätts via Deployment / Helm / ArgoCD:

```
SESSION_STORE=redis
REDIS_HOST=<redis-hostname>
REDIS_PORT=6379
REDIS_PASSWORD=<secret>
```

Redis initieras endast när `SESSION_STORE=redis` (`src/utils/initRedis.ts`). Saknas `REDIS_HOST` när Redis är vald kraschar applikationen direkt vid start med:

```
Failed to start app: Error: SESSION_STORE=redis but REDIS_HOST is not set
```

Lokal utveckling kräver ingen Redis, samma kodbas används i alla miljöer.

### Språkstöd

För språkstöd används [next-i18next](https://github.com/i18next/next-i18next).

Placera dina språkfiler i `frontend/public/locales/<locale>/<namespace>.json`.

För att det ska fungera med **Next.js** och **SSR** måste du skicka med språkdatat till ServerSideProps.
Det gör du genom att lägga till följande till dina page-komponenter (behövs ej i subkomponenter).

```
export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, [<namespaces>])),
  },
});
```

För att lägga till ett ytterligare spåk, skapa en mapp med språkets namn, och lägg sedan till språket i `next-i18next.config.js`.

**Exempel för tyska:**
Skapa `frontend/public/locales/de/common.json`.
Ändra next-i18next.config.js:

```
module.exports = {
  i18n: {
    defaultLocale: 'sv',
    locales: ['sv', 'de'],
  },
 ...
};
```

Som hjälp i VSCode rekommenderas [i18n Ally](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally).
