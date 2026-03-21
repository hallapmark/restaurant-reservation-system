# AI panuse lühilog

## LayoutView.tsx

- AI aitas luua komponendi algse struktuuri ja MUI-põhise ülesehituse.
- Mina vaatasin loogika üle, lihtsustasin andmevoogu ja kohandasin käitumist vigade korral.
- Mina otsustasin, et saadavuse vea korral jääb saaliplaan ainult vaatamiseks, mitte ei kuvata kunstlikku fallback-saadavust.
- Mina kohandasin ka värvide semantikat ja otsustasin tõsta laua renderdamise eraldi komponendiks, et `LayoutView` jääks loetavam.

## FloorplanTableTile.tsx

- AI aitas eraldada laua renderdamise eraldi komponendiks.
- Mina kohandasin visuaalsed seisundid, tooltipid ja responsiivsema paigutuse.
- Mina otsustasin väiksematel ekraanidel sisu kompaktsemaks teha (nt Table 1->T1), AI aitas selle tehnilise teostusega.
- Mina sidusin komponendi olemasoleva saaliplaani loogika ja demovoo nõuetega.
