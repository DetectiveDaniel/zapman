# Zapman

The complete static Zapman game collection, packaged as one repository for deployment to the S3 bucket behind `zapman.uk`.

Open `index.html` to use the game picker. Hide 'n' Seek runs on the root page; every other playable game lives under `games/<game-name>/`.

Every game has the same yellow **GO BACK** button in the top-left corner. It preserves display settings and Mobile Mode when returning to the picker, including from nested Cat Rescue versions. In Browny City's embedded car race, it returns to the garage.

## Games

- Browny City
- Bubble Blast
- Bye!cycle
- Cat Rescue
- Chis on the Loose
- Dungeon Explorers
- Fighters!
- Flight Master
- Forest Bear Runner
- Hide 'n' Seek
- Imaginecraft
- Jump Jump
- Kiff-o-Kart
- Manhunt
- Math Game
- Math Jumper
- Minedaft
- Parkourz
- Protocol
- Shardbreakers: Echoes of the Fallen Realm
- Silly Billies
- Snake Clash
- Smooth Rooftop Jumper
- Speeding Planes
- Subway Surfers
- Super Detective 64
- Super Shuriken
- Timmy's Trek
- TNT Parkour
- Turbo Lane

## Display settings

All nine Browny City buildings now have walkable furnished interiors, including Bob's home. Press **0** near a door to enter, then at the indoor counter/person to do the activity. Leave through the bottom exit or **Go outside**; paid entry covers one completed activity per visit, and car racing returns Bob to the garage.

Browny City has original looping music for the town, interiors and race, plus gameplay sound effects. Audio begins after your first interaction. **Sound: On/Off** mutes everything and remembers the choice; hidden tabs are silent.

Browny City follows the supplied town map: Bob starts at home with £500, talks using **0**, visits buildings through YES/NO prompts, shops, learns, plays an arcade game and plants flowers. The bank gives £20 with a 30-second town-time cooldown; the greenhouse pays £5 after planting, with a 20-second cooldown. Paid visits are tracked as receipts. A £15 Jobs visit lets Bob complete a shift at a chosen building to recover its unreimbursed spending once (including the Jobs office's own receipts). Cars stop at traffic lights; being hit ends Bob's outing, with a return-home button. Cash, bag and receipts save locally. Race Cars costs £10 and embeds the Bye!cycle engine in car mode, with both perspectives and all three tracks; the first finish per visit pays £25 for winning or £5 otherwise. **M** switches between the town map and following Bob.

Imaginecraft (at the existing `games/8-bit-alley/` address) contains six imagined game choices. Press **Play** to hear an original looping soundtrack matching the selected world. **Music: On/Off** controls sound; picking another game or leaving the page stops the old track. The music is generated locally without downloads and pauses while the tab is hidden.

The picker lists all games alphabetically. Use **Settings** beside the search bar to choose one of the neon colours, enlarge text, or enable smooth Lexie lettering based on the supplied chart.

Use the profile button in the top bar to set your name and choose one of the supplied avatars, or draw your own with a mouse or touch. The drawing tools include colour, brush size, fill, undo and clear. Choose **Fill**, select a colour, then tap an area to colour it in; choose **Draw** to return to the brush. **Save profile** keeps the name and avatar on this device; closing the editor without saving leaves the existing profile in place.

- **Colour blind theme:** renders the picker and every game in black and white.
- **Declutter:** removes picker artwork and gameplay previews and changes the heading to **Games**.
- **Plain Background:** changes the picker background to white.
- **Animated countdown:** shows a three-second timer before opening a game. Turn it off to use the loading spinner.

Settings persist in browser storage and travel in navigation URLs, including between Cat Rescue versions. Mobile Mode and VIP remain available in the top bar.

## Deploy

Upload the contents of this repository to the website root in S3. Keep the folder structure intact so the picker routes and the shared **Go back** button continue to work.

The `mythical-animals` and `solar-system` work folders are not included because they do not currently contain a playable `index.html`.

## Hide 'n' Seek Multiplayer

Use **MULTIPLAYER** to type how many players are joining, up to 30. Click a player card to type that player's name and choose their shirt color.

During multiplayer, press **F3** to switch which player is playable. Unplayable players follow and cannot be hurt.
