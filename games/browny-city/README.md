# Browny City

Open `index.html`, or choose **Browny City** in the Zapman picker. Bob begins at home with £500. The layout and building prices follow the supplied drawing.

- Move with arrows or WASD. Touch movement buttons are also available.
- Near a building's door, press **0** or **Talk** for its YES/NO invitation, then walk around inside. Home opens directly without a prompt or fee.
- All nine buildings have furnished interiors with solid furniture. Walk to the indoor person/counter and press **0** to do the activity. Home has a reading spot instead.
- Walk through the bottom exit, press **0** near it, or choose **Go outside** to return to the same front door. Original town entry covers one completed activity per visit; closing an activity leaves Bob inside. Race Cars returns Bob to the garage.
- School £10: answer a question for a sticker. Arcade £5: catch ten stars in twenty seconds.
- Bank: collect £20, then wait thirty seconds of town time before the next allowance.
- Race Cars £10: Bye!cycle's three circuits, five cars, overhead/chase views (**A**) and boost (**Space**). The first finish per paid visit pays £25 for winning or £5 for any other place. Close the race to return to the same Bob and balance.
- Jobs £15: choose a building where Bob has spent money. Complete three tasks to get that building's unreimbursed expenses back once. Jobs entry fees themselves are tracked at the Jobs office and can be earned back there.
- Pizza Factory £15 and Sainsbury's £15: complete the activity to add pizza or groceries to the bag.
- Greenhouse Garden: plant three pots for £5 and flowers; another shift is available after twenty seconds of town time.
- Wait for **WALK** before crossing. Cars queue at red/amber lights, and WALK begins after a clearance interval. A moving car hitting Bob causes death; return home without losing your remaining cash or bag.
- **M / Town map** toggles an overview. **New game** asks before resetting the save to £500.
- Music starts after the first click, tap or key press and changes with the building or car race. Footsteps, doors, purchases, activity rewards, planting, arcade stars, crossing signals, nearby traffic and collisions have sound effects. **Sound: On/Off** mutes both music and effects and saves the choice on this device. Audio pauses when the tab is hidden and works offline using Web Audio.

Activities pause traffic and the town clock. While Bob walks inside, the town clock and outdoor traffic continue, but cars cannot hit him indoors. Cash, receipts, bag and cooldowns save to `zapman-browny-city-v1`; existing saves still work, and Bob starts back outside home on reload. The game still works without browser storage. Shared Zapman display settings apply to the city and the embedded race.

## Section Two and neighbours

Walk off **any edge** of the outdoor map to reach the other section. Walk off an edge again to return. Section Two follows the second drawing: Pets at Home above a loop road around Spocco Square, with the museum, shop and castle below. Both maps keep the same cash, bag and receipts. Loop-road cars stop for red/amber; wait for WALK before crossing. A moving car can still kill Bob. Go home returns him to Section One, including Educational mode recovery.

Twelve residents in each section wander, wait around and have random two-way conversations in speech bubbles. Press **0** near a neighbour to say hello. They are friendly and cannot hurt Bob. A chosen pet follows through both maps and inside buildings. Cash, new bag items, owned pets and the active companion save in the existing save format; older saves still load.

- **Pets at Home · £10 entry:** meet Pippin the dog, Clover the cat and Pudding the rabbit. Choose one to bring along, with no extra adoption charge. Change companions during the visit, or let one rest at home.
- **Spocco Square · £100 entry:** try all three sports during the same visit. Tennis uses arrows/WASD and Space to serve/swing; first to five points wins. Choose one to three named opponents for a running race, hold Right/D/W (or the on-screen RUN arrow) to run, and use Shift or Space bursts to sprint with limited stamina. Football offers **goalie**, **defender** and **striker**: move and press Space to save, tackle or kick. Goalies/defenders need five stops before three goals are conceded; strikers need three goals before five misses. Football has a 75-second match clock. Winners earn one bag medal, with no cash prize. All sports have touch controls, pause and a clubhouse return; hidden tabs pause them. Play again stays in the clubhouse. Educational mode asks questions before each new match.
- **Museum · £15 entry:** view six large exhibit previews, including Egyptian, Greek and Roman pottery, a medieval goblet, a Victorian clock and a wooden toy. Objects are labelled museum replicas/models and have short descriptions.
- **Castle · £10 entry:** visit the great hall, dungeon, dining room and top balcony. Each is a separate walkable room. Press 0 at Sir Rowan to switch rooms; the bottom door exits the castle. The balcony overlooks the rooftops: **What a view!**
- **Toy & Book Shop · £15 entry:** buy toys (£6–£8), books (£5–£7) and food (£2–£4). The listed item price is separate from entry. Items go in the bag, and entry plus purchases can be reimbursed once through the original Jobs office.

Section Two entry covers repeated browsing/sports within the same visit. Leaving and re-entering pays entry again. Exit, cancelled dialogs and match retries never duplicate purchases or pay cash prizes.

Run `node tests/browny-expansion.test.cjs` to check edge travel, both maps, building/room reachability, pets/saves, shopping/receipts, chatter, traffic and complete playable sports matches. `expansion.js` contains the new town rules; `sports-model.js` contains the independent match simulation.
