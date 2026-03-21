# AI panuse lühilog

## layout.ts

- AI aitas koostada frontendi algsed tüübid saaliplaani, saadavuse ja soovituste jaoks.
- Mina kontrollisin nende vastavust backend DTO-dega ja tegin parandused, et tüübid oleksid kooskõlas tegeliku API-ga.
- Mina täpsustasin alguses ka `Preference` tüübi, et see vastaks backend enum-väärtustele.
- Hiljem laiendasin AI abil mudelitüüpe plaanide (`PlanCode`), saaliplaani feature'ite ja rikkama lauaandmestiku jaoks, et frontend vastaks päris backend lepingule.
- Soovituste UI lisamisel otsustasin mina eristada hard requirement'i (`accessibleRequired`) ja soovituse soft preference'eid, AI aitas nende tüüpide ja request-kujude tehnilise kohandamisega.
