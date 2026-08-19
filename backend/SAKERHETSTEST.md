# Manuell testguide - autentisering och behörighet

Körs mot testmiljö efter deploy. De automatiska testerna (`yarn test`) täcker
rutttabellen och behörighetslogiken, men de kör mot mockad nedströmstrafik. Den här
guiden verifierar samma sak i skarp miljö, plus de flöden som bara går att se med en
riktig SAML-session.

Två delar: **angreppsfall** ska nekas, **regressionsfall** ska fortfarande fungera.
Båda måste gå igenom. Ett grönt angreppsfall med ett trasigt regressionsfall betyder
bara att applikationen slutat fungera.

## Förberedelser

Du behöver:

- Två konton med olika skolenheter. Kalla dem **A** (har skola `SKOLA-A`) och
  **B** (har skola `SKOLA-B`, inte `SKOLA-A`).
- En elev vid `SKOLA-B` - notera dess `personId`.
- `BASE` = t.ex. `https://<testmiljö>/api`

Hämta sessionscookie genom att logga in i frontend som A och kopiera cookien
`connect.sid` från webbläsarens devtools. `$COOKIE` nedan är den.

```bash
BASE=https://<testmiljö>/api
COOKIE='connect.sid=<klistra in>'
```

---

## 1. Ingen ingång utan inloggning

| # | Anrop | Förväntat |
|---|---|---|
| 1.1 | `curl -i $BASE/me` | `401` |
| 1.2 | `curl -i $BASE/schools` | `401` |
| 1.3 | `curl -i $BASE/lockers/SKOLA-A` | `401` |
| 1.4 | `curl -i -X POST $BASE/notice/SKOLA-A -H 'content-type: application/json' -d '{}'` | `401` |
| 1.5 | `curl -i -X DELETE $BASE/lockers/SKOLA-A/<lockerId>` | `401` |

**Viktigt: svaret ska vara 401, inte 403 och inte 400.** Får du 403 eller 400 körs
någon annan middleware före autentiseringen - det var precis felet som fanns här
innan. `authMiddleware` ligger nu på controllernivå, och routing-controllers kör
klassnivåns middleware före actionens, så ordningen är strukturellt given.

| # | Anrop | Förväntat |
|---|---|---|
| 1.6 | `curl -i $BASE/` | `200 OK` |
| 1.7 | `curl -i $BASE/health/up` | `200` |

Bara dessa två ska svara utan session. Ser du fler: jämför med loggraden
`Auth audit: N routes - ...` vid uppstart.

---

## 2. Sessionen räcker inte - fel skola ska nekas

Med **A**:s cookie, mot **B**:s skola:

| # | Anrop | Förväntat |
|---|---|---|
| 2.1 | `curl -i $BASE/lockers/SKOLA-B -H "cookie: $COOKIE"` | `403` |
| 2.2 | `curl -i $BASE/pupils/SKOLA-B -H "cookie: $COOKIE"` | `403` |
| 2.3 | `curl -i $BASE/codelocks/SKOLA-B -H "cookie: $COOKIE"` | `403` |
| 2.4 | `curl -i -X DELETE $BASE/lockers/SKOLA-B/<lockerId> -H "cookie: $COOKIE"` | `403` |

Ingen av dem får returnera data, och inte heller `404` - ett annat svar för "finns
inte" än för "inte din" gör endpointen till en sökfunktion för vilka id:n som finns.

---

## 3. Mottagaradress går inte att styra från klienten

Det här är den allvarligaste punkten. Utskicken innehåller skåpets placering **och
skåpets aktiva kod**, och avsändaren är en kommunadress.

### 3.1 Elev från annan skola som mottagare

Med **A**:s cookie, mot A:s egen skola, men med `pupilId` för en elev på `SKOLA-B`:

```bash
curl -i -X POST "$BASE/notice/SKOLA-A" \
  -H "cookie: $COOKIE" -H 'content-type: application/json' \
  -d '{"pupilId":"<personId för elev på SKOLA-B>","email":"angripare@example.com","message":"test"}'
```

Förväntat: **`403 MISSING_PERMISSIONS`**. Inget mail skickas.

### 3.2 Egen elev, men påhittad adress

Med `pupilId` för en riktig elev på `SKOLA-A`, men `email` satt till en adress som
inte är elevens:

```bash
curl -i -X POST "$BASE/notice/SKOLA-A" \
  -H "cookie: $COOKIE" -H 'content-type: application/json' \
  -d '{"pupilId":"<personId för elev på SKOLA-A>","email":"angripare@example.com","message":"test"}'
```

Förväntat: **`204`** - anropet går igenom, men mailet går till elevens riktiga adress
ur elevregistret. `email` i bodyn ignoreras.

**Kontrollera i mottagarlådan** att `angripare@example.com` inte fått något. Det är
den enda kontrollen som faktiskt bevisar saken. I test- och utvecklingsmiljö går all
post till `TEST_EMAIL`, så kör det här i en miljö där du kan se den faktiska
mottagaren, eller verifiera mot loggen.

### 3.3 Tilldelning med elev från annan skola

```bash
curl -i -X PATCH "$BASE/lockers/assign/SKOLA-A?notice=true" \
  -H "cookie: $COOKIE" -H 'content-type: application/json' \
  -d '{"data":[{"lockerId":"<skåp på SKOLA-A>","personId":"<elev på SKOLA-B>","email":"angripare@example.com"}]}'
```

Förväntat: **`403`**, och **skåpet ska vara otilldelat efteråt** - kontrollen görs
före tilldelningen, inte efter. Verifiera med `GET $BASE/lockers/SKOLA-A/<lockerId>`.

---

## 4. Cookie-härdning

```bash
curl -i "$BASE/" | grep -i set-cookie
```

Kontrollera att cookien:

- har `HttpOnly`
- har `Secure` (i produktion och testmiljö bakom TLS)
- har `SameSite=Lax`
- **inte** har `Max-Age` eller `Expires` - den ska dö med webbläsaren

Saknas `Secure` bakom TLS, eller sätts ingen cookie alls: ingressen skickar
troligen inte `X-Forwarded-Proto`. `app.set('trust proxy', 1)` är satt, men utan
headern ser express-session anslutningen som osäker och slutar skicka cookien helt.
Åtgärden är att fixa ingressen — `secure` går medvetet inte att stänga av via env.

---

## 5. Spårbarhet

Efter att ha kört stegen ovan, kontrollera i loggen att:

- varje nekande finns som `Ownership denied: pupil '<maskerat>' is not within scope '<skolId>'`
- personnummer och person-id inte står i klartext i loggen
- uppstartsraden `Auth audit: 19 routes - 17 protected, 2 public, 0 unprotected` stämmer
- de två publika rutterna loggas med sin motivering
- inga `Auth audit: ...` på warn- eller errornivå utöver de två publika rutterna

Kontrollera i WSO2/API-loggen att anropen bär `loginName` med rätt användarnamn, och
inte "unknown". Alla anrop nedströms går på samma maskinkonto, så `loginName` är det
enda som kopplar ett anrop till en person i efterhand.

---

## 6. Regressionsfall - det här ska fortfarande fungera

Kör som **A** mot `SKOLA-A`, via frontend, inte curl:

- [ ] Logga in med SAML, hamna på rätt sida
- [ ] Skollistan visar A:s skolor
- [ ] Skåplistan laddar, filtrering och paginering fungerar
- [ ] Elevlistan laddar, sökning fungerar
- [ ] Skapa skåp
- [ ] Redigera skåp (namn, byggnad, plan, kommentar)
- [ ] Tilldela elev ett skåp **med avisering ikryssad** - eleven får mail
- [ ] Säg upp ett skåp **med avisering** - eleven får mail
- [ ] Ändra status på flera skåp samtidigt
- [ ] Skapa och redigera kodlås, med avisering - eleven får mail
- [ ] Skicka avisering från elevlistan, både med och utan valda skåp
- [ ] Ta bort skåp
- [ ] Logga ut, och kontrollera att skåplistan därefter ger 401

Aviseringarna är det som ändrats mest - mottagaren hämtas nu ur elevregistret i
stället för ur anropet. Om ett utskick uteblir och svaret säger `Email missing`
saknar eleven adress i registret; det är rätt beteende, men värt att notera om det
händer ofta.

---

## Om något går fel

| Symptom | Trolig orsak |
|---|---|
| 403 där du väntar dig 200 | Kontot saknar skolenheten i SAML-assertion. Kontrollera `GET /me`. |
| 401 direkt efter inloggning | `Secure`-cookie utan `X-Forwarded-Proto` från ingressen. |
| `MISSING_PERMISSIONS` vid avisering till egen elev | Eleven ligger inte i `pupilslocker` för skolan. |
| Avisering svarar `Email missing` | Eleven saknar adress i elevregistret. |
