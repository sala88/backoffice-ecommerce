Fasi di sviluppo:


1 - installato nextjs da 0
2 - studiato come si fa il be sopra nextjs (io arrivo da be e fe separati)
    NOTA: avrei potuto scegliere di usare Express (soluzione vecchia) o NestJs (soluzione enterprise un pò overhead per un progetto cosi)
3 - cercato un orm per nextjs -> prisma
4 - aggiunto zod per la validazione
5 - implementato il prima versione di auth login + auth con salvataggio su db e relativo frontend
    ho usato
    - tailwind, shadcn/ui, lucide-react
    - bcrypt (per la password), jose (per i JWT)
6 - il token è stato messo su local storage (si poteva metterlo HttpOnly Cookie che è piu sicuro)
7 - aggiunto minio per simulare s3 in locale e abozzato il primo giro di upload seguendo:
     a - presigned url
     b - upload file
     c - insert csv row to db

8 - sostituito swagger con zod-to-openapi
      TODO: la documentazione è generata da 2 fonti.. bigonerebbe aggiungere defineRoute come wrapper per avere una sola dichiarazione e nessuna duplicazione concettuale. Essendo un esercizio è rimasto TODO.

9 - validare il csv lato fe
    validare il csv lato be
10 - implementato le tabelle:
     productImport che traccia le importazioni
     productSnapshot che fografa ogno prototto cosi si riescve a ricostruire la storia del prodotto.



SVILUPPI FUTURI:
 - va assolutamente aggiunto un worker che gestisce l'inserimento dei prodotti se i prodotti sono tantissimi
 - costruire l'infrastruttura di rilascio.
 - non ho capito perchè non c'è un codice prodotto. io ho usato "name" come fosse il codice prodotto ma idealmente sarebbe meglio il codice prodotto.