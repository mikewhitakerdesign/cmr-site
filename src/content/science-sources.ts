/**
 * Sources for The Science page (/the-science).
 *
 * Every record was checked on 2026-11-09 against its PubMed record (NCBI
 * E-utilities) or, for the one article not indexed there, its Crossref record:
 * authors, title, journal, year, volume, issue, pages and DOI are copied from
 * those records, not from memory. The page's claims were written from each
 * article's published abstract (and, for Lu et al. 2025, its full text on PMC).
 * See .aiom/work/implement-cmr-the-science-page.md for the verification log.
 *
 * Order is the order of first citation on the page, so inline numbers read
 * [1], [2], [3]… from top to bottom. Each `id` is a stable anchor
 * (`#source-<id>`) used by the inline citations.
 */
export type ScienceSource = {
  id: string;
  /** Vancouver style: up to six authors, then "et al." */
  authors: string;
  title: string;
  journal: string;
  year: number;
  /** "93(3):1039–1046", "13:1690023" — volume(issue):pages or article number. */
  locator: string;
  doi: string;
  pmid?: string;
  pmcid?: string;
  /** Short topic designation shown with the entry. */
  topic: string;
  /** Study design, as the record or abstract describes it. */
  design: string;
};

export const SCIENCE_SOURCES: ScienceSource[] = [
  {
    id: "minetti-2002",
    authors: "Minetti AE, Moia C, Roi GS, Susta D, Ferretti G",
    title: "Energy cost of walking and running at extreme uphill and downhill slopes",
    journal: "Journal of Applied Physiology",
    year: 2002,
    locator: "93(3):1039–1046",
    doi: "10.1152/japplphysiol.01177.2001",
    pmid: "12183501",
    topic: "Energy cost",
    design: "Laboratory study",
  },
  {
    id: "lu-2025",
    authors: "Lu Z, Suo B, Deng L, Wang J, Fu W, Zhong Y, et al.",
    title: "A review of uphill and downhill running: biomechanics, physiology and modulating factors",
    journal: "Frontiers in Bioengineering and Biotechnology",
    year: 2025,
    locator: "13:1690023",
    doi: "10.3389/fbioe.2025.1690023",
    pmid: "41209300",
    pmcid: "PMC12592170",
    topic: "Graded running",
    design: "Narrative review",
  },
  {
    id: "vernillo-2020",
    authors: "Vernillo G, Martinez A, Baggaley M, Khassetarash A, Giandolini M, Horvais N, et al.",
    title: "Biomechanics of graded running: Part I - Stride parameters, external forces, muscle activations",
    journal: "Scandinavian Journal of Medicine & Science in Sports",
    year: 2020,
    locator: "30(9):1632–1641",
    doi: "10.1111/sms.13708",
    pmid: "32396672",
    topic: "Biomechanics",
    design: "Laboratory study",
  },
  {
    id: "khassetarash-2020",
    authors: "Khassetarash A, Vernillo G, Martinez A, Baggaley M, Giandolini M, Horvais N, et al.",
    title: "Biomechanics of graded running: Part II - Joint kinematics and kinetics",
    journal: "Scandinavian Journal of Medicine & Science in Sports",
    year: 2020,
    locator: "30(9):1642–1654",
    doi: "10.1111/sms.13735",
    pmid: "32485036",
    topic: "Biomechanics",
    design: "Laboratory study",
  },
  {
    id: "tham-2026",
    authors: "Tham SK, Shager K, Murugiah M, Nguyen M, Wibawa JC, Ahmad MA",
    title:
      "Effects of uphill running on muscle strength, jumping performance, running time, and aerobic capacity outcomes in athletes and recreational adults: a systematic review and meta-analysis",
    journal: "Medicine",
    year: 2026,
    locator: "105(31):e49977",
    doi: "10.1097/MD.0000000000049977",
    pmid: "42536523",
    pmcid: "PMC13433027",
    topic: "Hill training",
    design: "Systematic review and meta-analysis",
  },
  {
    id: "barnes-2013",
    authors: "Barnes KR, Hopkins WG, McGuigan MR, Kilding AE",
    title: "Effects of different uphill interval-training programs on running economy and performance",
    journal: "International Journal of Sports Physiology and Performance",
    year: 2013,
    locator: "8(6):639–647",
    doi: "10.1123/ijspp.8.6.639",
    pmid: "23538293",
    topic: "Hill training",
    design: "Randomized training study",
  },
  {
    id: "sheel-2012",
    authors: "Sheel AW, Romer LM",
    title: "Ventilation and respiratory mechanics",
    journal: "Comprehensive Physiology",
    year: 2012,
    locator: "2(2):1093–1142",
    doi: "10.1002/cphy.c100046",
    pmid: "23798297",
    topic: "Breathing mechanics",
    design: "Review",
  },
  {
    id: "shao-2024",
    authors: "Shao R, Man ISC, Lee TMC",
    title: "The effect of slow-paced breathing on cardiovascular and emotion functions: a meta-analysis and systematic review",
    journal: "Mindfulness",
    year: 2024,
    locator: "15(1):1–18",
    doi: "10.1007/s12671-023-02294-2",
    topic: "Slow breathing",
    design: "Systematic review and meta-analysis",
  },
  {
    id: "zaccaro-2018",
    authors: "Zaccaro A, Piarulli A, Laurino M, Garbella E, Menicucci D, Neri B, et al.",
    title: "How breath-control can change your life: a systematic review on psycho-physiological correlates of slow breathing",
    journal: "Frontiers in Human Neuroscience",
    year: 2018,
    locator: "12:353",
    doi: "10.3389/fnhum.2018.00353",
    pmid: "30245619",
    pmcid: "PMC6137615",
    topic: "Slow breathing",
    design: "Systematic review",
  },
  {
    id: "balban-2023",
    authors: "Balban MY, Neri E, Kogon MM, Weed L, Nouriani B, Jo B, et al.",
    title: "Brief structured respiration practices enhance mood and reduce physiological arousal",
    journal: "Cell Reports Medicine",
    year: 2023,
    locator: "4(1):100895",
    doi: "10.1016/j.xcrm.2022.100895",
    pmid: "36630953",
    pmcid: "PMC9873947",
    topic: "Breathwork",
    design: "Randomized controlled trial",
  },
  {
    id: "rupp-2019",
    authors: "Rupp T, Saugy JJ, Bourdillon N, Verges S, Millet GP",
    title: "Positive expiratory pressure improves arterial and cerebral oxygenation in acute normobaric and hypobaric hypoxia",
    journal: "American Journal of Physiology: Regulatory, Integrative and Comparative Physiology",
    year: 2019,
    locator: "317(5):R754–R762",
    doi: "10.1152/ajpregu.00025.2019",
    pmid: "31530174",
    topic: "Altitude",
    design: "Randomized crossover study",
  },
  {
    id: "luks-2024",
    authors: "Luks AM, Beidleman BA, Freer L, Grissom CK, Keyes LE, McIntosh SE, et al.",
    title:
      "Wilderness Medical Society clinical practice guidelines for the prevention, diagnosis, and treatment of acute altitude illness: 2024 update",
    journal: "Wilderness & Environmental Medicine",
    year: 2024,
    locator: "35(1 Suppl):2S–19S",
    doi: "10.1016/j.wem.2023.05.013",
    pmid: "37833187",
    topic: "Altitude",
    design: "Clinical practice guideline",
  },
  {
    id: "rupp-2021",
    authors: "Rupp T, Maufrais C, Walther G, Esteve F, Macdonald JH, Bouzat P, et al.",
    title: "MEDEX 2015: prophylactic effects of positive expiratory pressure in trekkers at very high altitude",
    journal: "Frontiers in Physiology",
    year: 2021,
    locator: "12:710622",
    doi: "10.3389/fphys.2021.710622",
    pmid: "34621182",
    pmcid: "PMC8490760",
    topic: "Altitude",
    design: "Field study",
  },
  {
    id: "zhai-2026",
    authors: "Zhai W, Zhai Q, Peng Y",
    title:
      "Psychological skills and mindfulness for distance runners: a systematic review of performance, psychological outcomes, and implications for coaching practice",
    journal: "Frontiers in Psychology",
    year: 2026,
    locator: "17:1971379",
    doi: "10.3389/fpsyg.2026.1971379",
    pmid: "42845566",
    pmcid: "PMC13642014",
    topic: "Runner psychology",
    design: "Systematic review",
  },
  {
    id: "pageaux-2016",
    authors: "Pageaux B",
    title: "Perception of effort in exercise science: definition, measurement and perspectives",
    journal: "European Journal of Sport Science",
    year: 2016,
    locator: "16(8):885–894",
    doi: "10.1080/17461391.2016.1188992",
    pmid: "27240002",
    topic: "Perceived effort",
    design: "Review",
  },
  {
    id: "singh-2023",
    authors: "Singh B, Olds T, Curtis R, Dumuid D, Virgara R, Watson A, et al.",
    title: "Effectiveness of physical activity interventions for improving depression, anxiety and distress: an overview of systematic reviews",
    journal: "British Journal of Sports Medicine",
    year: 2023,
    locator: "57(18):1203–1209",
    doi: "10.1136/bjsports-2022-106195",
    pmid: "36796860",
    pmcid: "PMC10579187",
    topic: "Mental health",
    design: "Umbrella review",
  },
  {
    id: "noetel-2024",
    authors: "Noetel M, Sanders T, Gallardo-Gómez D, Taylor P, del Pozo Cruz B, van den Hoek D, et al.",
    title: "Effect of exercise for depression: systematic review and network meta-analysis of randomised controlled trials",
    journal: "BMJ",
    year: 2024,
    locator: "384:e075847",
    doi: "10.1136/bmj-2023-075847",
    pmid: "38355154",
    pmcid: "PMC10870815",
    topic: "Mental health",
    design: "Systematic review and network meta-analysis",
  },
  {
    id: "singh-2025",
    authors: "Singh B, Bennett H, Miatke A, Dumuid D, Curtis R, Ferguson T, et al.",
    title: "Effectiveness of exercise for improving cognition, memory and executive function: a systematic umbrella review and meta-meta-analysis",
    journal: "British Journal of Sports Medicine",
    year: 2025,
    locator: "59(12):866–876",
    doi: "10.1136/bjsports-2024-108589",
    pmid: "40049759",
    pmcid: "PMC12229068",
    topic: "Cognition",
    design: "Umbrella review and meta-meta-analysis",
  },
  {
    id: "meeusen-2013",
    authors: "Meeusen R, Duclos M, Foster C, Fry A, Gleeson M, Nieman D, et al.",
    title:
      "Prevention, diagnosis, and treatment of the overtraining syndrome: joint consensus statement of the European College of Sport Science and the American College of Sports Medicine",
    journal: "Medicine & Science in Sports & Exercise",
    year: 2013,
    locator: "45(1):186–205",
    doi: "10.1249/MSS.0b013e318279a10a",
    pmid: "23247672",
    topic: "Training load",
    design: "Consensus statement",
  },
  {
    id: "bontemps-2020",
    authors: "Bontemps B, Vercruyssen F, Gruet M, Louis J",
    title: "Downhill running: what are the effects and how can we adapt? A narrative review",
    journal: "Sports Medicine",
    year: 2020,
    locator: "50(12):2083–2110",
    doi: "10.1007/s40279-020-01355-z",
    pmid: "33037592",
    pmcid: "PMC7674385",
    topic: "Downhill running",
    design: "Narrative review",
  },
  {
    id: "hyldahl-2017",
    authors: "Hyldahl RD, Chen TC, Nosaka K",
    title: "Mechanisms and mediators of the skeletal muscle repeated bout effect",
    journal: "Exercise and Sport Sciences Reviews",
    year: 2017,
    locator: "45(1):24–33",
    doi: "10.1249/JES.0000000000000095",
    pmid: "27782911",
    topic: "Repeated-bout effect",
    design: "Review",
  },
  {
    id: "bontemps-2025",
    authors: "Bontemps B, Louis J, Owens DJ, Miríc S, Vercruyssen F, Gruet M, et al.",
    title: "Muscle soreness but not neuromuscular fatigue responses following downhill running differ according to the number of exercise bouts",
    journal: "European Journal of Sport Science",
    year: 2025,
    locator: "25(3):e12240",
    doi: "10.1002/ejsc.12240",
    pmid: "39992182",
    pmcid: "PMC11849091",
    topic: "Downhill running",
    design: "Repeated-exposure training study",
  },
];

export type ScienceSourceId = (typeof SCIENCE_SOURCES)[number]["id"];

/** 1-based citation number, by first appearance. Throws on an unknown id so a typo fails the build. */
export function sourceNumber(id: string): number {
  const i = SCIENCE_SOURCES.findIndex((s) => s.id === id);
  if (i < 0) throw new Error(`Unknown science source: ${id}`);
  return i + 1;
}

export function sourceById(id: string): ScienceSource {
  return SCIENCE_SOURCES[sourceNumber(id) - 1];
}

/** "Minetti et al., 2002", "Sheel and Romer, 2012", "Pageaux, 2016": the short label used in accessible names. */
export function shortCitation(s: ScienceSource): string {
  const names = s.authors.split(",").map((a) => a.trim().split(" ")[0]);
  const who = names.length === 1 ? names[0] : names.length === 2 ? `${names[0]} and ${names[1]}` : `${names[0]} et al.`;
  return `${who}, ${s.year}`;
}

export const sourceAnchor = (id: string) => `source-${id}`;
