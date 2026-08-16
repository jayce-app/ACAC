export const vision = {
  title: "Vision",
  text: "We are committed to elevating the integrity of the construction industry in our community. We are here to be a hub for contractors and the community alike; promoting networking, education, and support.",
};

export const about = {
  title: "About Us",
  paragraphs: [
    "Founded by contractors in an effort to give back to the community. There is no licensing for general contractors in Texas at a state level. We support freedom and personal liberty, but we have been witness to many utilizing freedom without being responsible.",
    "Our membership is made up of only professionals that have been vetted through our system. Our goal is to give credibility to the pros that deserve it and promote ethics throughout.",
  ],
};

export const goals = [
  {
    title: "Home base for contractors",
    text: "Be a home base for contractors in our county to network, support, and educate each other.",
  },
  {
    title: "Accountability",
    text: "Allow the membership to also blacklist notable wrongdoings.",
  },
  {
    title: "Best practices",
    text: "Provide a platform for contractors to discover and disclose new practices and best practices in each trade.",
  },
  {
    title: "Showcase specialty",
    text: "Provide a platform for contractors to showcase their specialty within the industry.",
  },
  {
    title: "Education for all",
    text: "Provide seminars and educational opportunities for the construction industry here in our county available to all willing to attend.",
  },
];

export type MemberAd = {
  id: string;
  business: string;
  specialty: string;
  owner: string;
  blurb: string;
  phone: string;
  website?: string;
};

export const memberAds: MemberAd[] = [
  {
    id: "1",
    business: "Lone Star Framing Co.",
    specialty: "Residential Framing",
    owner: "Marcus Hale",
    blurb: "Precision stick-frame and metal framing for custom homes across Austin County.",
    phone: "(979) 555-0142",
  },
  {
    id: "2",
    business: "Brazos Bend Electric",
    specialty: "Electrical",
    owner: "Elena Ruiz",
    blurb: "Licensed electrical work for new builds, remodels, and commercial service upgrades.",
    phone: "(979) 555-0188",
  },
  {
    id: "3",
    business: "Prairie Oak Cabinetry",
    specialty: "Finish Carpentry",
    owner: "James Whitaker",
    blurb: "Custom millwork and cabinetry built in Bellville for kitchens, baths, and built-ins.",
    phone: "(979) 555-0117",
  },
  {
    id: "4",
    business: "Sealy Concrete Works",
    specialty: "Concrete & Flatwork",
    owner: "Devin Carter",
    blurb: "Foundations, driveways, and decorative flatwork with schedule-driven crews.",
    phone: "(979) 555-0163",
  },
];

export type PermitLink = {
  name: string;
  jurisdiction: string;
  description: string;
  url: string;
};

export const permitLinks: PermitLink[] = [
  {
    name: "Austin County Permits",
    jurisdiction: "Austin County",
    description:
      "Development, septic (OSSF), driveway culvert, and subdivision applications for unincorporated areas.",
    url: "https://www.austincounty.com/page/austin.permits",
  },
  {
    name: "Austin County Permit Guidelines",
    jurisdiction: "Austin County",
    description: "Official guidelines for obtaining permits in Austin County (PDF).",
    url: "https://www.austincounty.com/upload/page/0130/Temp%20GUIDELINES%20FOR%20OBTAINING%20PERMITS%20IN%20AUSTIN%20COUNTY%202025R1.pdf",
  },
  {
    name: "911 Rural Addressing",
    jurisdiction: "Austin County ECD",
    description: "Obtain a 911 address required for many county development permits.",
    url: "https://www.austincounty911.net/permits-property-information",
  },
  {
    name: "City of Bellville Permits & Inspections",
    jurisdiction: "City of Bellville",
    description: "Building, plumbing, mechanical, and electrical permit information and forms.",
    url: "https://www.cityofbellville.com/page/city.permits_inspections",
  },
  {
    name: "City of Sealy Permit Applications",
    jurisdiction: "City of Sealy",
    description: "Central list of planning, building, and license permit applications.",
    url: "https://www.ci.sealy.tx.us/residents/permit_forms.php",
  },
  {
    name: "City of Sealy Building & Inspection",
    jurisdiction: "City of Sealy",
    description: "Building codes, plan review checklists, and inspection process details.",
    url: "https://www.ci.sealy.tx.us/departments/planning_and_community_development/building_and_inspection.php",
  },
  {
    name: "City of Wallis Permits",
    jurisdiction: "City of Wallis",
    description: "Building permits and contractor registration requirements for Wallis.",
    url: "https://www.wallistexas.org/page/permits",
  },
];

export type BoardPost = {
  id: string;
  author: string;
  company: string;
  title: string;
  body: string;
  date: string;
};

export type DiscussionBoard = {
  id: string;
  name: string;
  description: string;
  membersOnly: true;
  posts: BoardPost[];
};

export const discussionBoards: DiscussionBoard[] = [
  {
    id: "networking",
    name: "Networking & Support",
    description: "Connect with fellow members for crew swaps, referrals, and jobsite help.",
    membersOnly: true,
    posts: [
      {
        id: "n1",
        author: "Marcus Hale",
        company: "Lone Star Framing Co.",
        title: "Looking for a reliable concrete crew mid-September",
        body: "Have a custom home outside Bellville needing a slab pour the week of Sept 15. Prefer ACAC members. Message me if your crew has availability.",
        date: "2026-08-10",
      },
      {
        id: "n2",
        author: "Elena Ruiz",
        company: "Brazos Bend Electric",
        title: "Apprentice mentorship meetup",
        body: "Hosting a Saturday morning walkthrough on service upgrades for apprentices. All vetted members welcome to bring one trainee.",
        date: "2026-08-08",
      },
    ],
  },
  {
    id: "practices",
    name: "Best Practices by Trade",
    description: "Share discoveries, methods, and standards that raise the bar in each trade.",
    membersOnly: true,
    posts: [
      {
        id: "p1",
        author: "James Whitaker",
        company: "Prairie Oak Cabinetry",
        title: "Moisture control tips for coastal humidity",
        body: "We have been using a different acclimation window for maple before install. Happy to share the checklist we use on Sealy jobs.",
        date: "2026-08-12",
      },
    ],
  },
  {
    id: "accountability",
    name: "Accountability & Blacklist",
    description: "Report notable wrongdoings for membership review. Facts only — no speculation.",
    membersOnly: true,
    posts: [
      {
        id: "a1",
        author: "Board Admin",
        company: "ACAC",
        title: "How to submit an accountability report",
        body: "Use this board to document verified issues: missing payments to subs, abandoned jobs, forged insurance, or unsafe practices. Include dates, jurisdictions, and documentation when possible. The board reviews before any public action.",
        date: "2026-07-01",
      },
    ],
  },
  {
    id: "showcase",
    name: "Specialty Showcase",
    description: "Highlight your specialty work and educate peers on niche capabilities.",
    membersOnly: true,
    posts: [
      {
        id: "s1",
        author: "Devin Carter",
        company: "Sealy Concrete Works",
        title: "Stamped patio finish portfolio — summer 2026",
        body: "Posted photos from three recent patio pours using integral color. Happy to walk members through the release technique we settled on.",
        date: "2026-08-05",
      },
    ],
  },
];
