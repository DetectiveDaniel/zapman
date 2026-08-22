# Zapman

The complete static Zapman game collection, packaged as one repository for deployment to the S3 bucket behind `zapman.uk`.

Open `index.html` to use the game picker. Hide 'n' Seek runs on the root page; every other playable game lives under `games/<game-name>/`.

## Games

- 8-bit Alley
- Bubble Blast
- Cat Rescue
- Chis on the Loose
- Dungeon Explorers
- Flight Master
- Hide 'n' Seek
- Jump Jump
- Kiff-o-Kart
- Manhunt
- Math Game
- Math Jumper
- Minedaft
- Parkourz
- Protocol
- Shardbreakers: Echoes of the Fallen Realm
- Smooth Rooftop Jumper
- Speeding Planes
- Subway Surfers
- Super Detective 64
- Timmy's Trek
- TNT Parkour
- Turbo Lane

## Deploy

Upload the contents of this repository to the website root in S3. Keep the folder structure intact so the picker routes and the shared **Go back** button continue to work.

The `mythical-animals` and `solar-system` work folders are not included because they do not currently contain a playable `index.html`.
