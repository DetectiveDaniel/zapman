# Bye!cycle

A self-contained canvas bicycle racing game. Open `index.html` in a modern browser or choose **Bye!cycle** in the Zapman picker.

Pick Seaside Sprint, City Switchbacks or Sunset Speedway. Race four computer-controlled bicycle riders, pass the course checkpoints in order, and complete three laps. The menu artwork is a jumble of cars; all racers are bicycles.

- Up arrow: pedal
- Down arrow: brake, then reverse
- Left / right arrows: steer
- A: switch overhead / behind-the-bike view at any time
- Space: use rechargeable boost while pedalling
- Esc: pause / resume
- R: restart the selected race

Touch buttons provide the same riding controls. The perspective button also switches views. Leaving the tab pauses the race. Best times are stored locally for each circuit when browser storage is available.

No dependencies, build step or network services. `game.js` contains track geometry, bicycle physics, opponents, checkpoints, and both renderers. `menu-cars.svg` is the shared menu artwork and picker preview.
