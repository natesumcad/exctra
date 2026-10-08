/*
 * Approximate admissions figures for estimating chances, rounded from recent public
 * Common Data Set and college-reported numbers. They drift every year; treat as ballpark.
 * Row: name | state | admit rate % | SAT 25th | SAT 75th | typical unweighted GPA | test policy | tough majors
 * Test policy: R = required, O = optional, B = blind (scores not considered).
 * Tough majors: code:level, where level 1 = more competitive, 2 = much more competitive than the school overall.
 */

export type TestPolicy = "required" | "optional" | "blind";
export type ProgramKey = "cs" | "eng" | "nur" | "bus";

export interface College {
  slug: string;
  name: string;
  state: string;
  admitRate: number; // 0..1
  sat: [number, number] | null;
  gpa: number;
  policy: TestPolicy;
  tough: Partial<Record<ProgramKey, 1 | 2>>;
}

const ROWS = `
Harvard University|MA|3.6|1500|1580|3.95|R|
Stanford University|CA|3.9|1510|1570|3.95|R|
Massachusetts Institute of Technology|MA|4.5|1520|1580|3.95|R|
Yale University|CT|4.6|1500|1580|3.95|R|
Princeton University|NJ|4.6|1500|1570|3.95|R|
Columbia University|NY|3.9|1500|1560|3.95|O|
California Institute of Technology|CA|3.1|1530|1580|3.97|R|
Brown University|RI|5.2|1510|1570|3.94|R|
University of Pennsylvania|PA|5.8|1500|1570|3.92|R|bus:1
Dartmouth College|NH|5.4|1500|1570|3.92|R|
Duke University|NC|5.7|1510|1570|3.94|O|
University of Chicago|IL|4.8|1510|1570|3.93|O|
Cornell University|NY|8.4|1480|1550|3.9|R|cs:1,bus:1
Johns Hopkins University|MD|6.3|1530|1560|3.93|R|
Northwestern University|IL|7.2|1500|1560|3.92|O|
Vanderbilt University|TN|5.6|1500|1570|3.9|O|
Rice University|TX|7.9|1500|1570|3.92|O|
Georgetown University|DC|12.9|1410|1540|3.9|R|
Carnegie Mellon University|PA|11.3|1500|1560|3.9|O|cs:2
Washington University in St. Louis|MO|12|1500|1560|3.9|O|
Emory University|GA|11.5|1440|1540|3.88|O|nur:1
University of Notre Dame|IN|12.9|1450|1550|3.9|O|
University of Southern California|CA|10|1450|1540|3.85|O|cs:1
New York University|NY|9.2|1470|1570|3.8|O|bus:1
Tufts University|MA|9.7|1460|1550|3.88|O|
Northeastern University|MA|5.6|1470|1550|3.88|O|
Boston University|MA|11|1430|1530|3.88|O|
Boston College|MA|15.4|1450|1530|3.88|O|
Tulane University|LA|13.4|1440|1530|3.8|O|
Williams College|MA|10|1480|1560|3.9|O|
Amherst College|MA|9|1490|1560|3.9|O|
Pomona College|CA|7|1470|1550|3.9|O|
Swarthmore College|PA|7|1480|1560|3.9|O|
Bowdoin College|ME|7|1480|1550|3.9|O|
Wellesley College|MA|14|1440|1550|3.88|O|
Middlebury College|VT|11|1440|1540|3.88|O|
Harvey Mudd College|CA|13|1500|1560|3.9|O|
University of California, Los Angeles|CA|9|||3.92|B|cs:2,nur:2,eng:1
University of California, Berkeley|CA|11.6|||3.9|B|cs:2,eng:1,bus:1
University of California, San Diego|CA|24.8|||3.88|B|cs:2,eng:1
University of California, Irvine|CA|26|||3.85|B|cs:1,nur:2
University of California, Santa Barbara|CA|26|||3.86|B|eng:1
University of California, Davis|CA|42|||3.8|B|cs:1
California Polytechnic State University, San Luis Obispo|CA|30|||3.85|B|cs:2,eng:1
San Diego State University|CA|39|||3.75|B|nur:2
University of Michigan|MI|18|1350|1530|3.88|O|cs:1,bus:1
University of Virginia|VA|16.8|1400|1530|3.9|O|cs:1
University of North Carolina at Chapel Hill|NC|16.8|1370|1510|3.9|O|bus:1,nur:1
Georgia Institute of Technology|GA|17|1370|1530|3.9|R|cs:1,eng:1
University of Texas at Austin|TX|29|1230|1480|3.8|R|cs:2,bus:2,eng:1,nur:1
University of Florida|FL|24|1330|1470|3.9|R|cs:1,eng:1
University of Georgia|GA|37|1250|1450|3.9|R|
University of Illinois Urbana-Champaign|IL|44|1340|1510|3.8|O|cs:2,eng:1
University of Washington|WA|43|1250|1480|3.8|O|cs:2,eng:1,nur:1
University of Wisconsin-Madison|WI|43|1370|1480|3.85|O|
Purdue University|IN|50|1190|1430|3.7|R|cs:1,eng:1,nur:1
University of Maryland, College Park|MD|44|1370|1510|3.85|O|cs:2,eng:1
Ohio State University|OH|57|1310|1440|3.8|O|nur:1
Pennsylvania State University|PA|55|1180|1370|3.6|O|nur:1,eng:1
Rutgers University-New Brunswick|NJ|66|1250|1470|3.7|O|nur:1
Virginia Tech|VA|57|1210|1390|3.75|O|cs:1,eng:1
Texas A&M University|TX|63|1180|1390|3.7|O|eng:1
University of Minnesota Twin Cities|MN|75|1250|1460|3.7|O|
University of Massachusetts Amherst|MA|58|1270|1450|3.75|O|cs:1,nur:1
University of Pittsburgh|PA|49|1260|1430|3.75|O|nur:1
Clemson University|SC|38|1270|1420|3.8|O|nur:1,eng:1
University of Connecticut|CT|54|1240|1420|3.7|O|nur:1
University of Miami|FL|19|1360|1480|3.8|O|
Wake Forest University|NC|21|1370|1500|3.8|O|
George Washington University|DC|44|1370|1510|3.75|O|
Fordham University|NY|54|1370|1490|3.7|O|
Syracuse University|NY|42|1260|1430|3.65|O|
University of Rochester|NY|39|1380|1530|3.8|O|
Case Western Reserve University|OH|29|1450|1540|3.85|O|
Lehigh University|PA|29|1340|1470|3.75|O|
Binghamton University (SUNY)|NY|39|1330|1470|3.75|O|
Stony Brook University (SUNY)|NY|49|1310|1470|3.75|O|cs:1,nur:1
Indiana University Bloomington|IN|80|1180|1380|3.75|O|bus:1
Auburn University|AL|49|1180|1360|3.75|O|eng:1
University of Alabama|AL|76|1090|1360|3.65|O|
Michigan State University|MI|84|1080|1290|3.6|O|
University of Colorado Boulder|CO|81|1160|1380|3.6|O|
University of Oregon|OR|86|1100|1320|3.6|O|
Arizona State University|AZ|90|1110|1350|3.5|O|
University of Arizona|AZ|86|1120|1360|3.5|O|nur:1
Howard University|DC|35|1130|1300|3.6|O|
Spelman College|GA|28|1100|1260|3.7|O|
Your local community college (transfer pathway)|US|100|||0|B|
`;

const PROGRAMS = new Set(["cs", "eng", "nur", "bus"]);

export const slugifyCollege = (name: string) =>
  name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const COLLEGES: College[] = ROWS.trim().split("\n").map((line) => {
  const [name, state, rate, s25, s75, gpa, pol, tough = ""] = line.split("|");
  const toughMap: College["tough"] = {};
  for (const part of tough.split(",").filter(Boolean)) {
    const [k, lvl] = part.split(":");
    if (!PROGRAMS.has(k) || (lvl !== "1" && lvl !== "2")) throw new Error(`Bad program code in: ${line}`);
    toughMap[k as ProgramKey] = Number(lvl) as 1 | 2;
  }
  return {
    slug: slugifyCollege(name),
    name,
    state,
    admitRate: Number(rate) / 100,
    sat: s25 && s75 ? [Number(s25), Number(s75)] : null,
    gpa: Number(gpa),
    policy: pol === "R" ? "required" : pol === "B" ? "blind" : "optional",
    tough: toughMap,
  };
});

export const STATES = [...new Set(COLLEGES.map((c) => c.state))].filter((s) => s !== "US").sort();
