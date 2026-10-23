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
- Wait for **WALK** before crossing. Cars queue at red/amber lights, and WALK begins after a clearance interval. A moving car hitting Bob sends him straight to the free hospital in Section Three, keeping his cash, bag, watch and pets.
- **M / Town map** toggles a single island surrounded by sea, with connected roads, palms, a sandy shore, jetty and wooden section signs in the reference layout: Section Three on the left, Section Two in the middle and Section One on the right. All nineteen buildings/stalls appear with scenery and traffic, and Bob is shown as a person in his current section. **New game** asks before resetting the save to £500.
- Music starts after the first click, tap or key press and changes with the building or car race. Footsteps, doors, purchases, activity rewards, planting, arcade stars, crossing signals, nearby traffic and collisions have sound effects. **Sound: On/Off** mutes both music and effects and saves the choice on this device. Audio pauses when the tab is hidden and works offline using Web Audio.

Activities pause traffic and the town clock. While Bob walks inside, the town clock and outdoor traffic continue, but cars cannot hit him indoors. Cash, receipts, bag and cooldowns save to `zapman-browny-city-v1`; existing saves still work, and Bob starts back outside home on reload. The game still works without browser storage. Shared Zapman display settings apply to the city and the embedded race.

## Section Two and neighbours

Only left and right edges change sections. Left from Section One leads to Section Two; left again leads to Section Three. In Section Three, the exits are swapped: Spocco Square is on the left and Open Sea is on the right. In Section Two, right returns to Section One. The top and bottom edges stay in the current section. Section Two follows the second drawing: Pets at Home above a loop road around Spocco Square, with the museum, shop and castle below. All three maps keep the same cash, bag and receipts. Loop-road cars stop for red/amber; wait for WALK before crossing. A moving car sends Bob to hospital. Go home returns him to Section One, including Educational mode recovery.

Twelve residents in each section wander, wait around and have eighty different two-way conversations in speech bubbles, shuffled without repeating until the whole pool has been heard. Each section also has twenty-four different greetings to Bob, with their own non-repeating shuffled pool. Press **0** near a neighbour to say hello. They are friendly and cannot hurt Bob. A chosen pet follows through both maps and inside buildings. Cash, new bag items, owned pets and the active companion save in the existing save format; older saves still load.

- **Pets at Home · £10 entry:** meet Pippin the dog, Clover the cat and Pudding the rabbit. Choose one to bring along, with no extra adoption charge. Change companions during the visit, or let one rest at home.
- **Spocco Square · £100 entry:** try all three sports during the same visit. Tennis uses arrows/WASD and Space to serve/swing; first to five points wins. Choose one to three named opponents for a running race, hold Right/D/W (or the on-screen RUN arrow) to run, and use Shift or Space bursts to sprint with limited stamina. Football offers **goalie**, **defender** and **striker**: move and press Space to save, tackle or kick. Goalies/defenders need five stops before three goals are conceded; strikers need three goals before five misses. Football has a 75-second match clock. Winners earn one bag medal, with no cash prize. All sports have touch controls, pause and a clubhouse return; hidden tabs pause them. Play again stays in the clubhouse. Educational mode asks questions before each new match.
- **Museum · £15 entry:** view six large exhibit previews, including Egyptian, Greek and Roman pottery, a medieval goblet, a Victorian clock and a wooden toy. Objects are labelled museum replicas/models and have short descriptions.
- **Castle · £10 entry:** visit the great hall, dungeon, dining room and top balcony. Each is a separate walkable room. Press 0 at Sir Rowan to switch rooms; the bottom door exits the castle. The balcony overlooks the rooftops: **What a view!**
- **Toy & Book Shop · £15 entry:** buy toys (£6–£8), books (£5–£7) and food (£2–£4). The listed item price is separate from entry. Items go in the bag, and entry plus purchases can be reimbursed once through the original Jobs office.

Section Two entry covers repeated browsing/sports within the same visit. Leaving and re-entering pays entry again. Exit, cancelled dialogs and match retries never duplicate purchases or pay cash prizes.

Run `node tests/browny-expansion.test.cjs` to check edge travel, both maps, building/room reachability, pets/saves, shopping/receipts, chatter, traffic and complete playable sports matches. `expansion.js` contains the new town rules; `sports-model.js` contains the independent match simulation.

## Section Three · The coast

Section Three follows the third drawing: an L-shaped road on the left, the police station and JUMP TRADING above the watch shop, the hospital below, and a beach/stall/sea on the right. **M** shows all three sections together. The Spocco Square building and map use a rounded white Spocco S emblem on a teal plaque, redrawn from the latest supplied reference.

- **JUMP TRADING · £30 entry:** walk to Jamie's computer counter and press **0**. The in-game browser has a new-tab style screen and a “What to trade today?” search field. Submit any non-blank search up to 80 characters to earn **£50 game cash once per paid visit**. It works offline and does not send searches anywhere. Leaving and paying for another visit starts another shift.
- **Watch Shop · £15:** choose a **red, blue, green or yellow** watch. The watch is included in the visit price; switch colours during that visit without paying again. Bob wears it and the colour saves.
- **Beach Stall · free:** press **0** by Sunny's stall to put on or remove sunglasses. They show on Bob at the beach and in the sea, and are put away automatically in town. Your choice saves.
- Walk into the coastal water to swim more slowly. Walk off the right edge of Section Three to enter open sea; swim left off that area to return to the beach. Your pet stays with you.
- **Police Station · free:** Officer Jade welcomes Bob and explains road safety. **Hospital · free:** Nurse May treats Bob after any city traffic collision. He appears inside the hospital and can rest, talk or leave through its door; no money or belongings are lost.

`coast.js` adds the third section, travel/swimming, saved accessories, trade payments and hospital recovery; `coast-view.js` draws its coast, logo, stall and accessories. `node tests/browny-expansion.test.cjs` covers all nineteen entrances, swimming/travel, rewards, watches/saves and hospital recovery as well as the existing activities.

## Island and main menu

The game starts at a main menu with the supplied town screenshot as its background. Wooden sign buttons offer **Play / Continue as Bob**, **Island map**, and **Back to games**. The toolbar's **Main menu** button reopens it without resetting Bob. The menu pauses walking, people, traffic and activity timers; Continue or Escape resumes. The map choice is unavailable inside a building, so it cannot move Bob out of a room.

`island.js` owns left/right section travel and a shared road at world y=1000. The central loop, coastal L road, original main road and racing loop all join it. A bridge stays dry for Bob even where the connecting road crosses coastal water. Section Two signs point **left to the coast** and **right to the town centre**. Section Three signs point **left to Spocco Square** and **right to Open Sea**, matching its swapped exits. Top/bottom edges do not switch sections or enter the sea. All previous cash, pet and accessory saves still work. The floating Educational mode button is hidden during Browny City gameplay; the picker still provides its settings and the questions still work.
