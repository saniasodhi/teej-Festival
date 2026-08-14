/* ============================================================================
   TEEYAN — section data
   ----------------------------------------------------------------------------
   Everything the journey is built from lives in this file. The markup, the
   colours, the atmosphere and the players are all generated from it.

   ····························································· PLAYLIST IDS ··
   Each section plays one YouTube playlist. The ID is the value of the `list`
   parameter in a playlist URL:

       https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                                             └──────────── this ────────────┘

   The set below was chosen for fit and checked that each one loads and plays.
   Swap any of them: the only thing that has to be true is that the ID is real.
   Leave `youtubePlaylistUrl` empty and the player links to music.youtube.com
   for that ID; set it to send people somewhere else.

   A section can also be **one recording** instead of a playlist, for when
   there is a definitive take rather than a selection. Put the `v=` value in
   `youtubeVideoId` and leave `youtubePlaylistId` empty:

       https://youtu.be/6LCDyXjhWRc
                        └── this ──┘

   Previous and next then disable themselves, because a single track has
   nothing for them to move between.

   A section with neither is not broken. It renders a disabled player with an
   honest message and no iframe is ever created for it.

   ······························································· ARTWORK ····
   Two crops per section in assets/art/:

       <id>-wide.webp   16:9, shown when the viewport is landscape
       <id>-tall.webp   9:16, shown when the viewport is portrait
                        (+ a .jpg of each, as the fallback)

   Availability is per section, the same as the playlist IDs — a section whose
   two fields are empty draws a gradient from its own palette and requests no
   image at all, so the console stays clean while the rest are painted.

   `focus` and `focusTall` are the object-position for each crop. A full-bleed
   image is always cropped by the viewport, and the default centre crop is not
   always the right one: it decides which part of the painting ends up under
   the words. Peke needs its frame pushed right so the welcome at the gate does
   not sit behind the text.

   ······························································· HEADINGS ····
   `nameGurmukhi` is set as live text in a self-hosted Noto Serif Gurmukhi, so
   the browser shapes it and the matras land correctly. Only the ਤੀਆਂ wordmark
   is outlines — that one may never depend on a font load.
   ========================================================================= */

/* Where the art lives. Relative on purpose — the site has to survive being
   served from https://user.github.io/repo-name/ as well as from a root. */
const ART = 'assets/art/';

export const SECTIONS = [
  {
    id: 'sawan',
    nameGurmukhi: 'ਸਾਉਣ',
    nameRoman: 'Sawan',
    nameEnglish: 'The Rains Break',

    copy:
      'The fifth month of the Punjabi year. The rain comes, and everything ' +
      'that follows depends on it.',

    detail:
      'Teeyan begins on Teej, the third day of the bright fortnight of Sawan, ' +
      'and in most of Punjab it runs on until the full moon. The timing is not ' +
      'sentimental. Sawan sits in the middle of the kharif season — paddy in the ' +
      'flooded fields, cotton and maize already sown — and the rain that falls ' +
      'now decides what the year yields.\n\n' +
      'It is also the month Punjabi song returns to more than any other. The ' +
      'black cloud, the wet earth, the smell of first rain on hot ground, the ' +
      'woman counting days: these images are old, and they are all Sawan. When ' +
      'the rain finally breaks, what follows is not a celebration of the ' +
      'weather. It is what the weather makes possible.',

    accentColor: '#7FB0A8',
    palette: ['#0C272C', '#33474C', '#2C4A34', '#AFC0BE'],
    warmth: 0.0,
    anchor: 'left',
    fx: 'rain',

    artworkWide: ART + 'sawan-wide',
    artworkTall: ART + 'sawan-tall',
    focus: '50% 50%',
    focusTall: '50% 50%',
    alt:
      'The monsoon breaking over a Punjabi village: black cloud above the ' +
      'rooftops and the gurdwara dome, flooded paddy on either side, a woman ' +
      'lifting washing from a charpai, a boy running for a lit doorway.',

    /* A Teej jukebox rather than the slower folk playlist that was here — the
       rains breaking is the start of the festival, and it should sound like
       it. Single video, so prev and next disable themselves. */
    youtubePlaylistId: '',
    youtubeVideoId: 'JWMoQ033oRc',
    youtubePlaylistUrl: '',
  },

  {
    id: 'peke',
    nameGurmukhi: 'ਪੇਕੇ',
    nameRoman: 'Peke',
    nameEnglish: 'The Road Home',

    copy:
      'Married daughters go back to the house they grew up in. A brother is ' +
      'sent to fetch them.',

    detail:
      'A woman’s life in rural Punjab is divided between two houses: peke, ' +
      'her parents’ home, and sohre, her husband’s. After marriage she ' +
      'belongs to the second and visits the first. Teeyan is one of the few ' +
      'points in the year when that reverses by custom rather than by ' +
      'permission — the invitation is expected, the in-laws are expected to ' +
      'release her, and her brother is expected to come for her.\n\n' +
      'Her mother’s house receives her with new clothes, glass bangles and ' +
      'mehendi. What she gets is a fortnight among women she does not have to ' +
      'defer to. A large part of the Punjabi folk repertoire is built on this ' +
      'road: the brother travelling to fetch his sister, the sister watching ' +
      'for him, and the house she left.',

    boli: {
      punjabi: 'Sada chidiyan da chamba ve, babul asaan udd jana.',
      english: 'Ours is a flock of sparrows, father — we will fly away.',
      note: 'A lok geet, sung when a daughter leaves her father’s house. Teeyan is the month it runs the other way.',
    },

    accentColor: '#D89A4A',
    palette: ['#8C4A32', '#B8823C', '#DCC099', '#A9B9BE'],
    warmth: 0.42,
    anchor: 'right',
    fx: 'none',

    artworkWide: ART + 'peke-wide',
    artworkTall: ART + 'peke-tall',
    /* Pushed right so the arrival and the raised arms at the gate clear the
       right-anchored copy instead of sitting behind it. */
    focus: '92% 50%',
    focusTall: '50% 50%',
    alt:
      'The same village in late afternoon light: a woman arriving on foot with ' +
      'a tiffin box, an older woman at the gate with both arms raised to greet ' +
      'her, folded cloth and a bowl of sweets set down on the brick.',

    youtubePlaylistId: 'OLAK5uy_lojYSVwauuEeG0WReDfSeG3gdTC-UiMn8',
    youtubePlaylistUrl: '',
  },

  {
    id: 'mehendi',
    nameGurmukhi: 'ਮਹਿੰਦੀ ਤੇ ਫੁਲਕਾਰੀ',
    nameRoman: 'Mehendi te Phulkari',
    nameEnglish: 'Hands and Thread',

    copy:
      'An afternoon indoors before anyone goes out. Henna, thread, and one ' +
      'bulb doing all the work.',

    detail:
      'Phulkari means flower work. It is darning stitch in floss silk on coarse ' +
      'hand-spun khaddar cotton, and it is worked from the back of the cloth: ' +
      'the embroiderer counts threads on the reverse, and the pattern comes out ' +
      'on the side she cannot see. A bagh is a phulkari covered so densely that ' +
      'no ground cloth shows at all. A chope comes from the maternal ' +
      'grandmother, stitched so it reads the same on both faces, and it is ' +
      'begun long before it is needed.\n\n' +
      'Mehendi is quicker and far more sociable. The paste goes on palms and ' +
      'forearms and is left to dry for hours, which means hours of sitting ' +
      'still, which means hours of talk. The colour it leaves is read: a deep ' +
      'stain is taken as a good sign, and everyone in the room will have an ' +
      'opinion about whose came out darkest.',

    accentColor: '#E0A855',
    palette: ['#150C0B', '#5A1A20', '#7A4426', '#D99A45'],
    warmth: 0.62,
    anchor: 'left',
    fx: 'flicker',

    artworkWide: ART + 'mehendi-wide',
    artworkTall: ART + 'mehendi-tall',
    focus: '50% 50%',
    focusTall: '50% 50%',
    alt:
      'Five women and a girl sitting on the floor of a room indoors. One is ' +
      'drawing henna onto another\'s open palm with a cone; at the other end a ' +
      'woman works a phulkari across her lap. A brass plate of henna cones and ' +
      'spools of silk thread are on the floor between them.',

    /* Instrumental folk — the quiet half of the festival, and the one section
       where the room is doing the talking. */
    youtubePlaylistId: 'PLpJlo_lzUrZ4GQKg3v8mSFoMEo04yJqIz',
    youtubePlaylistUrl: '',
  },

  {
    id: 'peengh',
    nameGurmukhi: 'ਪੀਂਘ',
    nameRoman: 'Peengh',
    nameEnglish: 'The Swing',

    copy:
      'Ropes over a peepal branch, a plank tied across. Two women take it as ' +
      'high as it will go.',

    detail:
      'The swing is the image Teeyan is remembered by, and it is not ' +
      'decorative. It goes up outdoors, on a shared tree in shared ground, and ' +
      'for the length of Sawan that ground is theirs.\n\n' +
      'The peepal is the usual tree — big, old, branches that carry weight, and ' +
      'standing where people already gather. Ropes are thrown over a bough and ' +
      'a plank or a folded quilt is tied across. Swinging is done standing, ' +
      'usually in pairs facing each other, and it is competitive: height is a ' +
      'matter of pride and everyone watching is keeping count.\n\n' +
      'The songs are sung on the swing, not beside it. The rhythm of the ropes ' +
      'sets the rhythm of the singing, and the two are hard to pull apart.',

    accentColor: '#B8CC63',
    /* base, sky, ground, light. The blue-grey sits high where a rain-washed
       sky belongs; the leaf green carries the ground the words stand on. */
    palette: ['#2C4A28', '#94A7A8', '#54792F', '#EFE4C0'],
    warmth: 0.82,
    anchor: 'right',
    fx: 'none',

    artworkWide: ART + 'peengh-wide',
    artworkTall: ART + 'peengh-tall',
    /* Left at centre: shifting either way either pushes the swing under the
       heading or opens a dead strip of field at the left edge. */
    focus: '50% 50%',
    focusTall: '50% 50%',
    alt:
      'A rope swing hung from a peepal in open ground beside flooded paddy. A ' +
      'woman in green sits on the plank with her hands on the ropes and her ' +
      'juttian left on the brick; three others stand watching, hands raised, ' +
      'henna on their palms.',

    /* One recording rather than a selection: "Agg Paniyan Ch", Surinder Kaur.
       Set youtubeVideoId and leave youtubePlaylistId empty for a single track —
       previous and next then disable themselves, because there is nothing for
       them to move between. */
    youtubePlaylistId: '',
    youtubeVideoId: '6LCDyXjhWRc',
    youtubePlaylistUrl: '',
  },

  {
    id: 'giddha',
    nameGurmukhi: 'ਗਿੱਧਾ',
    nameRoman: 'Giddha',
    nameEnglish: 'The Circle',

    copy:
      'The circle forms and the dholki starts. One woman sings a boli; the ring ' +
      'claps it back.',

    detail:
      'Giddha is built on the boli, and the boli is built on the fact that the ' +
      'circle answers. A woman steps in, sings a line or a couplet, and on the ' +
      'last line the ring comes in with clapping and takes it over. Then she ' +
      'dances, or two dance, and someone else steps in with the next one. The ' +
      'drum is a dholki; often there is no drum at all and the clapping does ' +
      'the work.\n\n' +
      'The boliyan are anonymous, improvised and endlessly recombined. Some are ' +
      'about the monsoon and the peengh. A great many are about the household: ' +
      'the mother-in-law, the husband’s sister, the husband who went off to ' +
      'work and has not written. They are often blunt, often obscene and often ' +
      'very funny, and that is the point — inside the circle, women say things ' +
      'that are not sayable in the courtyard the rest of the year.\n\n' +
      'It is the loudest part of Teeyan and the last. When the giddha stops, ' +
      'the month is nearly over.',

    boli: {
      punjabi: 'Bari barsi khattan gya si, khatt ke liyanda…',
      english: 'Twelve years I was away earning. What I brought back was…',
      note: 'The opening every circle knows. The closing line is improvised and never twice the same — that is the form, not a gap in the record.',
    },

    accentColor: '#F0A63A',
    palette: ['#3A0F14', '#9E2029', '#D6246E', '#E9B23C'],
    warmth: 1.0,
    anchor: 'centre',
    fx: 'motes',

    artworkWide: ART + 'giddha-wide',
    artworkTall: ART + 'giddha-tall',
    focus: '50% 50%',
    focusTall: '50% 50%',
    alt:
      'A courtyard at dusk under strung bulbs and marigold garlands. A woman ' +
      'plays the dholki at the left while the ring claps; two dancers have ' +
      'stepped into the middle with hands clasped, over a floor marked with ' +
      'chalk and scattered petals.',

    youtubePlaylistId: 'PLKiotipvT0v4dRdQ1YBHeRReK3YWMYfQK',
    youtubePlaylistUrl: '',
  },
];

/* Shown in the colophon at the end of the last section. Kept here so the
   credits sit beside the material they credit. */
export const CREDITS = [
  'Teeyan is held across Punjab through Sawan, the monsoon month that falls ' +
  'between mid-July and mid-August. The lok geet and the boli quoted here are ' +
  'anonymous oral tradition.',

  'Music is embedded from YouTube. Every recording stays credited to the artist ' +
  'and channel that published it; nothing is re-hosted here.',

  'Wordmark set in Noto Serif Gurmukhi and converted to outlines. Headings set ' +
  'in the same face as live text. Latin text set in Fraunces and Karla. All ' +
  'under the SIL Open Font License.',
];
