/**
 * Server-only word bank for mini crossword puzzles
 * 
 * IMPORTANT: This is a starter word bank with common short words.
 * TODO: Replace with a larger, more comprehensive word list for production use.
 * Consider using word frequency lists, proper nouns, or curated crossword dictionaries.
 */

/**
 * 2-letter words
 */
const WORDS_2: string[] = [
  "AM", "AN", "AS", "AT", "BE", "BY", "DO", "GO", "HE", "IF",
  "IN", "IS", "IT", "ME", "MY", "NO", "OF", "ON", "OR", "SO",
  "TO", "UP", "US", "WE", "AD", "AH", "AL", "AW", "AX", "AY",
  "EH", "EL", "EM", "EN", "ER", "EX", "HI", "HM", "LO", "OH",
  "OW", "OX", "OY", "SH", "SI", "UM", "UN", "UT", "WO", "YE",
  
  // Common crossword 2-letter words
  "AB", "AG", "BA", "BI", "BO", "DA", "ED", "EF", "ET", "FA",
  "FE", "GI", "HA", "HO", "ID", "JA", "JO", "KA", "KI", "LA",
  "LI", "MA", "MI", "MU", "NA", "NU", "OD", "OE", "OP", "OS",
  "PA", "PE", "PI", "QI", "RE", "TA", "TI", "UH", "UT", "WO",
  "XI", "XU", "YA", "YE", "YO", "ZA", "ZO"
];

/**
 * 3-letter words
 */
const WORDS_3: string[] = [
  "ACE", "ACT", "ADD", "AGE", "AID", "AIM", "AIR", "ALL", "AND", "ANT",
  "ANY", "APE", "ARM", "ART", "ASK", "ATE", "BAD", "BAG", "BAR", "BAT",
  "BED", "BEE", "BET", "BIG", "BIT", "BOX", "BOY", "BUG", "BUS", "BUT",
  "BUY", "CAN", "CAR", "CAT", "COW", "CRY", "CUP", "CUT", "DAD", "DAY",
  "DID", "DIE", "DIG", "DOG", "EAR", "EAT", "EGG", "END", "EYE", "FAR",
  "FEW", "FLY", "FOR", "FOX", "FUN", "GET", "GOT", "GUN", "HAD", "HAT",
  "HER", "HIM", "HIS", "HIT", "HOT", "HOW", "HUG", "ICE", "ILL", "JAR",
  "JOB", "JOY", "KEY", "KID", "LAP", "LAY", "LEG", "LET", "LIE", "LOG",
  "LOT", "LOW", "MAD", "MAN", "MAP", "MAY", "MEN", "MOM", "MUD", "NET",
  "NEW", "NOT", "NOW", "NUT", "ODD", "OFF", "OLD", "ONE", "OUR", "OUT",
  "OWN", "PAN", "PAY", "PEN", "PET", "PIE", "PIG", "PIN", "POT", "PUT",
  "RAN", "RAT", "RAW", "RED", "RUN", "SAD", "SAT", "SAW", "SAY", "SEA",
  "SEE", "SET", "SHE", "SIT", "SIX", "SKY", "SUN", "TAX", "TEA", "TEN",
  "THE", "TOO", "TOP", "TOY", "TRY", "TWO", "USE", "VAN", "WAR", "WAS",
  "WAY", "WET", "WHO", "WHY", "WIN", "WON", "YES", "YET", "YOU", "ZOO",
  
  // Additional common 3-letter crossword words
  "ABS", "ACH", "ADS", "AFT", "AGA", "AGO", "AHS", "AID", "ALE", "AMP",
  "APT", "ARC", "ARE", "ARF", "ARK", "ARS", "ASH", "ASS", "ATE", "AWE",
  "BAM", "BAN", "BAR", "BAY", "BED", "BEL", "BET", "BIB", "BID", "BIN",
  "BOA", "BOB", "BOG", "BOW", "BOX", "BRA", "BRO", "BUD", "BUG", "BUM",
  "BUN", "BUS", "BUT", "BUY", "BYE", "CAB", "CAD", "CAM", "CAN", "CAP",
  "CAR", "CAT", "CAW", "COB", "COD", "COG", "COP", "COT", "COW", "COX",
  "COY", "COZ", "CRY", "CUB", "CUD", "CUE", "CUP", "CUR", "CUT", "DAB",
  "DAD", "DAM", "DAY", "DEN", "DEW", "DID", "DIE", "DIG", "DIM", "DIN",
  "DOC", "DOG", "DOT", "DRY", "DUB", "DUD", "DUE", "DUG", "DUN", "DYE"
];

/**
 * 4-letter words
 */
const WORDS_4: string[] = [
  "ABLE", "BACK", "BALL", "BANK", "BASE", "BEAT", "BEEN", "BELL", "BEST", "BIRD",
  "BLOW", "BLUE", "BOAT", "BODY", "BOOK", "BORN", "BOTH", "BOWL", "BULK", "BURN",
  "BUSY", "CALL", "CAME", "CARD", "CARE", "CASE", "CASH", "CAST", "CELL", "CHAT",
  "CITY", "CLUB", "COAL", "COAT", "CODE", "COLD", "COME", "COOK", "COOL", "COPY",
  "COST", "CREW", "CROP", "DARK", "DATA", "DATE", "DAYS", "DEAD", "DEAL", "DEAR",
  "DEEP", "DESK", "DIED", "DOES", "DONE", "DOOR", "DOWN", "DRAW", "DREW", "DROP",
  "DRUG", "DUAL", "DUCK", "DUTY", "EACH", "EARL", "EARN", "EAST", "EASY", "EDGE",
  "ELSE", "EVEN", "EVER", "EVIL", "EXIT", "FACE", "FACT", "FAIL", "FAIR", "FALL",
  "FARM", "FAST", "FEAR", "FEEL", "FEET", "FELL", "FELT", "FILE", "FILL", "FILM",
  "FIND", "FINE", "FIRE", "FIRM", "FISH", "FIVE", "FLAG", "FLAT", "FLOW", "FOOD",
  "FOOT", "FORM", "FORT", "FOUR", "FREE", "FROM", "FUEL", "FULL", "FUND", "GAIN",
  "GAME", "GAVE", "GEAR", "GIFT", "GIRL", "GIVE", "GLAD", "GOAL", "GOES", "GOLD",
  "GONE", "GOOD", "GRAY", "GREW", "GROW", "GULF", "HAIR", "HALF", "HALL", "HAND",
  "HANG", "HARD", "HARM", "HATE", "HAVE", "HEAD", "HEAR", "HEAT", "HELD", "HELL",
  "HELP", "HERE", "HERO", "HERS", "HIGH", "HILL", "HIRE", "HOLD", "HOLE", "HOME",
  "HOPE", "HORN", "HOST", "HOUR", "HUGE", "HUNG", "HUNT", "HURT", "IDEA", "INCH",
  "INTO", "IRON", "ITEM", "JACK", "JANE", "JAZZ", "JOBS", "JOIN", "JUMP", "JUNE",
  "JURY", "JUST", "KEEN", "KEEP", "KEPT", "KICK", "KILL", "KIND", "KING", "KNEW",
  "KNOW", "LACK", "LADY", "LAID", "LAKE", "LAND", "LANE", "LAST", "LATE", "LEAD",
  "LEFT", "LESS", "LIFE", "LIFT", "LIKE", "LINE", "LIST", "LIVE", "LOAN", "LOCK",
  "LONG", "LOOK", "LORD", "LOSE", "LOSS", "LOST", "LOTS", "LOUD", "LOVE", "LUCK",
  "MADE", "MAIL", "MAIN", "MAKE", "MALE", "MANY", "MARK", "MASS", "MATE", "MATH",
  "MEAL", "MEAN", "MEAT", "MEET", "MENU", "MERE", "MILD", "MILE", "MILK", "MIND",
  "MINE", "MISS", "MODE", "MOON", "MORE", "MOST", "MOVE", "MUCH", "MUST", "NAME",
  "NAVY", "NEAR", "NECK", "NEED", "NEWS", "NEXT", "NICE", "NINE", "NONE", "NOON",
  "NORM", "NOTE", "NOUN", "OKAY", "ONCE", "ONLY", "OPEN", "ORAL", "OVER", "PACE",
  "PACK", "PAGE", "PAID", "PAIN", "PAIR", "PALM", "PARK", "PART", "PASS", "PAST",
  "PATH", "PEAK", "PICK", "PINK", "PLAN", "PLAY", "PLOT", "PLUS", "POEM", "POLL",
  "POOL", "POOR", "PORT", "POST", "PULL", "PURE", "PUSH", "QUIT", "RACE", "RAIN",
  "RANK", "RARE", "RATE", "READ", "REAL", "REAR", "RELY", "RENT", "REST", "RICH",
  "RIDE", "RING", "RISE", "RISK", "ROAD", "ROCK", "ROLE", "ROLL", "ROOM", "ROOT",
  "ROPE", "ROSE", "RULE", "RUSH", "SAFE", "SAID", "SAIL", "SALE", "SALT", "SAME",
  "SAND", "SAVE", "SEAT", "SEED", "SEEK", "SEEM", "SEEN", "SELF", "SELL", "SEND",
  "SENT", "SHIP", "SHOP", "SHOT", "SHOW", "SHUT", "SICK", "SIDE", "SIGN", "SING",
  "SITE", "SIZE", "SKIN", "SLIP", "SLOW", "SNAP", "SNOW", "SOAP", "SOFT", "SOIL",
  "SOLD", "SOLE", "SOME", "SONG", "SOON", "SORT", "SOUL", "SPOT", "STAR", "STAY",
  "STEP", "STOP", "SUCH", "SUIT", "SURE", "TAKE", "TALE", "TALK", "TALL", "TANK",
  "TAPE", "TASK", "TEAM", "TELL", "TEND", "TERM", "TEST", "TEXT", "THAN", "THAT",
  "THEM", "THEN", "THEY", "THIN", "THIS", "THUS", "TIDE", "TILL", "TIME", "TINY",
  "TOLD", "TONE", "TOOK", "TOOL", "TOPS", "TORN", "TOWN", "TREE", "TRIP", "TRUE",
  "TUNE", "TURN", "TYPE", "UNIT", "UPON", "USED", "USER", "VARY", "VAST", "VERY",
  "VIEW", "VOTE", "WAGE", "WAIT", "WAKE", "WALK", "WALL", "WANT", "WARD", "WARM",
  "WASH", "WAVE", "WAYS", "WEAK", "WEAR", "WEEK", "WELL", "WENT", "WERE", "WEST",
  "WHAT", "WHEN", "WIDE", "WIFE", "WILD", "WILL", "WIND", "WINE", "WING", "WIRE",
  "WISE", "WISH", "WITH", "WOLF", "WOOD", "WOOL", "WORD", "WORE", "WORK", "YARD",
  "YEAR", "YOUR", "ZERO", "ZONE"
];

/**
 * 5-letter words
 */
const WORDS_5: string[] = [
  "ABOUT", "ABOVE", "ABUSE", "ACTOR", "ACUTE", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN",
  "AGENT", "AGREE", "AHEAD", "ALARM", "ALBUM", "ALERT", "ALIEN", "ALIGN", "ALIKE", "ALIVE",
  "ALLOW", "ALONE", "ALONG", "ALTER", "AMONG", "ANGER", "ANGLE", "ANGRY", "APART", "APPLE",
  "APPLY", "ARENA", "ARGUE", "ARISE", "ARMED", "ARMOR", "ARRAY", "ARROW", "ASIDE", "ASSET",
  "AVOID", "AWAKE", "AWARD", "AWARE", "BADLY", "BAKER", "BASES", "BASIC", "BEACH", "BEGAN",
  "BEGIN", "BEING", "BELOW", "BENCH", "BILLY", "BIRTH", "BLACK", "BLAME", "BLANK", "BLAST",
  "BLIND", "BLOCK", "BLOOD", "BLOOM", "BOARD", "BOAST", "BOBBY", "BOUND", "BRAIN", "BRAND",
  "BRASS", "BRAVE", "BREAD", "BREAK", "BREED", "BRIEF", "BRING", "BROAD", "BROKE", "BROWN",
  "BUILD", "BUILT", "BUYER", "CABLE", "CALIF", "CARRY", "CATCH", "CAUSE", "CHAIN", "CHAIR",
  "CHAOS", "CHARM", "CHART", "CHASE", "CHEAP", "CHECK", "CHEST", "CHIEF", "CHILD", "CHINA",
  "CHOSE", "CIVIL", "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLICK", "CLIMB", "CLOCK", "CLOSE",
  "CLOUD", "COACH", "COAST", "COULD", "COUNT", "COURT", "COVER", "CRAFT", "CRASH", "CRAZY",
  "CREAM", "CRIME", "CROSS", "CROWD", "CROWN", "CRUDE", "CURVE", "CYCLE", "DAILY", "DANCE",
  "DATED", "DEALT", "DEATH", "DEBUT", "DELAY", "DEPTH", "DOING", "DOUBT", "DOZEN", "DRAFT",
  "DRAMA", "DRANK", "DREAM", "DRESS", "DRILL", "DRINK", "DRIVE", "DROVE", "DYING", "EAGER",
  "EARLY", "EARTH", "EIGHT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", "EQUAL",
  "ERROR", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE", "FAULT", "FIBER",
  "FIELD", "FIFTH", "FIFTY", "FIGHT", "FINAL", "FIRST", "FIXED", "FLASH", "FLEET", "FLOOR",
  "FLUID", "FOCUS", "FORCE", "FORTH", "FORTY", "FORUM", "FOUND", "FRAME", "FRANK", "FRAUD",
  "FRESH", "FRONT", "FRUIT", "FULLY", "FUNNY", "GIANT", "GIVEN", "GLASS", "GLOBE", "GOING",
  "GRACE", "GRADE", "GRAND", "GRANT", "GRASS", "GRAVE", "GREAT", "GREEN", "GROSS", "GROUP",
  "GROWN", "GUARD", "GUESS", "GUEST", "GUIDE", "HAPPY", "HARRY", "HEART", "HEAVY", "HENCE",
  "HENRY", "HORSE", "HOTEL", "HOUSE", "HUMAN", "IDEAL", "IMAGE", "INDEX", "INNER", "INPUT",
  "ISSUE", "JAPAN", "JIMMY", "JOINT", "JONES", "JUDGE", "KNOWN", "LABEL", "LARGE", "LASER",
  "LATER", "LAUGH", "LAYER", "LEARN", "LEASE", "LEAST", "LEAVE", "LEGAL", "LEVEL", "LEWIS",
  "LIGHT", "LIMIT", "LINKS", "LIVES", "LOCAL", "LOOSE", "LOWER", "LUCKY", "LUNCH", "LYING",
  "MAGIC", "MAJOR", "MAKER", "MARCH", "MARIA", "MATCH", "MAYBE", "MAYOR", "MEANT", "MEDIA",
  "METAL", "MIGHT", "MINOR", "MINUS", "MIXED", "MODEL", "MONEY", "MONTH", "MORAL", "MOTOR",
  "MOUNT", "MOUSE", "MOUTH", "MOVED", "MOVIE", "MUSIC", "NEEDS", "NEVER", "NEWLY", "NIGHT",
  "NOISE", "NORTH", "NOTED", "NOVEL", "NURSE", "OCCUR", "OCEAN", "OFFER", "OFTEN", "ORDER",
  "OTHER", "OUGHT", "PAINT", "PANEL", "PAPER", "PARTY", "PEACE", "PETER", "PHASE", "PHONE",
  "PHOTO", "PIANO", "PIECE", "PILOT", "PITCH", "PLACE", "PLAIN", "PLANE", "PLANT", "PLATE",
  "POINT", "POUND", "POWER", "PRESS", "PRICE", "PRIDE", "Prime", "PRINT", "PRIOR", "PRIZE",
  "PROOF", "PROUD", "PROVE", "QUEEN", "QUICK", "QUIET", "QUITE", "RADIO", "RAISE", "RANGE",
  "RAPID", "RATIO", "REACH", "READY", "REALM", "REBEL", "REFER", "RELAX", "REPAY", "REPLY",
  "RIGHT", "RIVAL", "RIVER", "ROBIN", "ROGER", "ROMAN", "ROUGH", "ROUND", "ROUTE", "ROYAL",
  "RURAL", "SCALE", "SCENE", "SCOPE", "SCORE", "SENSE", "SERVE", "SEVEN", "SHALL", "SHAPE",
  "SHARE", "SHARP", "SHEET", "SHELF", "SHELL", "SHIFT", "SHINE", "SHIRT", "SHOCK", "SHOOT",
  "SHORT", "SHOWN", "SIGHT", "SILLY", "SINCE", "SIXTH", "SIXTY", "SIZED", "SKILL", "SLEEP",
  "SLIDE", "SMALL", "SMART", "SMILE", "SMITH", "SMOKE", "SNAKE", "SNOW", "SOLID", "SOLVE",
  "SORRY", "SOUND", "SOUTH", "SPACE", "SPARE", "SPEAK", "SPEED", "SPEND", "SPENT", "SPLIT",
  "SPOKE", "SPORT", "STAFF", "STAGE", "STAKE", "STAND", "START", "STATE", "STEAM", "STEEL",
  "STEEP", "STEER", "STICK", "STILL", "STOCK", "STONE", "STOOD", "STORE", "STORM", "STORY",
  "STRIP", "STUCK", "STUDY", "STUFF", "STYLE", "SUGAR", "SUITE", "SUPER", "SWEET", "TABLE",
  "TAKEN", "TASTE", "TAXES", "TEACH", "TEAMS", "TEETH", "TERRY", "TEXAS", "THANK", "THEFT",
  "THEIR", "THEME", "THERE", "THESE", "THICK", "THING", "THINK", "THIRD", "THOSE", "THREE",
  "THREW", "THROW", "THUMB", "TIGHT", "TIRED", "TITLE", "TODAY", "TOPIC", "TOTAL", "TOUCH",
  "TOUGH", "TOWER", "TRACK", "TRADE", "TRAIN", "TREAT", "TREND", "TRIAL", "TRIBE", "TRICK",
  "TRIED", "TRIES", "TRUCK", "TRULY", "TRUNK", "TRUST", "TRUTH", "TWICE", "TWIST", "TYLER",
  "UNCLE", "UNDER", "UNDUE", "UNION", "UNITY", "UNTIL", "UPPER", "UPSET", "URBAN", "USAGE",
  "USUAL", "VALID", "VALUE", "VIDEO", "VIRUS", "VISIT", "VITAL", "VOCAL", "VOICE", "WASTE",
  "WATCH", "WATER", "WHEEL", "WHERE", "WHICH", "WHILE", "WHITE", "WHOLE", "WHOSE", "WOMAN",
  "WOMEN", "WORLD", "WORRY", "WORSE", "WORST", "WORTH", "WOULD", "WRITE", "WRONG", "WROTE",
  "YOUNG", "YOUTH"
];

/**
 * Word bank organized by length
 */
export const WORD_BANK = {
  2: WORDS_2,
  3: WORDS_3,
  4: WORDS_4,
  5: WORDS_5
} as const;

/**
 * Get all words of a specific length
 */
export function getWordsByLength(length: number): string[] {
  if (length < 2 || length > 5) return [];
  return WORD_BANK[length as keyof typeof WORD_BANK] || [];
}

/**
 * Get a random word of a specific length (server-side only)
 */
export function getRandomWord(length: number): string {
  const words = getWordsByLength(length);
  if (words.length === 0) return "";
  return words[Math.floor(Math.random() * words.length)];
}

/**
 * Check if a word exists in the word bank
 */
export function isValidWord(word: string): boolean {
  const length = word.length;
  if (length < 2 || length > 5) return false;
  
  const words = getWordsByLength(length);
  return words.includes(word.toUpperCase());
}

/**
 * Get total number of words in the bank
 */
export function getTotalWordCount(): number {
  return Object.values(WORD_BANK).reduce((total, words) => total + words.length, 0);
}

/**
 * Get word count by length
 */
export function getWordCountByLength(): Record<number, number> {
  return {
    2: WORDS_2.length,
    3: WORDS_3.length,
    4: WORDS_4.length,
    5: WORDS_5.length
  };
}
