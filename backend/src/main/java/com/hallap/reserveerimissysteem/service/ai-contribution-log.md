# AI panuse lühilog

## Teenusekiht

- AI aitas tehniliselt vormistada teenusekihi algse struktuuri ja osa teostusest.
- Mina otsustasin siin põhireeglid: andmed tulevad ühest in-memory `layout.json` failist, broneeritud lauad genereeritakse deterministlikult ajaslot'i põhjal ning soovitusloogika peab kasutama sama saadavusloogikat.
- Mina määrasin ka soovituste skoorimise lähtereeglid, plaani (`INDOOR` / `TERRACE`) eristuse ning selle, et `PRIVATE` jääb tsooniks siseruumi sees.
- Hiljem otsustasin mina, et ligipääsetavus ei ole enam soovituse boonus, vaid hard constraint saadavuse loogikas; AI aitas selle muudatuse teenusekihti läbi viia.
- Lähedaste vabade kellaaegade vaate jaoks otsustasin mina lisada eraldi sloti-teenuse ja arvestada keskmise külastuse kestusega; AI aitas tehniliselt teostada 2-tunnise vaikimisi broneeringuakna ja sellele rajatud slotiotsingu.
- Hilisemaid parandusi tegin mina jooksvalt, kui selgusid paigutuse, soovitusjärjestuse või andmelepingu kitsaskohad.
