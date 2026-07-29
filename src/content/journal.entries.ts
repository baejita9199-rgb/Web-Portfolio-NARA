import { assetDimensions, naraAssets } from "./assets";
import type { ArticleBlock, ImageAsset, JournalEntry } from "./types";

const { images } = naraAssets;

/** Small helpers so the articles below read as prose rather than as data. */
const p = (text: string): ArticleBlock => ({ kind: "paragraph", text });
const h = (text: string): ArticleBlock => ({ kind: "subhead", text });
const q = (text: string, attribution?: string): ArticleBlock => ({
  kind: "quote",
  text,
  attribution,
});
const fig = (image: ImageAsset, caption: string): ArticleBlock => ({
  kind: "figure",
  image,
  caption,
});
const list = (items: string[], title?: string): ArticleBlock => ({
  kind: "list",
  title,
  items,
});

export const journalEntries: readonly JournalEntry[] = [
  /* ------------------------------------------------------------------ 01 */
  {
    slug: "on-building-with-quiet-materials",
    title: "On Building with Quiet Materials",
    excerpt:
      "A short note on timber, clay and the surfaces that change with light.",
    standfirst:
      "Before a single wall went up, samples were left outside for a season to see how they would age. Six of the nine were rejected. What follows is what the other three taught us.",
    category: "Materials",
    publishedAt: "2025-11-04",
    readingTime: "5 min read",
    image: {
      src: images.journal01,
      ...assetDimensions.detail,
      alt: "Late light raking across a hand-finished plaster wall.",
    },
    body: [
      p(
        "The first decision was not a shape. It was a surface. Before any plan was drawn, samples of clay, lime and local timber were left outdoors on a bench above the site to see how they would age — which ones would grey gracefully, which would darken, which would hold the warmth of afternoon light long after the sun had moved on.",
      ),
      p(
        "They stayed there for eight months, through the end of one dry season and the whole of a wet one. Nobody protected them. That was the test.",
      ),
      p(
        "Six of the nine were rejected. Two cracked in the first month of rain, which was informative but not surprising. One went a flat, chalky colour that looked less like age than like a mistake, and that one was the most interesting failure, because on the day it was made it had been everybody's favourite.",
      ),
      h("Surfaces that are worked by hand"),
      p(
        "Materials that behave quietly tend to be the ones that are worked by hand. A lime plaster wall is never flat. It carries the trace of the person who floated it, and it catches raking light in a way that changes hour by hour. A machine-perfect surface gives you the same wall at nine in the morning and five in the afternoon. A hand-finished one gives you two different rooms.",
      ),
      p(
        "You notice this most in the corridor between the two lower rooms, which has no window of its own and takes all its light second-hand from the courtyard. On a flat wall that corridor would be dead space. On this one it changes four or five times a day, and people slow down in it without being able to say why.",
      ),
      q(
        "A wall you can read the weather on is worth more than a wall that always looks new.",
      ),
      p(
        "This is not nostalgia. It is a practical observation about how long a building stays interesting to live in. Surfaces that hide their age need constant maintenance to keep the illusion; surfaces that show it need almost none. The maintenance budget for this house is, by design, mostly a ladder and a tin of oil.",
      ),
      fig(
        {
          src: images.materialClay,
          ...assetDimensions.square,
          alt: "Close view of hand-floated lime plaster, its texture raking in low light.",
        },
        "Lime and river sand, floated by hand. The texture is not a finish applied to the wall — it is the wall.",
      ),
      h("Timber, and where hands land"),
      p(
        "Timber was taken from managed local stands and left largely untreated inside the rooms, oiled only where hands meet it — door pulls, the edge of a desk, the lip of a bath. Those are the places that will darken first, and they are meant to. A house should keep a record of the people who have stayed in it.",
      ),
      p(
        "The screens along the terrace are the exception. They take the full weight of the afternoon sun and the whole of the wet season, so they are oiled twice a year and will still silver within a decade. That was accepted at the drawing stage rather than fought. A building that argues with its climate loses slowly and expensively.",
      ),
      p(
        "Nothing is fitted tight. The boards move several millimetres between February and August, and every joint in the house was detailed with that movement assumed rather than resisted. The first year, two doors stopped closing in the wet season and then started again in November. They were not planed. They were left alone, and they have behaved ever since.",
      ),
      h("What the four materials do"),
      list(
        [
          "Local timber — structure, screens, floors. Moves with the humidity, which is why nothing is fitted tight.",
          "Lime plaster — interior walls. Breathes, so the rooms dry out between storms instead of holding the damp.",
          "Dry-laid stone — courtyard, thresholds, the bath surround. Stays the coolest surface on the property through the hot months.",
          "Undyed textile — curtains, bedding, cushions. Filters light without colouring it, which matters in rooms where the light is the main event.",
        ],
        "The material palette, in full",
      ),
      h("What we would do differently"),
      p(
        "Two things. The stone thresholds should have been a further ten millimetres proud of the floor — water finds the difference in a heavy storm, and mopping a hallway twice a year is a small but avoidable irritation.",
      ),
      p(
        "And the plaster in the kitchen was a mistake. It is beautiful and it is porous, and a kitchen is not a room that rewards porous. It has been sealed on the two walls behind the work surface, which spoils them slightly, and that compromise is visible if you know to look.",
      ),
      p(
        "None of this is a style. It is closer to a set of constraints: use what is near, work it by hand where the hand will be felt, and let the light do the decorating. Everything else the building does follows from those three, including the errors.",
      ),
    ],
  },

  /* ------------------------------------------------------------------ 02 */
  {
    slug: "the-first-rain",
    title: "The First Rain",
    excerpt: "How the landscape shifts at the beginning of the wet season.",
    standfirst:
      "There is a week each year when the air changes before the sky does. Guests who arrive in it often think they have come at the wrong time. They have not.",
    category: "Seasons",
    publishedAt: "2025-08-19",
    readingTime: "5 min read",
    image: {
      src: images.journal02,
      ...assetDimensions.landscape,
      alt: "Low cloud moving through a forested valley after rain.",
    },
    body: [
      p(
        "There is a week each year when the air changes before the sky does. It thickens. The forest, which has been dry and pale and full of sound, goes quiet for a day or two, as though holding its breath. The birds that wake the Forest Room at half past five simply do not, and their absence is the first thing anyone notices.",
      ),
      p(
        "Then the first rain arrives, usually in the late afternoon, and everything at once smells of earth. The path below the house darkens. The stone courtyard, which has been the hottest surface on the property, becomes the coolest within an hour.",
      ),
      h("The valley becomes legible"),
      p(
        "Guests who arrive in this week often ask whether they have come at a bad time. They have not. The valley is at its most legible when it is wet — the ridgelines separate into layers, the mist finds the contours, and from the terrace you can read the shape of the land the way you would read a drawing.",
      ),
      p(
        "In the dry months the far range is a single flat silhouette. After rain it becomes four distinct ridges at four distinct distances, and the two side valleys that are invisible in April open up as pale gaps. It is the same view. It is not remotely the same view.",
      ),
      fig(
        {
          src: images.detailWater,
          ...assetDimensions.detail,
          alt: "Still water holding a flat grey reflection after rain.",
        },
        "The courtyard drain fills within minutes and empties over the following hour. It is the only clock the house keeps in the wet season.",
      ),
      q(
        "From the terrace you can read the shape of the land the way you would read a drawing.",
      ),
      h("What the building does about it"),
      p(
        "The eaves are deep on the south and west sides — deep enough that a window can stay open through most of a storm. That was not an aesthetic decision. It came from a season spent watching where water actually lands, which is rarely where a drawing suggests it will.",
      ),
      p(
        "The courtyard has no gutters at all. Water comes off the roof in four places and falls onto stone, loudly, and this was argued about for a long time before it was built. It is now the single most commented-on feature of the property, which is a lesson about how often the thing worth keeping is the thing that seemed like a problem.",
      ),
      list([
        "Deep eaves on the exposed elevations, shallow ones where the slope already shelters the building.",
        "No gutters on the courtyard side — the water is allowed to fall and be heard.",
        "Thresholds raised a hand's width, which is the difference between a wet floor and a dry one.",
        "Lime plaster inside, so the walls dry out between storms rather than holding damp.",
        "Every path surfaced in loose stone rather than anything smooth, for reasons that become obvious within one afternoon.",
      ]),
      h("The green changes twice"),
      p(
        "By the second week the green has changed entirely. It is a heavier, more saturated colour, and it will hold until the cold months. Then in late January it shifts again — drier, greyer, with more of the structure of the trees showing through — and that second change is the one almost nobody is here to see, because it happens over about ten days in the least-booked part of the year.",
      ),
      p(
        "The house is designed for both ends of this: deep eaves for the rain, and openings wide enough that the dry season still reaches the back of every room.",
      ),
      h("Coming in the wet season"),
      p(
        "Bring one more layer than you think you need — the evenings drop further than the daytime temperature suggests, and the Hill Residence is several degrees cooler than the courtyard at any hour. Walking is still good, though the ridge path turns slippery for about two days after heavy rain and is unpleasant rather than dangerous.",
      ),
      list([
        "Rain comes mostly in the late afternoon and rarely lasts past seven.",
        "Mornings are frequently clear, and are the best of the year for the ridge walk.",
        "Mushrooms appear on the upper path for about three weeks and then are gone.",
        "The road in is fine; the last four kilometres are simply slower.",
      ]),
      p(
        "Most guests end up reading through the heavy part of the afternoon and going out at five, when the rain has usually stopped and the light comes back low and clean. It is not a compromise. Several people have said it is the best part of the day, and they are probably right.",
      ),
    ],
  },

  /* ------------------------------------------------------------------ 03 */
  {
    slug: "a-morning-table",
    title: "A Morning Table",
    excerpt: "Notes from the garden, kitchen and shared breakfast.",
    standfirst:
      "Breakfast is not a service here so much as a habit the house has. It begins in the garden, usually before six, and nobody is asked what they would like.",
    category: "Table",
    publishedAt: "2025-05-27",
    readingTime: "5 min read",
    image: {
      src: images.journal03,
      ...assetDimensions.editorial,
      alt: "A simple breakfast setting on a worn timber table beside a garden door.",
    },
    body: [
      p(
        "Breakfast is not a service here so much as a habit the house has. It begins in the garden, usually before six, with whatever is ready — herbs, a few greens, occasionally fruit from the two trees that were on the slope long before the house was.",
      ),
      p(
        "Whoever is cooking walks out with a basket and comes back about twenty minutes later, and that walk determines the meal. There is no order placed the night before and no stock kept beyond a week. If the garden has nothing, the meal is smaller. This happens perhaps six times a year and nobody has ever complained.",
      ),
      h("A small kitchen decides the menu"),
      p(
        "The kitchen is small on purpose. A small kitchen decides the menu for you: rice porridge most mornings, preserved vegetables from the previous season, eggs, and a pot of local tea that stays on the table long after the plates are cleared.",
      ),
      p(
        "There is no printed menu and no choice offered, which sounds austere and is not. Removing the decision from the start of the morning turns out to be the most restful thing the kitchen does. Guests who arrive irritated by this on day one are usually its most vocal defenders by day three.",
      ),
      p(
        "Dietary requirements are a different matter and are simply accommodated. A day's notice makes it easy; no notice makes it a slightly worse breakfast for one person, which is a fair trade for not running a stockroom.",
      ),
      fig(
        {
          src: images.kitchenHands,
          ...assetDimensions.detail,
          alt: "Hands finishing a dish on a worn timber worktop.",
        },
        "Most of what is served was picked within the hour and cooked within twenty minutes of that.",
      ),
      h("One plank, everyone"),
      p(
        "The table itself is one plank — two and a half metres of a single tree that came down in a storm two valleys over — and it seats everyone staying that week. Guests are not obliged to speak to one another and often do not, which is its own kind of hospitality.",
      ),
      p(
        "The room is oriented east, so the light does most of the talking until about eight. By nine it has moved off the table entirely and the room becomes ordinary, which is the signal most people take to leave.",
      ),
      q(
        "Guests are not obliged to speak to one another and often do not. That is its own kind of hospitality.",
      ),
      h("What is usually on it"),
      list(
        [
          "Rice porridge, thin rather than thick, with ginger and whatever herb is strongest that week.",
          "Preserved vegetables from the previous season's surplus.",
          "Eggs from the village at the bottom of the hill, boiled soft.",
          "Fruit, only if the trees have given any — some weeks they have not.",
          "A pot of local tea, refilled without being asked.",
        ],
        "A typical morning",
      ),
      h("The preserving shelf"),
      p(
        "Along the north wall of the kitchen there are about forty jars, and they are the reason the menu holds together across a year. Late in each season whatever is in surplus goes into them — mustard greens, young bamboo, chillies, small limes — and comes back out three months later when the garden has nothing to offer.",
      ),
      p(
        "It is the least photogenic part of the operation and probably the most important. A seasonal kitchen without a preserving shelf is only seasonal for about four months of the year; the rest of the time it is just a kitchen that buys things.",
      ),
      p(
        "What is served changes constantly and the shape of the morning never does. That seems to be the point.",
      ),
    ],
  },

  /* ------------------------------------------------------------------ 04 */
  {
    slug: "the-courtyard-at-four-oclock",
    title: "The Courtyard at Four O'Clock",
    excerpt:
      "Why one stone square was left empty, and what happens in it every afternoon.",
    standfirst:
      "The most argued-over decision in the whole plan was to leave a room-sized space with nothing in it at all.",
    category: "Architecture",
    publishedAt: "2026-01-22",
    readingTime: "5 min read",
    image: {
      src: images.journal04,
      ...assetDimensions.landscape,
      alt: "An enclosed stone courtyard open to the sky, shadow falling across the floor.",
    },
    body: [
      p(
        "The most argued-over decision in the whole plan was to leave a room-sized space with nothing in it at all. Nine metres by seven, open to the sky, laid in dry stone collected during the excavation. No furniture. No planting except what arrived on its own.",
      ),
      p(
        "Every version of the drawings that tried to make it useful made it worse. A table turned it into a dining room without a roof. A pool turned it into an amenity, and an amenity is a thing people photograph once and then walk past. A covered walkway around three sides — which lasted through two revisions — turned it into a corridor with a hole in the middle.",
      ),
      p(
        "Left empty, it became the thing the rest of the house is arranged around.",
      ),
      h("What the stone does"),
      p(
        "Dry-laid stone holds cold. Through the hot months the courtyard is measurably cooler than any room with a fan in it, and by mid-afternoon there is a slow draw of air out of the bedrooms and into the open square.",
      ),
      p(
        "Nobody engineered that. It was noticed in the second week after completion, by someone standing in a doorway wondering why there was a draught, and it was then protected in every subsequent revision — which mostly meant refusing to glaze the two openings that a colder client would have glazed.",
      ),
      fig(
        {
          src: images.courtyardSuite02,
          ...assetDimensions.detail,
          alt: "Afternoon shadow falling across the stone floor of a small courtyard.",
        },
        "Around four, the shadow of the west wall reaches the far corner. It is the most reliable event of the day.",
      ),
      h("Four o'clock"),
      p(
        "Around four, the shadow of the west wall reaches the far corner and the whole square changes temperature within about twenty minutes. Guests who have been inside since lunch tend to appear at exactly that point without having arranged to. It happens most days and it is faintly comic to watch: three or four people arriving separately, from different doors, all slightly surprised to find the others there.",
      ),
      q(
        "Every version of the drawings that tried to make it useful made it worse. Left empty, it became the thing the rest of the house is arranged around.",
        "From the design notes, second revision",
      ),
      p(
        "Tea gets carried out. Nobody organises this and it is not on any schedule. It is simply the hour at which the best room on the property becomes available, and people are good at noticing that sort of thing without being told.",
      ),
      h("What arrived on its own"),
      list([
        "Moss along the north joints, within the first wet season.",
        "A fig seedling in the south-east corner, left in place and now waist high.",
        "Two resident birds who use the wall top and object loudly to being watched.",
        "A crack across three stones, from the first cold month. Not repaired, and not going to be.",
      ]),
      h("The argument for doing nothing"),
      p(
        "There is a version of hospitality design in which every square metre must justify itself — a yield per room, a covers-per-sitting, a reason. By that logic the courtyard is the least efficient part of the property and should have been two more bedrooms.",
      ),
      p(
        "It is also, without any close competition, the reason people book a second time. That is not an argument that would survive a spreadsheet, and it happens to be true.",
      ),
      p(
        "The courtyard is the clearest statement the house makes: that a space does not have to do anything in order to be the best room on the property. It is also the hardest thing to photograph, which is almost certainly related.",
      ),
    ],
  },

  /* ------------------------------------------------------------------ 05 */
  {
    slug: "what-the-weavers-know",
    title: "What the Weavers Know",
    excerpt:
      "Two valleys away, undyed cotton is still measured by arm-span rather than metre.",
    standfirst:
      "The textiles in every room come from a workshop of four people who have never described what they do as design.",
    category: "Craft",
    publishedAt: "2025-12-09",
    readingTime: "5 min read",
    image: {
      src: images.journal05,
      ...assetDimensions.detail,
      alt: "Undyed woven cloth on a wooden frame in flat workshop light.",
    },
    body: [
      p(
        "The textiles in every room — curtains, bedding, the cushions on the terrace — come from a workshop of four people two valleys away. None of them has ever described what they do as design. They describe it as work, and they measure it by arm-span rather than by metre.",
      ),
      p(
        "The first order took four months to place, most of which was spent establishing that we did not want anything unusual. This turned out to be difficult to communicate. Every outside enquiry they had received for years had asked for something special, and the request for the plainest cloth they made was met with genuine suspicion.",
      ),
      h("Undyed, on purpose"),
      p(
        "Almost everything is left undyed. This was their suggestion, not ours. Undyed cotton and hemp filter light without colouring it, which matters enormously in rooms where the light is the main event. A dyed curtain throws its colour onto the wall behind it all afternoon; an undyed one does not.",
      ),
      p(
        "There are two exceptions, both in the Hill Residence, where a very pale indigo was used for the terrace cushions because they sit against sky rather than plaster. Even that took a conversation.",
      ),
      fig(
        {
          src: images.materialTextile,
          ...assetDimensions.square,
          alt: "The warp and weft of an undyed woven cloth, close up.",
        },
        "Warp and weft at close range. The irregularity is not a flaw in the cloth; it is the record of the hand that made it.",
      ),
      q(
        "You will see the mistakes for the first week. After that you will only see them if you are looking for them.",
        "The workshop's eldest weaver",
      ),
      h("Why the edges are uneven"),
      p(
        "The curtain in the Forest Room is nineteen millimetres wider at the bottom than at the top. It was offered as a replacement and refused. That kind of variance is what separates cloth from material, and once a room has one honest irregularity in it, everything else in the room relaxes.",
      ),
      p(
        "It also means nothing can be reordered exactly. Replacements are woven fresh and never quite match, so the house drifts slowly out of uniformity as things wear out. That was accepted at the start, and five years in it is beginning to show — the oldest bedding is perceptibly softer and a half-shade warmer than the newest.",
      ),
      h("What it costs"),
      p(
        "More than the alternative, and less than people assume. A set of hand-woven bedding runs to roughly four times the price of a good mill equivalent and lasts something like three times as long, so the arithmetic is worse but not absurd.",
      ),
      p(
        "The part that does not appear in the arithmetic is that the workshop still exists. There were eleven of them in this valley thirty years ago. There are two now, and one of those is four people who could stop at any point.",
      ),
      h("Visiting"),
      list([
        "The workshop takes visitors most afternoons between November and March.",
        "It is a working room, not a demonstration — expect to be largely ignored, pleasantly.",
        "Nothing is for sale on site; commissions take between four and nine weeks.",
        "Getting there is forty minutes by road, most of it slow.",
        "Photographs are fine. Filming is not, and the reason has never been explained.",
      ]),
      p(
        "Guests who go tend to come back quieter and considerably more interested in their own curtains, which is the entire reason the visit is offered.",
      ),
    ],
  },

  /* ------------------------------------------------------------------ 06 */
  {
    slug: "walking-the-ridge-before-light",
    title: "Walking the Ridge Before Light",
    excerpt:
      "The route behind the house, and the forty minutes that are worth waking for.",
    standfirst:
      "It is not a difficult walk and it is not a long one. What it is, is early.",
    category: "Landscape",
    publishedAt: "2026-03-15",
    readingTime: "5 min read",
    image: {
      src: images.journal06,
      ...assetDimensions.editorial,
      alt: "A footpath rising into forest in the blue light before dawn.",
    },
    body: [
      p(
        "It is not a difficult walk and it is not a long one — around three kilometres, with perhaps a hundred and forty metres of climb. What it is, is early. The whole point of the ridge route is to be standing on the open section of it about forty minutes before the sun clears the far range.",
      ),
      p(
        "That means leaving the courtyard at an hour most people would describe as the middle of the night. There is no way to soften this and no shorter version that works. The compensation is that you are back before breakfast is cleared, and that the rest of the day feels considerably longer than it is.",
      ),
      h("What happens in those forty minutes"),
      p(
        "The valley fills with cloud overnight and then empties. From below you experience this as fog lifting. From the ridge you watch it drain out of the side valleys in sequence, one after another, as though someone were pulling a plug in each.",
      ),
      p(
        "It takes about half an hour and then it is simply over. The order is consistent — the eastern side valley first, then the long one below the village, then the two shallow ones under the far shoulder — and once you know the order you spend the whole time waiting for the third, which is the one that goes fastest.",
      ),
      fig(
        {
          src: images.terraceMorning,
          ...assetDimensions.panoramic,
          alt: "Layered ridgelines with cloud draining out of the side valleys at first light.",
        },
        "The side valleys empty in sequence, not all at once. Watching the order is most of the pleasure.",
      ),
      q(
        "From below you experience this as fog lifting. From the ridge you watch it drain out of the side valleys in sequence.",
      ),
      h("The path itself"),
      p(
        "The first eight hundred metres are the only genuinely steep part and they are all in forest, which in the dark means a torch rather than moonlight. After that the gradient eases and the trees thin, and there is a flat section near the top that was terraced and farmed within living memory — you can still read the lines of it if the grass is short.",
      ),
      p(
        "The open section is perhaps three hundred metres long. There is one obvious place to stand, marked by nothing at all, and everybody finds it independently.",
      ),
      h("Practical notes"),
      list([
        "Leave about eighty minutes before sunrise. Someone will have made tea.",
        "The first eight hundred metres are steep and unlit; a torch is genuinely necessary.",
        "The path is slippery for two days after heavy rain and unpleasant rather than dangerous.",
        "Long sleeves. It is colder on the ridge than the courtyard suggests, every time.",
        "It is roughly two hours door to door, including standing still.",
        "There is no phone signal for the middle forty minutes, which is worth knowing rather than worrying about.",
      ]),
      h("Going alone"),
      p(
        "Guests are welcome to walk it unaccompanied and many do after the first time. The route is obvious in daylight and marked well enough in the dark. Nobody has got lost; two people have turned back, both in the wet season, both sensibly.",
      ),
      p(
        "The guided version exists mostly because the person who leads it has walked this ridge for thirty years and will tell you which side valley empties first, and why, and what used to be farmed on the flat section near the top, and which of the two shoulders opposite has a name and which does not.",
      ),
      p(
        "Either way, you will be back before breakfast is cleared. The house is quiet at that hour and stays quiet, and there is usually nobody else at the table.",
      ),
    ],
  },
];
