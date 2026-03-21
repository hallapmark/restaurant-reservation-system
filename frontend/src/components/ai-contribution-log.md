# AI panuse lühilog

## LayoutView.tsx

- AI aitas luua komponendi algse struktuuri ja MUI-põhise ülesehituse.
- Mina vaatasin loogika üle, lihtsustasin andmevoogu ja kohandasin käitumist vigade korral.
- Mina otsustasin, et saadavuse vea korral jääb saaliplaan ainult vaatamiseks, mitte ei kuvata kunstlikku fallback-saadavust.
- Mina otsustasin kasutada plaani põhiseid tabe (`INDOOR` / `TERRACE`) ja hoida `PRIVATE`-t eritsoonina siseruumi sees.
- Hiljem otsustasin mina, et `INDOOR` / `TERRACE` on kasutaja jaoks peamine hard filter ning üldine tsooni-dropdown eemaldati, et UI oleks selgem.
- Mina otsustasin, et saaliplaanil tõstetakse esile ainult parim soovitus, mitte kogu soovituste nimekiri.
- Mina määrasin ka soovituste UI põhimõtte: ligipääsetavus on eraldi hard requirement, teised eelistused jäävad soft preference'iteks ning soovituse kohta kuvatakse eraldi lühikokkuvõte.
- Mina kohandasin ka värvide semantikat ja otsustasin tõsta laua renderdamise eraldi komponendiks, et `LayoutView` jääks loetavam.

## FloorplanTableTile.tsx

- AI aitas eraldada laua renderdamise eraldi komponendiks.
- Mina kohandasin visuaalsed seisundid, tooltipid ja responsiivsema paigutuse.
- Mina otsustasin väiksematel ekraanidel sisu kompaktsemaks teha (nt Table 1->T1), AI aitas selle tehnilise teostusega.
- Mina sidusin komponendi olemasoleva saaliplaani loogika ja demovoo nõuetega.

## FloorplanFeatureTile.tsx

- AI aitas luua eraldi komponendi saaliplaani taustaelementide jaoks.
- Mina otsustasin, et `PRIVATE_ROOM`, `PLAY_AREA` ja `WINDOW_BAND` kuvatakse lauadest eraldi visuaalsete vihjetena, mitte hardcode'itud kujunduse osana.
- Hilisemad paigutuse ja rõhuasetuse muudatused tegin mina jooksvalt demot üle vaadates.

## RecommendationSummaryPanel.tsx

- AI aitas vormistada soovituse lühikokkuvõtte jaoks eraldi komponendi.
- Mina otsustasin, et v1-s kuvatakse ainult üks parim soovitus koos põhjendustega, mitte pikk järjestatud nimekiri alternatiividest.
