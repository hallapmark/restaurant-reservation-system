# UI state mapping (v1)

See dokument kirjeldab andmevoogu restorani laua broneerimise äpi v1 flow jaoks.

## Kokkulepitud API liides
- `GET /api/v1/layout`  
  Tagastab ainult saaliplaani geomeetria ja meta info.
- `POST /api/v1/availability`  
  Tagastab laua staatuse tabeli (`tableStatusById`) antud kuupäeva/kellaaja kombinatsiooni jaoks.
- `POST /api/v1/recommendations`  
  Tagastab järjestatud soovitused, sisaldab ka `topRecommendationId`.
- `POST /api/v1/reservations`  
  Tagastab broneeringu vaste, mis sisaldab `reservationId` ja `status`.
- `GET /api/v1/reservations/{id}`  
  Valikuliselt kasutatakse detaili järeltuleku ja võrdlustestide jaoks.

## V1 kohustuslikud väljad
- `date`
- `time`
- `partySize`
- `accessibleRequired`

## V1 valikulised väljad
- `zone`
- `preferences`

## Frontendi state-map

- `layout`:  
  Laetakse `GET /layout` vastusest.
  - `layout.zones`
  - `layout.tables`

- `tableStatusById`:  
  Põhineb `POST /availability` vastusel.
  - `AVAILABLE`
  - `RESERVED` = laud on antud `date + time` jaoks juba hõivatud (teise reserveeringu tõttu või süsteemi poolt eelnevalt kinni võetud). See on siis hard block. 
  - `UNAVAILABLE` = laud ei sobi praeguse päringukonfiguratsiooniga (`partySize`, optional `zone` või `accessibleRequired` järgi), mitte tingimata keelatud reserveerida.
  - Märkus: `availability` väljastab staatuse kõigi saaliplaani laua ID-de kohta.

- `recommendation` (top + põhjendused):  
  Põhineb `POST /recommendations` vastusel.
  - `topRecommendationId`
  - `recommendations[].tableId`
  - `recommendations[].score`
  - `recommendations[].reasons`

- `selectedTableId`:  
  Kohalik UI state, muutub kasutaja klikiga saaliplaanil.  
  Ei tule API-lt, välja arvatud kinnituse tulemus.
  - Sobib ainult laua puhul, mille state on `AVAILABLE` või `RECOMMENDED`.
  - Kui kasutaja klõpsab `RESERVED`/`UNAVAILABLE` lauale, state ei muutu.
  - Kui `availability` uuendub nii, et eelnevalt valitud laud muutub `RESERVED` või `UNAVAILABLE`-ks, siis `selectedTableId` peab tühjaks minema ja kasutajat tuleb teavitada konfliktist.

- Reservation result:  
  `POST /reservations` vastusest:
  - `reservationId`
  - `status`

## Render-prioriteet saaliplaanil (konflikti vältimine)
Kui mitu olekut kattuvad, renderitakse prioriteedis:
1. `RESERVED`
2. `SELECTED` (ainult kui vastava laua hetke staatus on `AVAILABLE` või `RECOMMENDED`)
3. `RECOMMENDED`
4. `UNAVAILABLE`
5. `AVAILABLE`

Selgitusi: 
- Kui soovitus (`RECOMMENDED`) langeb kokku kasutaja valikuga (`SELECTED`), kuvatakse `SELECTED`.
- RESERVED on hard constraint - ei saa ükski teine olek UI-s üle kirjutada. Kui sama laua kohta saabub korraga `RESERVED` ja `SELECTED` (nt päringu uuenduse tõttu), jõustub esmajärjekord: laual kuvatakse `RESERVED`, sest see on süsteemi poolt keelav state.
- UNAVAILABLE: seda üldjoontes ka ei saa mõni teine nendest state-idest üle kirjutada. Praegu eeldan lihtsuse huvides, et üldse ei saa. Võib-olla hiljem selgub mõni erand (nt. selectioni puhul võib mingi väikese tooni muutuse ikkagi teha, vbl koos mingi võbelemise vm hintiga mis annab märku, et seda ei saa praeguste parameetrite korral reserveerida)


## Märkmed
- `layout` peab olema **primary view** kogu v1 kogemusel.
- `availability` ja `recommendations` vastuseid tuleks uuendada sõltuvalt kuupäev+kellaaeg + seltskonna suurus filtritest.
- `accessibleRequired` on hard nõue, mis mõjutab `availability` tulemust.
- `preferences` mõjutavad ainult soovituse järjestust, mitte laudade baas-saadavust.
- `/recommendations` peaks olema saadav ka siis, kui ükski laud ei ole otseselt soovitatud – selle juhul `topRecommendationId` on `null` ja nimekiri tühi.
- Hoveri ja värvikood:
  - `RESERVED`: selgelt välja lülitatav punane olek; hover tekst „Broneeritud selle ajaks”.
  - `UNAVAILABLE`: madala kontrastiga hall/ebaselge olek; hover tekst „Ei sobi valitud `partySize`/`zone` jaoks”.
