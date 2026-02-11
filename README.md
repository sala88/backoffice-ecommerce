Fasi di sviluppo:


1 - installato nextjs da 0
2 - studiato come si fa il be sopra nextjs (io arrivo da be e fe separati)
    NOTA: avrei potuto scegliere di usare Express (soluzione vecchia) o NestJs (soluzione enterprise un pò overhead per un progetto cosi)
3 - cercato un orm per nextjs -> prisma
4 - aggiunto zod per la validazione
5 - implementato il prima versione di auth login + auth con salvataggio su db e relativo frontend
    ho usato
    - tailwind
6 - il token è stato messo su local storage
7 - aggiunto minio per simulare s3 in locale e abozzato il primo giro di upload seguendo:
     a - presigned url
     b - upload file
     c - insert csv row to db

TODO:
     - validare il csv lato fe
     - validare il csv lato be

12 - sostituito swagger con zod-to-openapi