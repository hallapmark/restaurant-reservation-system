# AI panuse ja otsuste kokkuvõte

See dokument võtab lühidalt kokku, kuidas kasutasin projektis AI abi, ning millised olulisemad toote-, UX- ja arhitektuuriotsused tegin ise.

## Üldine kokkuvõte

- Kasutasin AI abi üsna palju koodi scaffolding'u, tehniliste ümbertegemiste, DTO-de/API kihtide ja osa UI/teenusekihi teostuse juures.
- Samas püüdsin hoida sisulised otsused enda käes: mida rakendus peab v1-s tegema, millised kompromissid on mõistlikud ja kuidas demo peaks kasutajale käituma.
- Täpsemad kaustapõhised AI panuse logid on eraldi failidena nii `frontend/src/...` kui ka `backend/src/...` all.

## Olulisemad otsused, mille tegin mina

- **Hard vs soft constraints**
  Valisin, et `date`, `time`, `partySize`, `plan` (`INDOOR` / `TERRACE`) ja `accessibleRequired` on hard constraints.  
  `PRIVACY`, `WINDOW` ja `NEAR_PLAY_AREA` jäid soft preference'iteks, mis mõjutavad soovituse järjestust, mitte baas-saadavust.

- **Indoor / Terrace tööloogika**
  Otsustasin, et `INDOOR` / `TERRACE` on kasutaja jaoks peamine ala-valik, mitte lihtsalt visuaalne tabi-komponent.  
  Soovitus arvutatakse aktiivse ala sees, ning floorplan tabid peegeldavad sama valikut.

- **Private room modelleerimine**
  Otsustasin, et `PRIVATE` ei ole eraldi kolmas peavaade, vaid siseruumi sees olev eritsoon.  
  See kuvatakse floorplanil eraldi alana, kuid jääb `INDOOR` plaani osaks.

- **Saadavuse vea käitumine**
  Otsustasin, et kui saadavuse päring ebaõnnestub, siis ei kuvata kunstlikku fallback-saadavust.  
  Selle asemel jääb saaliplaan ainult vaatamiseks, et kasutajale ei näidataks eksitavalt "vabu" laudu, mille tegelik saadavus on teadmata.

- **Recommendation highlight loogika**
  Otsustasin, et saaliplaanil tõstetakse esile ainult üks `topRecommendationId`, mitte kogu soovituste nimekiri.  
  See hoiab floorplani loetavamana ja väldib olukorda, kus "soovitatud" olek muutub liiga laialivalguvaks.

- **Booking UX tase v1-s**
  Otsustasin hoida broneerimisvoo lihtsa ja demo-keskse:
  - kasutaja valib laua floorplanilt
  - sisestab ainult nime
  - kinnitab broneeringu samal lehel inline-paneelis
  - eraldi reservation detail-view'd või keerukamat checkout-laadset voogu v1-s ei lisatud

- **Reservation persistence**
  Otsustasin, et broneeringu "päris" tõde elab backendi in-memory runtime store'is, mitte `localStorage`-s.  
  Nii mõjutavad loodud broneeringud kohe saadavust ja soovitusi sama rakenduse töö jooksul, kuid andmed ei pea üle restartide püsima.

- **Time discovery helper view**
  Otsustasin, et vabade aegade leidmine ei ole eraldi route ega uus peavaade, vaid secondary helper samal lehel.  
  See jääb floorplan-first kogemust toetavaks lisafunktsiooniks.

- **Keskmise külastuse kestuse eeldus**
  Otsustasin kasutada demo vaikimisi eeldusena umbes 2-tunnist broneeringuakent, et lauad ei vabaneks ebareaalselt kiiresti ning availability/slots loogika oleks praktilisem.

## Kus AI aitas kõige rohkem

- olemasoleva idee tehniline vormistamine React/MUI komponentideks
- Spring Boot DTO-de, teenuseklasside ja controlleri struktuuri kiirem ülesehitus
- korduvate request/response tüüpide joondamine frontend/backendi vahel
- refaktorid, kus sama loogika tuli viia eraldi komponentidesse või teenusekihti
- testide algne karkass ja osa edge-case kontrollidest

## Minu roll nende AI-põhiste osade juures

- määrasin, milliseid funktsioone v1-s üldse teha
- valisin, millal AI pakutud lahendus ei olnud semantiliselt piisavalt täpne
- parandasin jooksvalt UX-i ja domeeniloogika valikuid
- kontrollisin frontend/backendi lepingute vastavust
- otsustasin, millal midagi jätta teadlikult lihtsaks, et demo tervik saaks valmis
