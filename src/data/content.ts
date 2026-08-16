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
    posts: [],
  },
  {
    id: "practices",
    name: "Best Practices by Trade",
    description: "Share discoveries, methods, and standards that raise the bar in each trade.",
    membersOnly: true,
    posts: [],
  },
  {
    id: "showcase",
    name: "Specialty Showcase",
    description: "Highlight your specialty work and educate peers on niche capabilities.",
    membersOnly: true,
    posts: [],
  },
];

export type BidPost = {
  id: string;
  title: string;
  tradeNeeded: string;
  location: string;
  details: string;
  contact: string;
  author: string;
  company: string;
  date: string;
};

export type BlacklistPartyType = "customer" | "contractor";

export type BlacklistStatus = "pending" | "approved" | "rejected";

export type BlacklistEntry = {
  id: string;
  partyType: BlacklistPartyType;
  name: string;
  company: string;
  reason: string;
  reportedBy: string;
  reportedCompany: string;
  date: string;
  status: BlacklistStatus;
  reviewedBy?: string;
  reviewedDate?: string;
};
