export type TeamGroup = "Founders & Directors" | "Finance & Compliance" | "Growth" | "Portfolio";

export type TeamMember = {
  name: string;
  role: string;
  group: TeamGroup;
  photo: string;
  bio: string;
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Guss",
    role: "Founder",
    group: "Founders & Directors",
    photo: "/team/Guss.jpg",
    bio: "Guss is the founder of both Lively Properties and Peachy Properties. With a background in real estate sales and running his own coaching business, Guss has spent his career learning that the quality of a relationship determines the quality of everything that follows. That foundation shapes how both brands operate from the ground up: owners feel genuinely partnered with, the standard of care is consistent across every property, and the guest experience is treated as a brand responsibility. Central to Guss' approach is a commitment to innovation and leveraging the technology and tools available today. He believes that marrying relationship-driven service with thoughtful adoption of new technology is what strengthens both brands and ensures they continue to lead in the premium short-stay space.",
  },
  {
    name: "Tom",
    role: "Director",
    group: "Founders & Directors",
    photo: "/team/Tom.jpg",
    bio: "Tom brings strategic, brand and commercial depth to the business. Before founding Lively and Peachy, he worked across consulting and agency environments in strategy, research, project design and end-to-end management, building experience in market analysis, customer behaviour, brand development and commercial problem-solving. Since then, he has helped shape the growth and positioning of both brands, with a strong focus on their long-term commercial success, while also building the systems and team needed to ensure the owner and guest experience continues to strengthen as the businesses grow.",
  },
  {
    name: "Hiona",
    role: "Finance Manager & Compliance",
    group: "Finance & Compliance",
    photo: "/team/Hiona.jpg",
    bio: "Hiona leads the financial structure behind the business. With more than 25 years across real estate and finance, including 10 years running her own agency and another 10 years managing short-stay accommodation in South Yarra, she brings serious commercial depth to the team. Her experience spans trust accounting, payroll, cashflow, owner statements, compliance, budgeting and reporting, giving owners stronger visibility and confidence in the numbers behind their property.",
  },
  {
    name: "Kirby",
    role: "Business Development Manager",
    group: "Growth",
    photo: "/team/Kirby.jpg",
    bio: "Kirby brings strength in guest experience, client experience and growth. Her role helps shape how the business is felt by both owners and guests, which directly influences trust, reviews and the overall quality associated with both brands.",
  },
  {
    name: "April",
    role: "Portfolio Manager",
    group: "Portfolio",
    photo: "/team/April.jpg",
    bio: "April brings a rare mix of operational leadership, brand thinking and deep tourism experience. With more than 16 years across tourism and accommodation, leading teams of more than 30 staff and overseeing thousands of guest stays, she brings real weight to the way premium homes are presented, run and grown.",
  },
  {
    name: "Darren",
    role: "Portfolio Manager",
    group: "Portfolio",
    photo: "/team/Darren.jpg",
    bio: "Darren adds more than a decade of experience across short stay, hospitality and property technology in Australia and the UK. His background includes senior roles with MadeComfy and Nestor Stay, where he worked across pricing, partner models, growth and systems, and helped launch new markets from the ground up. That experience strengthens the business in onboarding, operational systems, supplier networks and the structured thinking required to grow without losing control.",
  },
  {
    name: "Callum",
    role: "Portfolio Manager",
    group: "Portfolio",
    photo: "/team/Callum.jpg",
    bio: "Callum strengthens the operational side of the business through platform knowledge, problem-solving, maintenance coordination and calm handling of more complex situations - especially where fast, sensible judgement matters most.",
  },
];

export const TEAM_GROUPS: TeamGroup[] = [
  "Founders & Directors",
  "Finance & Compliance",
  "Growth",
  "Portfolio",
];
