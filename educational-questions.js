/* Original practice questions, grouped by the selected school year. No network needed. */
(() => {
  "use strict";
  const subjects = ["Mathematics", "English", "Science", "History"];
  // Each row contains the question, correct answer, then three distractors.
  const banks = {
    English: [
      [["Which word names an animal?", "cat", "run", "blue", "the"], ["Which word rhymes with sun?", "fun", "cat", "dog", "bed"], ["What starts a sentence?", "A capital letter", "A comma", "A small letter", "A question mark"]],
      [["Which word is a verb?", "jump", "chair", "green", "table"], ["Which mark ends a question?", "?", ".", ",", "!"], ["What is the plural of child?", "children", "childs", "childes", "childrens"]],
      [["Which word is an adjective?", "sparkling", "quickly", "swim", "under"], ["Which word means the opposite of ancient?", "modern", "old", "historic", "early"], ["Which sentence uses an apostrophe correctly?", "The cat's bowl is full.", "The cats bowl's is full.", "The cat bowl is full's.", "The cat's bowl's is full's."]],
      [["Which word is an adverb?", "gently", "gentle", "gentleness", "gentleman"], ["Which sentence contains a simile?", "Her smile was like sunshine.", "Her smile was sunshine.", "She smiled.", "She did not smile."], ["Which word is a conjunction?", "because", "mountain", "purple", "ran"]],
      [["Which sentence is in the passive voice?", "The cake was eaten by Sam.", "Sam ate the cake.", "Sam eats cake.", "Sam will eat cake."], ["What does the prefix re- usually mean?", "Again", "Before", "Against", "Without"], ["Which word is a relative pronoun?", "which", "quickly", "although", "very"]],
      [["Which sentence uses the subjunctive form?", "If I were you, I would wait.", "I was waiting yesterday.", "You are waiting.", "They will wait."], ["Which punctuation can separate two closely linked main clauses?", "A semicolon", "An apostrophe", "A hyphen", "A question mark"], ["What is an antonym of reluctant?", "eager", "unwilling", "hesitant", "doubtful"]],
      [["What is a metaphor?", "A direct comparison without like or as", "A question with no answer", "A repeated vowel sound", "A factual list"], ["Which is personification?", "The wind whispered.", "The wind was cold.", "A strong wind blew.", "Wind moves air."], ["What is the effect of first-person narration?", "It presents the narrator's own perspective.", "It always reveals every character's thoughts.", "It removes the narrator.", "It makes every statement a fact."]],
      [["What is alliteration?", "Repeated initial consonant sounds", "Repeated final words only", "An exaggerated statement", "A contrast of ideas"], ["What is an oxymoron?", "Two contradictory terms placed together", "A very long sentence", "A direct comparison", "An unfinished quotation"], ["What is dramatic irony?", "The audience knows something a character does not.", "All characters know the ending.", "The setting changes suddenly.", "The author explains every joke."]],
      [["What is an unreliable narrator?", "A narrator whose account may be misleading", "A narrator who uses past tense", "Any third-person narrator", "An author who writes fiction"], ["What is enjambment?", "A sentence continuing beyond a line break", "A pause at the end of every line", "Two words with the same meaning", "A repeated chorus"], ["What does juxtaposition do?", "Places things together to highlight comparison or contrast", "Removes all descriptive language", "Makes every sentence rhyme", "Always gives a happy ending"]],
      [["What is a caesura?", "A pause within a line of poetry", "A poem with fourteen lines", "A repeated initial sound", "A rhyme at a line ending"], ["What is an extended metaphor?", "A comparison developed over several lines or sentences", "Any comparison using like", "A single adverb", "A list of unrelated facts"], ["What is anaphora?", "Repetition at the beginnings of successive clauses", "Repetition of a final sound", "A contrast between opposites", "A deliberately misspelt word"]],
      [["What is a semantic field?", "A group of words linked by meaning", "Words with identical spelling", "The number of lines in a poem", "A rule about apostrophes"], ["What is a volta in a sonnet?", "A turn in thought or argument", "The final rhyming word", "An extra syllable in every line", "The author's signature"], ["What is a counterargument?", "An argument opposing a proposed position", "An unrelated example", "A repeated conclusion", "A statement without a viewpoint"]],
      [["What is a heterodiegetic narrator?", "A narrator who is not a character in the story", "A narrator who addresses themselves", "A narrator who is always unreliable", "A narrator who only uses dialogue"], ["What is free indirect discourse?", "Third-person narration blending with a character's thoughts or speech", "A play without a narrator", "A poem without any rhythm", "A quotation inside quotation marks"], ["What is metonymy?", "Referring to something by a closely associated name", "Exaggerating for emphasis", "Repeating vowel sounds", "Comparing with like or as"]]
    ],
    Science: [
      [["Which part of your body helps you see?", "Eyes", "Ears", "Knees", "Elbows"], ["Which is a living thing?", "A tree", "A stone", "A spoon", "A chair"], ["What do plants need to grow?", "Water", "Plastic", "Paint", "Soap"]],
      [["Which material is usually transparent?", "Clear glass", "Wood", "Brick", "Cardboard"], ["What happens to ice when it gets warm enough?", "It melts.", "It becomes wood.", "It grows leaves.", "It becomes metal."], ["Which animal lays eggs?", "A hen", "A cat", "A cow", "A dog"]],
      [["Which part of a plant takes up water from soil?", "Roots", "Flowers", "Petals", "Seeds"], ["Which force pulls objects towards Earth?", "Gravity", "Magnetism alone", "Sound", "Light"], ["Which is a source of light?", "The Sun", "A mirror", "The Moon", "A book"]],
      [["What is evaporation?", "A liquid changing into a gas", "A gas changing into a liquid", "A solid changing into a liquid", "A liquid changing into a solid"], ["Which organ pumps blood?", "The heart", "The stomach", "The brain", "The liver"], ["Which material conducts electricity well?", "Copper", "Rubber", "Dry wood", "Plastic"]],
      [["Which planet is closest to the Sun?", "Mercury", "Venus", "Earth", "Mars"], ["What causes day and night on Earth?", "Earth rotating", "The Sun going around Earth", "The Moon rotating", "Clouds covering the Sun"], ["Which change is reversible?", "Melting ice", "Burning wood", "Cooking an egg", "Rusting iron"]],
      [["What carries inherited information in cells?", "DNA", "Starch", "Water", "Oxygen"], ["How does light travel in a uniform medium?", "In straight lines", "Only in circles", "Only downwards", "Without any direction"], ["Which process makes food in green plants?", "Photosynthesis", "Digestion", "Condensation", "Freezing"]],
      [["Which cell structure controls what enters and leaves?", "Cell membrane", "Nucleus", "Cell wall alone", "Chloroplast"], ["What is the chemical symbol for oxygen?", "O", "Ox", "Og", "Om"], ["What is the SI unit of force?", "Newton", "Joule", "Watt", "Volt"]],
      [["What is the pH of a neutral aqueous solution at 25°C?", "7", "1", "14", "0"], ["Which particles have a negative electric charge?", "Electrons", "Protons", "Neutrons", "Atomic nuclei"], ["What happens to current in a single series circuit?", "It is the same at every point.", "It is used up by the first lamp.", "It only flows through switches.", "It becomes zero after each resistor."]],
      [["A force of 12 N acts on a mass of 3 kg. What is its acceleration?", "4 m/s²", "36 m/s²", "9 m/s²", "0.25 m/s²"], ["What does an enzyme do?", "Acts as a biological catalyst", "Always increases body temperature", "Stores genetic information", "Removes all reaction products"], ["What is an isotope?", "Atoms of the same element with different neutron numbers", "Atoms with different proton numbers only", "Any charged atom", "A molecule containing two elements"]],
      [["What is the relative formula mass of CO₂? Use C = 12, O = 16.", "44", "28", "32", "40"], ["A 6 Ω resistor carries 2 A. What is the potential difference?", "12 V", "3 V", "8 V", "4 V"], ["In a monohybrid cross Aa × Aa, what is the probability of aa?", "25%", "50%", "75%", "100%"]],
      [["How much energy heats 2 kg of water by 10°C? Use c = 4200 J/(kg°C).", "84000 J", "8400 J", "42000 J", "420 J"], ["How many moles are in 9 g of water? Use molar mass = 18 g/mol.", "0.5 mol", "2 mol", "9 mol", "162 mol"], ["After three half-lives, what fraction of radioactive nuclei remains undecayed?", "1/8", "1/3", "1/6", "3/4"]],
      [["Which expression is the magnitude of centripetal acceleration?", "v²/r", "vr", "r/v²", "v/r²"], ["What is the pH of 0.001 mol/dm³ HCl, assuming complete dissociation?", "3", "11", "1", "0.001"], ["If DNA contains 30% adenine, what percentage is guanine in double-stranded DNA?", "20%", "30%", "40%", "70%"]]
    ],
    History: [
      [["Which word means a time before now?", "Past", "Future", "Tomorrow", "Next"], ["Which can help us learn about long ago?", "An old photograph", "A plan for next week", "Tomorrow's forecast", "A future appointment"], ["Which happened first in a person's life?", "Being born", "Starting school", "Becoming an adult", "Learning to drive"]],
      [["What is a timeline used for?", "Putting events in time order", "Measuring rainfall", "Drawing maps", "Counting stars"], ["Who was a famous nurse during the Crimean War?", "Florence Nightingale", "Queen Victoria", "Mary Anning", "Amelia Earhart"], ["In which city did the Great Fire of 1666 happen?", "London", "York", "Paris", "Rome"]],
      [["Which came before the Bronze Age?", "The Stone Age", "The Iron Age", "The Victorian period", "The Tudor period"], ["Which river was central to ancient Egyptian life?", "The Nile", "The Thames", "The Amazon", "The Seine"], ["What is an archaeologist most likely to study?", "Objects left by people in the past", "Tomorrow's weather", "Planet orbits only", "New computer software"]],
      [["Which civilisation built the city of Rome?", "The Romans", "The Maya", "The Aztecs", "The Inca"], ["What were Viking longships used for?", "Sea travel and raids", "Air travel", "Space exploration", "Underground mining"], ["Which is a primary historical source?", "A diary written during an event", "A modern textbook about the event", "A later documentary", "A recent summary of the event"]],
      [["What was a key feature of ancient Athenian democracy?", "Eligible male citizens voted on decisions.", "Every resident could vote.", "Only a hereditary king voted.", "There were no public decisions."], ["Which civilisation built Chichén Itzá?", "The Maya", "The Romans", "The Vikings", "The ancient Egyptians"], ["Why compare several historical sources?", "To check accounts and different viewpoints", "To guarantee they all agree", "To avoid looking at evidence", "To replace all dates with guesses"]],
      [["Which event began in 1939?", "The Second World War", "The First World War", "The Great Fire of London", "The Norman Conquest"], ["Why did many British children leave cities during the Second World War?", "To reduce their risk from bombing", "To join the Roman army", "To build pyramids", "To search for Viking ships"], ["What is a historical interpretation?", "An explanation of the past based on evidence", "An event that has not happened", "A list without any meaning", "A guarantee that every source is accurate"]],
      [["Who won the Battle of Hastings in 1066?", "William of Normandy", "Harold Godwinson", "Henry VIII", "Richard III"], ["What was Magna Carta, agreed in 1215?", "A charter limiting aspects of royal power", "A Roman road map", "A Tudor prayer book", "A Viking ship design"], ["Which event reached England in 1348?", "The Black Death", "The Norman Conquest", "The Industrial Revolution", "The Great Fire of London"]],
      [["Why did Henry VIII break with Rome?", "He wanted royal control of the English Church and an annulment.", "He wanted to restore Roman rule.", "He wanted to abolish monarchy.", "He wanted England to become part of France."], ["Which invention helped mechanise textile production?", "The spinning jenny", "The telescope", "The printing press", "The compass"], ["What is a historian studying causation investigating?", "Why events happened", "Only where objects are stored", "How to predict every future event", "Only the spelling of names"]],
      [["What was an immediate trigger of the First World War?", "The assassination of Archduke Franz Ferdinand", "The fall of the Berlin Wall", "The signing of Magna Carta", "The Battle of Waterloo"], ["What was the Treaty of Versailles?", "The 1919 peace treaty with Germany", "A 1066 peace treaty", "A Roman law code", "A Cold War military alliance"], ["Why does a source's purpose matter?", "Its intended effect may shape its content.", "It makes the source automatically false.", "It makes its date irrelevant.", "It guarantees complete neutrality."]],
      [["What was the Reichstag Fire Decree used to do in 1933?", "Suspend civil liberties and suppress opposition", "Introduce universal democracy", "End the First World War", "Create the United Nations"], ["Which development is associated with the Cold War?", "Competition between the USA and USSR", "A war between Rome and Carthage", "The Norman Conquest", "The building of Stonehenge"], ["What is the best way to evaluate a source's reliability?", "Compare its content, provenance and other evidence", "Accept it if it is old", "Reject it if it has an opinion", "Judge only its length"]],
      [["What was the main aim of containment in US Cold War policy?", "Limit the spread of communism", "Restore the Roman Empire", "End all international trade", "Dissolve the United States"], ["Why was the 1929 Wall Street Crash historically significant?", "It contributed to a wider economic depression.", "It immediately ended all banking.", "It began the Industrial Revolution.", "It directly caused the Norman Conquest."], ["What distinguishes a long-term cause from a trigger?", "It develops over time rather than immediately setting off an event.", "It can never involve politics.", "It must be less important.", "It always happens after the event."]],
      [["What does historical contingency emphasise?", "Outcomes depend on particular circumstances and choices.", "Every outcome was inevitable.", "Only economic factors matter.", "Sources never need interpretation."], ["What is teleological reasoning in history?", "Explaining the past as inevitably leading to a known outcome", "Comparing sources written at the same time", "Putting events in chronological order", "Studying an artefact's material"], ["How can a biased source still be valuable?", "It can reveal attitudes, aims and contemporary perspectives.", "Bias guarantees all its facts are correct.", "Its viewpoint proves every event happened.", "Its date no longer matters."]]
    ]
  };
  function mathematics(year, random) {
    const n = (min, max) => min + Math.floor(random() * (max - min + 1));
    let a = n(2, 9), b = n(2, 9), q, answer;
    if (year === 1) { a = n(1, 10); b = n(1, 10); q = `What is ${a} + ${b}?`; answer = a + b; }
    if (year === 2) { a = n(20, 50); b = n(1, 19); q = `What is ${a} − ${b}?`; answer = a - b; }
    if (year === 3) { q = `What is ${a} × ${b}?`; answer = a * b; }
    if (year === 4) { q = `What is ${a * b} ÷ ${a}?`; answer = b; }
    if (year === 5) { q = `What is ${a}/10 + ${b}/10? Give a decimal.`; answer = (a + b) / 10; }
    if (year === 6) { q = `What is ${a * 10}% of ${b * 20}?`; answer = a * b * 2; }
    if (year === 7) { q = `Solve ${a}x + ${b} = ${a * b + b}. What is x?`; answer = b; }
    if (year === 8) { q = `A triangle has base ${a * 2} cm and perpendicular height ${b} cm. What is its area in cm²?`; answer = a * b; }
    if (year === 9) { a = n(3, 12); q = `If x² = ${a * a} and x is positive, what is x?`; answer = a; }
    if (year === 10) { const triples = [[3,4,5],[5,12,13],[8,15,17]], t = triples[n(0,2)]; q = `A right-angled triangle has shorter sides ${t[0]} cm and ${t[1]} cm. Find its hypotenuse in cm.`; answer = t[2]; }
    if (year === 11) { q = `Solve x² − ${a + b}x + ${a * b} = 0. What is the smaller root?`; answer = Math.min(a, b); }
    if (year === 12) { q = `For y = ${a}x³ + ${b}x, find dy/dx at x = 2.`; answer = 12 * a + b; }
    const choices = new Set([String(answer)]);
    for (const offset of [1, -1, 2, -2, 3, 4]) { if (choices.size === 4) break; choices.add(String(Math.round((answer + offset) * 10) / 10)); }
    return [q, ...choices];
  }
  function create(random = Math.random) {
    let previousSubject = -1;
    const recent = [];
    return { next(year) {
      year = Number(year);
      if (!Number.isInteger(year) || year < 1 || year > 12) throw new RangeError("Choose Year 1 to Year 12.");
      const pool = subjects.map((_, i) => i).filter(i => i !== previousSubject);
      const index = pool[Math.floor(random() * pool.length)]; previousSubject = index;
      const subject = subjects[index];
      let row;
      if (index === 0) row = mathematics(year, random);
      else {
        const rows = banks[subject][year - 1], available = rows.filter(r => !recent.includes(r[0]));
        row = (available.length ? available : rows)[Math.floor(random() * (available.length || rows.length))];
      }
      recent.push(row[0]); if (recent.length > 7) recent.shift();
      const options = row.slice(1);
      for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]; }
      return { subject, year, prompt: row[0], options, answer: row[1], explanation: `The correct answer is: ${row[1]}` };
    } };
  }
  globalThis.ZapmanQuestions = { subjects, create };
})();
