# AI vs My contribution log

# API Dokumentatsioon genereeritud AI abil

## AI pakkus
- API struktuuri üldraamistik koos v1 endpointide komplektiga:
  - `GET /api/v1/layout`
  - `POST /api/v1/availability`
  - `POST /api/v1/recommendations`
  - `POST /api/v1/reservations`
  - `GET /api/v1/reservations/{id}`
- Enumid (`Zone`, `TableStatus`, `Preference`) ja üldine andmemudel (layout/availability/recommendation/reservation).
- Front-endi state mapping: üks allikas layoutile, availability staatuse jaoks, recommendation top + reasons/score jaoks, local selection state.
- Nõuetele vastav dokumentatsiooni- ja näidetudokumendi struktuur.
- Arutlesime rendervoolu prioriteedi variantidega.

## Mina otsustasin
- V1-s hoida kohustuslikud sisendid `date`, `time`, `partySize`.
- V1-s mitte lisada veel `durationMinutes`, `flexibleTime`, drag-drop või väliseid integratsioone; need v2/v3-sse.
- Säilitada floorplan-first lähenemine kogu v1 flow-s.
- Prioritiseerida ärireeglid järjekorras: sobivus > eelistused > tsoon.
- Saaliplaani render-prioriteet (`RESERVED > SELECTED > RECOMMENDED > AVAILABLE/UNAVAILABLE`) konfliktide vältimiseks.

## Mina tegin
- Tegin lõpliku otsuse v1-sisendi kohustuslikkusest, ulatusest ja renderimise prioriteedist.
- Otsustasin hoida floorplan-first flow ja hoida v2/v3 funktsioonid eraldi etapina.
- Fikseerisin hetkel ainult nõuete kokkuleppimise ja liideste kirjaliku osa (API + näited + state mapping).
- Kontrollisin kõiki v1 endpoint’e OpenAPI (Swagger) Editori preview kaudu ning kinnitasin nende kooskõla soovitud flow’ga.
- Koodilist backend või UI implementatsiooni ei ole veel teostatud.
