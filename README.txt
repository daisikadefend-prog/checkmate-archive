CHECKMATE ARCHIVE · MOBILE-FRIENDLY UPGRADE

CONTENTS
- index.html: the complete single-page archive, player articles, game replay, lessons, chessboard and settings dialogs.
- style.css: responsive dark/gold design, board themes and piece presentation.
- script.js: player directory, Wikipedia/Wikidata profile fetching, portrait loading, PGN replay, two-player mode and Stockfish worker.
- assets/qr-*.png: locally stored QR images already supplied with the project.
- assets/audio/*.ogg: five original instrumental background loops created for this site.

DEPLOY ON CLOUDFLARE
1. Extract this ZIP on your device.
2. Open https://dash.cloudflare.com/ and go to Workers & Pages.
3. Choose the existing Worker / Pages project or create a Pages Direct Upload project.
4. Upload the contents of the extracted folder. Keep index.html at the project root and preserve the assets folder.
5. Deploy, then open the site URL and test the player archive and chessboard.

PLAYER ARCHIVE AND PORTRAITS
- The start page contains a curated archive of more than 80 names, plus live Wikidata search and an optional broader directory fetch.
- Player cards attempt to retrieve a portrait from Wikipedia, then Wikimedia Commons. Portrait loading is lazy to reduce initial page load.
- Profile pages retrieve a Wikipedia biography and available Wikidata facts including birth/death date, gender, birthplace, nationality, parents, children and spouse/partner. Family details are only shown when publicly recorded in Wikidata.
- If no portrait is indexed or the image host cannot be reached, the card retains its initials fallback. This avoids inventing a person's identity or displaying an unrelated image.
- Portraits are hosted by Wikipedia/Wikimedia Commons. Open the portrait file/source link in each profile to check attribution and the individual image's reuse licence before republishing.
- Spanish and Russian are available for the navigation, learning headings, lesson titles and selected interface labels. Wikipedia biographies and Wikidata labels use those languages when available, with English fallback. Lesson explanations remain primarily in English.

LEARN AND PLAY
- Beginner lessons cover the goal of chess, starting setup, piece movement, checkmate, common tactics and opening principles.
- Two visual lesson images are embedded from Wikimedia Commons: “Chess Board with Initial Game Setup” by Tigerfarm1 (CC BY-SA 4.0) and “CheckmateProper.jpg” by Bubba73 (CC BY-SA 3.0). The lesson page links directly to each file’s description and licence page.
- The board supports legal moves, move history, undo, board flip, and play against a local Stockfish engine.
- Two-player mode allows both sides to be played on the same device. Switching modes starts a fresh game.
- Board colors, piece appearance and site background can be changed in Settings.

STOCKFISH
- Uses Stockfish.js 19.0.1 Lite single-threaded build from the jsDelivr npm CDN.
- The Lite build is selected intentionally for mobile use. The first visit downloads the engine JS and WASM files; the browser may cache them for later visits. An internet connection is required.
- The worker uses a same-origin Blob bootstrap that imports the engine script and supplies the WASM location, avoiding a direct cross-origin Worker constructor. A retry path is available through New game if the CDN or connection fails.
- Strength controls use UCI_LimitStrength / UCI_Elo where supported. Elo targets are approximate, not guaranteed ratings.
- Engine source/package: https://www.npmjs.com/package/stockfish and https://github.com/nmrugg/stockfish.js
- Stockfish is GPL-3.0. This project loads the public engine from the CDN rather than bundling a modified engine binary.

FAMOUS GAMES
- Replayable PGNs are included for Tal vs Botvinnik (1960), Carlsen vs Volen Dyulgerov / Witty Alien (30 September 2026), Donald Byrne vs Bobby Fischer (1956), the Immortal Game, the Opera Game and Kasparov vs Topalov (1999).
- The Witty Alien game is sourced from a published game report rather than an official tournament PGN archive. Game event and score descriptions should be checked against the linked source.
- Some historic game PGNs may differ in annotation or notation from other databases. Each game card links to its reference.

BACKGROUND MUSIC
- Five original instrumental loops are stored locally in assets/audio/. They are not commercial recordings. Music is off until the visitor presses Play, respecting browser autoplay restrictions.

DONATIONS / NETWORK SAFETY
- Existing wallet details and locally generated QR codes have been retained unchanged from the supplied project.
- The USDC network was not specified in the original project. Its QR contains only the address.
- Cryptocurrency transfers can be irreversible. Confirm the coin, chain and recipient address independently before any transfer.

TECHNICAL NOTES
- chess.js 0.10.3 is loaded from cdnjs for legal move generation. Internet access is required.
- Wikipedia and Wikidata APIs are queried at runtime, so portrait and biography availability depends on those services.
- No website project has been deployed by this ZIP build. Upload this archive to your Cloudflare project to publish the changes.
