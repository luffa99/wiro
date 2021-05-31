# scom-o

- Informazioni su installare nativescript: https://docs.nativescript.org/angular/start/quick-setup#full-setup
- Comandi utili:
  - ns build android // Produce app apk per android
  - ns run android // avvia l'app su android (via usb) e aggiorna in caso di modifiche in tempo reale
- Librerie utilizzate:
  - https://plugins.nativescript.rocks/plugin/@nativescript/template-drawer-navigation
  - https://market.nativescript.org/plugins/nativescript-nfc/
  - https://market.nativescript.org/plugins/nativescript-vibrate/
  
- Struttura dell'app
  - Ogni pagina ha 3 files: ```pagina.xml``` (descrive l'aspetto grafico), ```pagina.js``` (inizializza la pagina, caricando il viewModel), ```pagina-view-model.js``` (dove c'è effettivamente il codice della pagina)
  - Il file che contiene la logica per la registrazione dei punti ecc è ```home-run-view-model.js```
