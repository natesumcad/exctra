export const MAJORS = [
  "Computer Science",
  "Engineering",
  "Biology / Pre-Med",
  "Chemistry / Physics",
  "Mathematics",
  "Business / Economics",
  "Political Science / Law",
  "Psychology",
  "English / Writing",
  "Journalism / Media",
  "Art / Design",
  "Music / Performing Arts",
  "Environmental Science",
  "Education",
  "Undecided",
] as const;
export type Major = (typeof MAJORS)[number];

export const STRENGTHS = [
  "Leadership",
  "Public speaking",
  "Writing",
  "Math & logic",
  "Coding",
  "Building / hands-on",
  "Research",
  "Creativity",
  "Teamwork",
  "Empathy / helping others",
  "Organization",
  "Competition",
] as const;
export type Strength = (typeof STRENGTHS)[number];

export const CATEGORIES = [
  "STEM",
  "Health",
  "Business",
  "Civics & Debate",
  "Writing & Media",
  "Arts",
  "Environment",
  "Service",
  "Athletics",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Commitment = "low" | "medium" | "high";

export interface EC {
  name: string;
  category: Category;
  description: string;
  majors: Major[];
  strengths: Strength[];
  commitment: Commitment;
  tip: string;
}

export const ECS: EC[] = [
  { name: "Competitive Programming (USACO)", category: "STEM", description: "Solve algorithmic problems in online contests and climb divisions.", majors: ["Computer Science", "Mathematics"], strengths: ["Coding", "Math & logic", "Competition"], commitment: "medium", tip: "Start at Bronze; past problems are free on usaco.org." },
  { name: "Hackathons", category: "STEM", description: "Build a project with a team in 24–48 hours.", majors: ["Computer Science", "Engineering", "Business / Economics"], strengths: ["Coding", "Teamwork", "Creativity"], commitment: "low", tip: "MLH lists student hackathons, many virtual." },
  { name: "Personal App / Open Source Project", category: "STEM", description: "Ship something real that people use, or contribute to open source.", majors: ["Computer Science", "Engineering"], strengths: ["Coding", "Creativity", "Building / hands-on"], commitment: "medium", tip: "Solve a problem at your own school. Real users make a great story." },
  { name: "Robotics Team (FRC / FTC / VEX)", category: "STEM", description: "Design, build and program robots for competitions.", majors: ["Engineering", "Computer Science"], strengths: ["Building / hands-on", "Teamwork", "Coding", "Competition"], commitment: "high", tip: "Non-technical roles (outreach, business) count too." },
  { name: "Science Olympiad", category: "STEM", description: "Team competition across 23 STEM events.", majors: ["Biology / Pre-Med", "Chemistry / Physics", "Engineering", "Environmental Science"], strengths: ["Research", "Teamwork", "Competition", "Building / hands-on"], commitment: "medium", tip: "Pick events that match your intended major." },
  { name: "Math Competitions (AMC / AIME)", category: "STEM", description: "Individual problem-solving contests leading to olympiad levels.", majors: ["Mathematics", "Computer Science", "Chemistry / Physics"], strengths: ["Math & logic", "Competition"], commitment: "low", tip: "Art of Problem Solving has great prep resources." },
  { name: "Independent Research / Science Fair", category: "STEM", description: "Run your own research project, enter ISEF/regional fairs.", majors: ["Biology / Pre-Med", "Chemistry / Physics", "Environmental Science", "Psychology", "Engineering"], strengths: ["Research", "Writing", "Math & logic"], commitment: "high", tip: "Cold-email local professors with a specific, short ask." },
  { name: "Hospital / Clinic Volunteering", category: "Health", description: "Volunteer in a healthcare setting with patients.", majors: ["Biology / Pre-Med", "Psychology"], strengths: ["Empathy / helping others", "Teamwork"], commitment: "medium", tip: "Consistency over years beats a single summer." },
  { name: "HOSA – Future Health Professionals", category: "Health", description: "Health-science competitions and leadership.", majors: ["Biology / Pre-Med"], strengths: ["Competition", "Public speaking", "Leadership"], commitment: "medium", tip: "Start a chapter if your school doesn't have one." },
  { name: "Crisis Text Line / Peer Counseling", category: "Health", description: "Train in peer support and mental-health listening.", majors: ["Psychology", "Education"], strengths: ["Empathy / helping others"], commitment: "medium", tip: "Many peer programs train students 16+." },
  { name: "DECA / FBLA", category: "Business", description: "Business case competitions, roleplays, and presentations.", majors: ["Business / Economics"], strengths: ["Public speaking", "Competition", "Leadership"], commitment: "medium", tip: "Roleplay events reward confident speaking." },
  { name: "Start a Small Business", category: "Business", description: "Sell a product or service and track real revenue.", majors: ["Business / Economics", "Art / Design"], strengths: ["Leadership", "Creativity", "Organization"], commitment: "high", tip: "Numbers (customers, revenue) make it concrete." },
  { name: "Economics Challenge / Investment Club", category: "Business", description: "Compete in econ contests or run a mock portfolio.", majors: ["Business / Economics", "Mathematics"], strengths: ["Math & logic", "Research", "Competition"], commitment: "low", tip: "The National Economics Challenge is free to enter." },
  { name: "Speech & Debate", category: "Civics & Debate", description: "Compete in policy, LD, public forum, or speech events.", majors: ["Political Science / Law", "English / Writing", "Business / Economics"], strengths: ["Public speaking", "Research", "Competition"], commitment: "high", tip: "Public Forum is the most beginner-friendly." },
  { name: "Model UN", category: "Civics & Debate", description: "Represent countries and negotiate resolutions.", majors: ["Political Science / Law", "Business / Economics"], strengths: ["Public speaking", "Teamwork", "Leadership"], commitment: "medium", tip: "Chairing a committee shows leadership." },
  { name: "Mock Trial", category: "Civics & Debate", description: "Play attorneys and witnesses in simulated trials.", majors: ["Political Science / Law", "English / Writing"], strengths: ["Public speaking", "Teamwork", "Competition"], commitment: "medium", tip: "Witness roles are great for theater kids too." },
  { name: "Student Government", category: "Civics & Debate", description: "Represent your class and run school initiatives.", majors: ["Political Science / Law", "Business / Economics", "Education"], strengths: ["Leadership", "Organization", "Public speaking"], commitment: "medium", tip: "Highlight one concrete thing you changed." },
  { name: "Local Campaign / Civic Internship", category: "Civics & Debate", description: "Work for a campaign, council member, or advocacy group.", majors: ["Political Science / Law"], strengths: ["Organization", "Teamwork", "Writing"], commitment: "medium", tip: "Local offices often welcome high-school volunteers." },
  { name: "School Newspaper / Yearbook", category: "Writing & Media", description: "Report, edit, and publish for your school.", majors: ["Journalism / Media", "English / Writing"], strengths: ["Writing", "Teamwork", "Organization"], commitment: "medium", tip: "Aim for an editor role by senior year." },
  { name: "Literary Magazine / Writing Contests", category: "Writing & Media", description: "Publish creative work; enter Scholastic, YoungArts, etc.", majors: ["English / Writing", "Art / Design"], strengths: ["Writing", "Creativity"], commitment: "low", tip: "Scholastic Art & Writing Awards are a big one." },
  { name: "Podcast or YouTube Channel", category: "Writing & Media", description: "Create media on a topic you care about.", majors: ["Journalism / Media", "Music / Performing Arts", "Business / Economics"], strengths: ["Creativity", "Public speaking", "Organization"], commitment: "medium", tip: "Pick a niche tied to your major." },
  { name: "Art Portfolio & Exhibitions", category: "Arts", description: "Build a portfolio and show work in galleries/contests.", majors: ["Art / Design"], strengths: ["Creativity", "Building / hands-on"], commitment: "high", tip: "Art schools review portfolios, so start early." },
  { name: "Theater / Drama Production", category: "Arts", description: "Act, direct, or run tech crew for shows.", majors: ["Music / Performing Arts", "English / Writing"], strengths: ["Creativity", "Teamwork", "Public speaking"], commitment: "high", tip: "Tech crew is great for engineers too." },
  { name: "Band / Orchestra / Choir", category: "Arts", description: "Perform in school or regional ensembles.", majors: ["Music / Performing Arts"], strengths: ["Creativity", "Teamwork"], commitment: "high", tip: "All-State auditions add a strong distinction." },
  { name: "Environmental Club / Restoration Projects", category: "Environment", description: "Lead cleanups, gardens, or sustainability campaigns.", majors: ["Environmental Science", "Biology / Pre-Med", "Political Science / Law"], strengths: ["Leadership", "Organization", "Building / hands-on"], commitment: "medium", tip: "Measure impact (lbs of trash, trees planted)." },
  { name: "Envirothon", category: "Environment", description: "Team competition on ecology, soils, forestry, and water.", majors: ["Environmental Science", "Biology / Pre-Med"], strengths: ["Research", "Teamwork", "Competition"], commitment: "medium", tip: "Great fit if you love being outdoors." },
  { name: "Tutoring / Teaching Younger Students", category: "Service", description: "Tutor peers or run a free class in your community.", majors: ["Education", "Mathematics", "English / Writing", "Undecided"], strengths: ["Empathy / helping others", "Leadership", "Public speaking"], commitment: "low", tip: "Starting a program > just joining one." },
  { name: "Camp Counselor / Youth Mentor", category: "Service", description: "Lead groups of kids in camps or mentorship programs.", majors: ["Education", "Psychology"], strengths: ["Leadership", "Empathy / helping others", "Teamwork"], commitment: "medium", tip: "Summer-only, so it fits busy school years." },
  { name: "Community Service Club (Key Club, etc.)", category: "Service", description: "Organize service projects in your community.", majors: ["Undecided", "Education", "Political Science / Law"], strengths: ["Empathy / helping others", "Organization", "Teamwork"], commitment: "low", tip: "Run for an officer position." },
  { name: "Part-Time Job", category: "Business", description: "Work a job. Colleges value responsibility.", majors: ["Undecided", "Business / Economics"], strengths: ["Organization", "Teamwork"], commitment: "medium", tip: "Jobs count as ECs; describe what you learned." },
  { name: "Varsity Sports", category: "Athletics", description: "Train and compete on a school team.", majors: ["Undecided", "Education", "Biology / Pre-Med"], strengths: ["Teamwork", "Competition", "Leadership"], commitment: "high", tip: "Captain roles show leadership." },
  { name: "Psychology Research Assistant / Survey Project", category: "Health", description: "Assist a lab or run your own survey study.", majors: ["Psychology", "Biology / Pre-Med"], strengths: ["Research", "Math & logic", "Writing"], commitment: "medium", tip: "Even a school-wide survey study is a solid start." },
  { name: "Physics / Chemistry Olympiad", category: "STEM", description: "Individual exams leading to national teams.", majors: ["Chemistry / Physics", "Engineering"], strengths: ["Math & logic", "Research", "Competition"], commitment: "low", tip: "F=ma and USNCO are the entry exams." },
  { name: "Design / Engineering Club (Maker Space)", category: "STEM", description: "Build gadgets, 3D print, and prototype ideas.", majors: ["Engineering", "Art / Design"], strengths: ["Building / hands-on", "Creativity"], commitment: "low", tip: "Document builds with photos for applications." },
];

export const slugify = (name: string) =>
  name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const findBySlug = (slug: string) => ECS.find((ec) => slugify(ec.name) === slug);

export const HOURS: Record<Commitment, string> = { low: "1 to 3 hrs/wk", medium: "4 to 8 hrs/wk", high: "9+ hrs/wk" };
