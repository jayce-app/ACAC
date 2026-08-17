export const company = {
  name: "TX Ropers Construction",
  legal: "TX Ropers Construction, LLC",
  owner: "Jayce Johnson",
  phone: "979-353-1292",
  phoneHref: "tel:9793531292",
  email: "sales@txropersconstruction.com",
  emailHref: "mailto:sales@txropersconstruction.com",
  address: "3016 Newsom Rd",
  city: "Bellville, Texas 77418",
  hoursWeekday: "Monday through Friday 8:00a – 5:00p",
  hoursWeekend: "Saturday and Sunday: Closed",
  hours: "Monday–Friday, 8:00 a.m.–5:00 p.m. · Closed Saturday & Sunday",
  facebook: "https://www.facebook.com/p/TX-Ropers-Construction-LLC-100089307615057/",
  /** Drop your real logo at public/logo.jpg — header, footer, and icons all use this path. */
  logo: "/logo.jpg",
  serviceArea:
    "Southeast Texas — primarily within about 50 miles of Bellville. We also travel for special projects.",
  tagline: "Turning Visions Into Reality",
  mission:
    "By providing a premium product and service, our goal is to help elevate the standard for our industry in our community. We are dedicated to our customers' satisfaction.",
};

export const residentialServices = [
  {
    id: "res-general",
    title: "General & new construction",
    text: "Custom residential builds from the ground up — not production homes. Most of the work stays with our own crew so the job stays coordinated and accountable.",
  },
  {
    id: "res-metal",
    title: "Metal buildings",
    text: "Shops, barns, covered arenas, and residential metal structures finished for real Texas use.",
  },
  {
    id: "res-site",
    title: "Dirt & site work",
    text: "Site prep, pads, grading, drainage, and dirt work so the ground is right before the building goes up.",
  },
];

export const commercialServices = [
  {
    id: "com-general",
    title: "General & new construction",
    text: "Commercial builds handled turnkey — one point of contact from start to finish, with our crew leading the work.",
  },
  {
    id: "com-steel",
    title: "Structural steel & metal framing",
    text: "Structural steel, metal buildings, and metal framing — with certified welders on the team.",
  },
  {
    id: "com-site",
    title: "Dirt & site work",
    text: "Commercial site prep, pads, and dirt work so the structure sits right the first time.",
  },
  {
    id: "com-remodel",
    title: "Remodeling & additions",
    text: "Commercial remodeling and additions that expand or update what you already have without losing quality.",
  },
];

/** How TX Ropers staffs full-scope jobs — shown on Services. */
export const crewApproach = {
  title: "In-house crew. Full-scope coverage.",
  text: "Most of our work is done by our own people — that is how we keep quality, schedule, and communication tight. When a trade sits outside what we self-perform, we pull from a deep network of trusted subcontractors so every piece of a general construction project is covered under one roof.",
};

/** Featured row on the home page */
export const featuredServices = [
  residentialServices[1],
  residentialServices[2],
  commercialServices[1],
];

export const about = {
  title: "About us",
  paragraphs: [
    "TX Ropers Construction is a small, locally rooted construction company serving residential and commercial clients. We focus on quality craftsmanship and honest communication on every job.",
    "Our goal is to deliver a premium product and elevate the standard for construction in our community — whether the project is large or small.",
    "Relationships matter here, and we are dedicated to our customers' satisfaction. When you work with TX Ropers Construction, you get a crew that stands behind the work.",
  ],
};

export const owner = {
  name: "Jayce Johnson",
  role: "Owner",
  /** Drop a solo headshot at /public/jayce-johnson.jpg to show it here */
  image: "/jayce-johnson.jpg",
  headline: "Fourth-generation construction. Fifth-generation agriculture.",
  paragraphs: [
    "That combination shaped a particular skill set — one that knows how a shop, arena, barn, or ranch structure has to work on a real day, not just look right on paper.",
    "Growing up around land, livestock, and building work taught Jayce to read a site, respect the dirt, and finish steel and structures that hold up under Texas use. It is why so much of what TX Ropers builds is custom, turnkey, and self-performed from the dirt up.",
  ],
};

export const credentials = [
  {
    title: "General contractor",
    text: "Full-scope residential and commercial construction — from dirt and site work to steel, framing, and finish.",
  },
  {
    title: "Certified welders",
    text: "Jayce and team members are certified welders — critical for structural steel and metal building work.",
  },
  {
    title: "Custom, not production",
    text: "Every project is tailored. We lead the build in-house and bring in trusted trades when the scope calls for it.",
  },
];

export const process = [
  {
    step: "01",
    title: "Tell us what you need",
    text: "Send your name, address, phone, email, and a quick description of the project through our quote form.",
  },
  {
    step: "02",
    title: "Walk the scope",
    text: "We talk through the site, use, and budget so the plan matches how you will actually use the building.",
  },
  {
    step: "03",
    title: "Build it turnkey",
    text: "From dirt and site work to steel, framing, and finish, we keep the work under one standard.",
  },
];
