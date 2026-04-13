// Helper function to clone and pad questions up to a desired count.
const generateQuestions = (baseArray, desiredCount, prefix) => {
  const result = [];
  for (let i = 0; i < desiredCount; i++) {
    const baseQuestion = baseArray[i % baseArray.length];
    result.push({
      id: `${prefix}-${i + 1}`,
      question: `${baseQuestion.question} (Q${i + 1})`,
      options: baseQuestion.options,
      answer: baseQuestion.answer
    });
  }
  return result;
};

const engBase = [
  { question: "Choose the word opposite in meaning to the italicized word: The man is known for his *parsimony*.", options: ["generosity", "frugality", "poverty", "wealth"], answer: "generosity" },
  { question: "Select the correctly spelt word.", options: ["Accomodation", "Accommodation", "Acommodation", "Acomodation"], answer: "Accommodation" },
  { question: "Which of the following is an example of a simile?", options: ["The sun smiled at us.", "He runs as fast as a cheetah.", "Time is a thief.", "The city never sleeps."], answer: "He runs as fast as a cheetah." },
  { question: "She ____ to the market every Saturday.", options: ["go", "goes", "gone", "going"], answer: "goes" },
  { question: "If I _____ you, I would study harder.", options: ["am", "was", "were", "been"], answer: "were" },
  { question: "Choose the word nearest in meaning: The *cacophony* in the hall was unbearable.", options: ["silence", "noise", "music", "crowd"], answer: "noise" },
  { question: "Identify the figure of speech: The leaves danced in the wind.", options: ["Personification", "Metaphor", "Simile", "Hyperbole"], answer: "Personification" },
  { question: "Neither the players nor the coach ____ happy with the result.", options: ["was", "were", "are", "have been"], answer: "was" },
  { question: "Complete: A bird in hand is worth two in the ____.", options: ["tree", "nest", "bush", "sky"], answer: "bush" },
  { question: "What is the plural of 'Criterion'?", options: ["Criterions", "Criteria", "Criterias", "Criterion"], answer: "Criteria" }
];

const govBase = [
  { question: "Who was the first Prime Minister of Nigeria?", options: ["Nnamdi Azikiwe", "Obafemi Awolowo", "Ahmadu Bello", "Abubakar Tafawa Balewa"], answer: "Abubakar Tafawa Balewa" },
  { question: "The highest court of appeal in Nigeria is the", options: ["High Court", "Court of Appeal", "Supreme Court", "Magistrate Court"], answer: "Supreme Court" },
  { question: "A system of government where the state controls the means of production is known as", options: ["Capitalism", "Feudalism", "Socialism", "Fascism"], answer: "Socialism" },
  { question: "Under the 1999 Constitution, the power to make laws for the federation is vested in the", options: ["Judiciary", "Executive", "National Assembly", "State Assemblies"], answer: "National Assembly" },
  { question: "Which international organization was formed immediately after World War II?", options: ["League of Nations", "United Nations", "OAU", "ECOWAS"], answer: "United Nations" },
  { question: "An election in which citizens vote a proposal into law is called a", options: ["Referendum", "Plebiscite", "By-election", "Primary election"], answer: "Referendum" },
  { question: "The process of depriving a person of the right to vote is called", options: ["Disenfranchisement", "Gerrymandering", "Impeachment", "Veto"], answer: "Disenfranchisement" },
  { question: "The fundamental human rights are entrenched in the constitution to", options: ["Protect citizens from abuse", "Punish criminals", "Empower the police", "Increase government revenue"], answer: "Protect citizens from abuse" },
  { question: "In a unitary system of government, power is", options: ["Concentrated at the center", "Shared with states", "Held by local governments", "Given to the military"], answer: "Concentrated at the center" },
  { question: "The administrative headquarters of ECOWAS is located in", options: ["Lagos", "Abuja", "Accra", "Dakar"], answer: "Abuja" }
];

const litBase = [
  { question: "The protagonist of 'Things Fall Apart' is", options: ["Obierika", "Nwoye", "Okonkwo", "Ikemefuna"], answer: "Okonkwo" },
  { question: "A dramatic monologue is typically spoken by", options: ["Multiple characters", "A single character to an implied audience", "The chorus", "The author"], answer: "A single character to an implied audience" },
  { question: "Which of these is a play by William Shakespeare?", options: ["The Lion and the Jewel", "Macbeth", "Death and the King's Horseman", "Things Fall Apart"], answer: "Macbeth" },
  { question: "The underlying message or main idea of a literary work is its", options: ["Plot", "Setting", "Theme", "Tone"], answer: "Theme" },
  { question: "A story in which characters and events represent abstract concepts is an", options: ["Allegory", "Ode", "Elegy", "Epic"], answer: "Allegory" },
  { question: "The clash of cultures is a major theme in which novel?", options: ["The Joys of Motherhood", "Things Fall Apart", "The Beautiful Ones Are Not Yet Born", "Second Class Citizen"], answer: "Things Fall Apart" },
  { question: "In drama, a remark made by a character intended to be heard by the audience but not by other characters is an", options: ["Aside", "Soliloquy", "Monologue", "Dialogue"], answer: "Aside" },
  { question: "A poem of fourteen lines is known as a", options: ["Ballad", "Lyric", "Sonnet", "Dirge"], answer: "Sonnet" },
  { question: "The time and place of action in a story is the", options: ["Plot", "Atmosphere", "Setting", "Climax"], answer: "Setting" },
  { question: "Wole Soyinka won the Nobel Prize in Literature in", options: ["1986", "1990", "1980", "1995"], answer: "1986" }
];

const crkBase = [
  { question: "Who was the first king of Israel?", options: ["David", "Saul", "Solomon", "Samuel"], answer: "Saul" },
  { question: "God tested Abraham by asking him to sacrifice his son,", options: ["Ishmael", "Isaac", "Jacob", "Esau"], answer: "Isaac" },
  { question: "The Ten Commandments were given to Moses on Mount", options: ["Horeb", "Carmel", "Sinai", "Nebo"], answer: "Sinai" },
  { question: "Which disciple betrayed Jesus?", options: ["Peter", "John", "Judas Iscariot", "Thomas"], answer: "Judas Iscariot" },
  { question: "Jesus was born in the town of", options: ["Jerusalem", "Nazareth", "Bethlehem", "Jericho"], answer: "Bethlehem" },
  { question: "The first martyr of the early Christian church was", options: ["Paul", "Peter", "Stephen", "James"], answer: "Stephen" },
  { question: "Saul's conversion occurred on the road to", options: ["Jerusalem", "Damascus", "Antioch", "Rome"], answer: "Damascus" },
  { question: "The longest book in the Bible is", options: ["Isaiah", "Genesis", "Psalms", "Jeremiah"], answer: "Psalms" },
  { question: "Who was cast into the lion's den?", options: ["Shadrach", "Meshach", "Daniel", "Elijah"], answer: "Daniel" },
  { question: "The term 'Gospel' means", options: ["Good News", "Salvation", "Holy Spirit", "Prophecy"], answer: "Good News" }
];

export const subjects = [
  {
    id: 'eng',
    name: "Use of English",
    questions: generateQuestions(engBase, 60, "eng")
  },
  {
    id: 'gov',
    name: "Government",
    questions: generateQuestions(govBase, 40, "gov")
  },
  {
    id: 'lit',
    name: "Literature in English",
    questions: generateQuestions(litBase, 40, "lit")
  },
  {
    id: 'crk',
    name: "CRK",
    questions: generateQuestions(crkBase, 40, "crk")
  }
];
