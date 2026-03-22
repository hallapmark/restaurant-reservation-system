# Nutikas restorani reserveerimissüsteem

See repository sisaldab restoranikülastajale mõeldud veebirakendust, kus kasutaja saab:

- valida ala (`Saal` / `Terrass`)
- vaadata saaliplaani
- filtreerida tulemusi kuupäeva, kellaaja, seltskonna suuruse ja ligipääsetavuse järgi
- saada parima laua soovituse vastavalt eelistustele
- otsida lähedasi vabu kellaaegu
- kinnitada broneeringu valitud lauale

Rakendus on tehtud monorepona:

- `backend/` – Spring Boot
- `frontend/` – React + Vite + MUI

## Kuvatõmmis

![Rakenduse kuvatõmmis](./screenshot.png)

## Live demo

[https://reserveerimissysteem.web.app](https://reserveerimissysteem.web.app)

## Kuidas käivitada

### Eeldused

- Java 25
- Maven Wrapper (`./mvnw`) on repo sees olemas
- Node.js 20+ ja npm
- eraldi andmebaasi, Dockerit ega muid väliseid teenuseid vaja ei ole

### 1. Käivita backend

Repo juurkaustast:

```bash
cd backend
./mvnw spring-boot:run
```

Backend käivitub vaikimisi aadressil:

`http://localhost:8080`

Alternatiivina võib backendi avada IntelliJ IDEA-s ja käivitada `ReserveerimissysteemApplication`.

### 2. Käivita frontend

Fail [frontend/.env.development.local](frontend/.env.development.local) sisaldab lokaalse arenduse jaoks:

```env
VITE_BACKEND_URL=http://localhost:8080
```

Seejärel:

```bash
cd frontend
npm install
npm run dev
```

Frontend käivitub tavaliselt aadressil:

`http://localhost:5173`

## Mida lahendus v1-s teeb

- Floorplan-first kasutuskogemus
- `INDOOR` / `TERRACE` on kasutaja hard requirement
- `PRIVACY`, `WINDOW`, `NEAR_PLAY_AREA` on soft preferences
- `accessibleRequired` on hard requirement
- `PRIVATE` on modelleeritud siseruumi sees oleva eritsoonina
- juba hõivatud lauad genereeritakse deterministlikult ajaslot'i põhjal
- kasutaja loodud broneeringud hoitakse backendi mälus ja need mõjutavad kohe saadavust ning soovitusi

## Teadlikud lihtsustused ja eeldused

- Broneeringud püsivad ainult backendi töö ajal mälus; rakenduse restart nullib need.
- V1 booking UX on teadlikult lihtne:
  - kasutaja valib laua
  - sisestab nime
  - kinnitab broneeringu samal lehel
- Nearby time discovery töötab sama päeva sees ja kasutab 30-minutilisi samme.
- Demo loogikas arvestan vaikimisi umbes 2-tunnise külastuse kestusega.

## AI kasutamine

Selles projektis on kasutatud AI abi.

- AI aitas koodi scaffolding'u, DTO-de/API kihtide, osa komponentide ja refaktorite juures.
- Püüdsin hoida sisulised toote- ja UX-otsused enda käes.
- Projektitaseme kokkuvõte on failis [docs/ai-contribution-log.md](docs/ai-contribution-log.md).
- Täpsemad kaustapõhised logid on nii `frontend/src/...` kui ka `backend/src/...` all.

## Mis oli keerulisem

- Hard vs soft constraintside piiritlemine:
  - mis mõjutab saadavust
  - mis mõjutab ainult soovituse järjestust
- `INDOOR` / `TERRACE` ja `PRIVATE` vahelise mudeli semantika:
  - kas tegu on filtriga, eraldi plaaniga või alaga plaani sees
- Soovituse UX:
  - kas kuvada kõik soovitused või ainult üks parim
- Ajasoovituste ja lauasoovituste ühendamine nii, et floorplan jääks põhivaateks

## Teadaolevad piirangud / märkused

- Brauseri native `time` input võib mõnes OS/browser locale kombinatsioonis kuvada aega 12-tunnises formaadis (`7 PM`), kuigi rakenduse sisemine ja backendis kasutatav formaat on `HH:mm`.
- `GET /reservations/{id}` on backendis olemas, kuid eraldi reservation detail-vaadet frontendis v1-s ei ole.
- Zone dropdown eemaldati teadlikult, sest `INDOOR` / `TERRACE` töötab peamise ala-valikuna ning `PRIVATE` jääb privaatsuse ja paigutuse loogika osaks.
- Praegune v1 ei keela veel broneeringute tegemist minevikku jäävale kuupäeva/kellaaja kombinatsioonile; järgmise sammuna lisaksin sellele frontendi ja backendi valideerimise.
- Üldiselt on reserveerimissüsteem responsive, aga väga väikestel ekraanidel (nt. mobiil) on mõned parandamiskohad. Tekst "Mängunurk" on mobiilil poolikult näha, samuti mõne laua number. 

## Live deployment

- Frontend on hetkel üles pandud Firebase Hostingusse.
- Backend on hetkel üles pandud Renderisse.
- README põhiline käivitusjuhend jääb siiski lokaalse arenduse / hindamise jaoks.

## Tööks kulunud aeg

- Hinnanguline ajakulu: umbes 22 tundi.
