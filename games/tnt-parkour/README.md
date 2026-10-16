# TNT Parkour

A hand-drawn style parkour game based on the sketch.

## Play

Open `index.html` in a browser.

## Controls

- Move: `A` / `D` or arrow keys
- Jump: `W`, up arrow, or space
- Punch: `F`
- Fire gun: `J` or click
- Restart after losing: `R`

## Rules

- Spikes take away one heart.
- Knife enemies die after 10 punches and kill the player after 20 hits.
- Black-shirt bombers throw a bomb every five seconds and die after 13 punches.
- One bomb kills the player.
- TNT asks before lighting, damages platforms in a two-block range, and instantly defeats anything in that range.
- Warning signs drop stones slowly.
- The gun is picked up by walking into it and fires instantly.
- Tilting platforms near the finish move around.
- Reaching the final finish launches fireworks and shows the victory message.
- Reaching the first finish opens Level 2, a dungeon with evil doctors.
- Evil doctors fire death spray that infects and kills the player.
- The second finish opens Level 3: Shark Bay, with permanent wooden resting docks and metal platforms based on the supplied silver block reference.
- Metal platforms are visible and solid for exactly three seconds, then completely disappear and stop supporting the player for three seconds. The HUD counts down to the next switch; amber lights warn shortly before disappearing.
- Pixel sharks repeatedly leap out of the water, sink, wait below the surface, and repeat the same path in the opposite direction. Their paths are independent of the player. Touching a shark takes one heart.
- Water is dangerous in Level 3. Reach its final dock and finish flag to win all three levels. **Skip Level** advances 1 → 2 → 3 before awarding victory.
- The Level 3 hazard clock pauses for dialogs, hidden tabs, game over and victory; restarting resets all platforms and shark paths.
- Level 3 has no introductory sign. Three knife enemies guard wooden docks and stay within their dock edges; use F to punch them or the gun carried from earlier levels. Two TNT crates use the same light/skip prompt and blast rules as the earlier levels, including destroying nearby platforms.
