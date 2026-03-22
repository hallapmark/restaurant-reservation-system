# AI panuse lühilog

## DTOd

- AI aitas koostada backendi esialgsed DTOd.
- Mina kontrollisin nende vastavust frontendiga ja täiendasin lepingut edasi päris demo vajaduste järgi.
- Hiljem lisasin AI abil ka plaani (`PlanCode`) ja saaliplaani feature'ite tüübid ning laiendasin `LayoutResponse` struktuuri, et see kataks plaanid, feature'id ja laua omadused.
- Mina otsustasin soovituste puhul lahutada ligipääsetavuse eraldi hard requirement'iks ja hoida ülejäänud valikud recommendation-specific preference'itena; AI aitas DTO-de tehnilise ümbervormistamisega.
- Time-discovery lisamisel laiendasin AI abil ka DTOsid `AvailabilitySlotsRequest` / `AvailabilitySlotsResponse` kujude jaoks.
- Broneeringu pärisvoo lisamisel otsustasin mina, et `customerName` on v1-s kohustuslik väli ning veavastused tagastatakse ühtses kujus; AI aitas DTO-de tehnilise täiendamisega.
