export type PartnerExperience = {
  name: string;
  category: "Food & Drink" | "Tours & Activities" | "Wellness";
  blurb: string;
  /**
   * Partner hero - sourced from livelyproperties.com.au so the editorial
   * aesthetic stays continuous with the existing brand site. Remote so we
   * don't carry another ~30 binaries in the repo; tied to a domain the
   * business owns.
   */
  image?: string;
};

const LP = "https://livelyproperties.com.au/wp-content/uploads";

export const PARTNER_EXPERIENCES: PartnerExperience[] = [
  {
    name: "Coastal Biohack Lounge",
    category: "Wellness",
    blurb:
      "Wellness and relaxation modalities designed for biohacking enthusiasts - cold plunge, infrared, and recovery.",
    image: `${LP}/2025/10/coastal.jpg`,
  },
  {
    name: "Pond Bathhouse",
    category: "Wellness",
    blurb:
      "Mornington's newest bathhouse, built around slow, considered rejuvenation rituals.",
    image: `${LP}/2025/04/lively-partner-pond-bathhouse.jpg.webp`,
  },
  {
    name: "Aurora Spa and Bathhouse",
    category: "Wellness",
    blurb:
      "Hydrotherapy pools, steam rooms, and tailored treatments drawing on Australian botanicals.",
    image: `${LP}/2024/09/lively-properties-experience-aurora-spa-bathhouse.jpg.webp`,
  },

  {
    name: "Hudley's Catering",
    category: "Food & Drink",
    blurb:
      "Exceptional grazing platters built on fresh, locally-sourced Peninsula produce.",
    image: `${LP}/2025/03/lively-partner-hudleys-catering.jpg.webp`,
  },
  {
    name: "Sip & Savor Catering",
    category: "Food & Drink",
    blurb:
      "Private chefs who elevate your stay with gourmet meals cooked in your villa kitchen.",
    image: `${LP}/2025/03/sip-and-savor-catering-lively-properties-partner.jpg.webp`,
  },
  {
    name: "Hickinbotham of Dromana",
    category: "Food & Drink",
    blurb:
      "Family-owned vineyard specialising in premium cool-climate wines.",
  },
  {
    name: "Maison by Patrice",
    category: "Food & Drink",
    blurb: "French chef delivering intimate private dining experiences in-residence.",
    image: `${LP}/2024/10/PatriceRepellininKitchen-1.jpeg.webp`,
  },
  {
    name: "Ten Minutes by Tractor",
    category: "Food & Drink",
    blurb:
      "Celebrated winery and restaurant pairing award-winning wines with quietly precise fine dining.",
    image: `${LP}/2024/10/Ten_1500x1000_2.jpg`,
  },
  {
    name: "Wildgrain Mornington",
    category: "Food & Drink",
    blurb: "Sophisticated restaurant and wine bar offering multi-course tasting menus.",
    image: `${LP}/2024/11/627aee0cc33c8a0dc6294a94_Wildgrain_SHANASYkate_Apr2022_hires-8845.jpg.webp`,
  },
  {
    name: "PT Leo Estate",
    category: "Food & Drink",
    blurb:
      "Lunch, art, and wine adventure combining dining, sculpture, and sweeping bay views.",
    image: `${LP}/2024/09/©CMcConville_PtLeoEstate_March2022_046_LR.jpg.webp`,
  },
  {
    name: "Jimmy Rum's",
    category: "Food & Drink",
    blurb: "Craft distillery specialising in premium rums, with guided tours and tastings.",
    image: `${LP}/2024/08/lively-partner-experience-jimmy-rum-distillery.jpg.webp`,
  },
  {
    name: "Zonzo Estate",
    category: "Food & Drink",
    blurb:
      "Renowned Yarra Valley winery and restaurant serving rustic Italian dining under vineyard skies.",
    image: `${LP}/2024/09/zonzo-estate.png.webp`,
  },
  {
    name: "The Bon Vivants Companion",
    category: "Food & Drink",
    blurb: "A small bar with an exquisite selection of fine wines and craft cocktails.",
    image: `${LP}/2024/09/the-bon-vivants-companion-friends-dining.jpg.webp`,
  },
  {
    name: "Avani Syrah",
    category: "Food & Drink",
    blurb:
      "Producing high-quality, small-batch wines with a quiet focus on sustainability.",
    image: `${LP}/2024/08/avani-wines-3.jpg.webp`,
  },
  {
    name: "Laura Restaurant - PT Leo Estate",
    category: "Food & Drink",
    blurb:
      "Fine dining for a signature evening - slow plates, long views, and exceptional wine.",
    image: `${LP}/2024/09/laura-restuarant.png.webp`,
  },
  {
    name: "Chef Akela",
    category: "Food & Drink",
    blurb:
      "Personalised private dining experience built around locally-sourced seasonal ingredients.",
    image: `${LP}/2024/08/dining-experience-chef-akela.jpg.webp`,
  },
  {
    name: "Trofeo Estate",
    category: "Food & Drink",
    blurb:
      "Biodynamic vineyard and winery in Dromana, with wine tasting under a sky of terracotta amphorae.",
    image: `${LP}/2024/06/trofeo-estate.png.webp`,
  },
  {
    name: "The Winey Cow",
    category: "Food & Drink",
    blurb: "Popular Mornington café, renowned for its vibrant breakfast and brunch plates.",
    image: `${LP}/2024/08/the-winey-cow-exceptional-brunch.jpg.webp`,
  },
  {
    name: "The Bodega",
    category: "Food & Drink",
    blurb:
      "Wine bar known for its relaxed atmosphere, curated wine list, and charcuterie boards.",
    image: `${LP}/2024/08/bodega-wines-bar-staff.jpg.webp`,
  },

  {
    name: "Go Wild Ballooning",
    category: "Tours & Activities",
    blurb:
      "Hot air balloon flights over the Yarra Valley at sunrise - a breath-held hour above the vines.",
    image: `${LP}/2024/09/go-wild-ballooning-experience.jpg.webp`,
  },
  {
    name: "Explore Australia",
    category: "Tours & Activities",
    blurb: "Full-day food and wine tours with tastings, sightseeing, and regional depth.",
    image: `${LP}/2024/08/Food-and-Wine-Tour-with-Explore-Australia.jpg.webp`,
  },
  {
    name: "Peninsula Hot Springs Tour",
    category: "Tours & Activities",
    blurb: "Day tour combining Peninsula Hot Springs with the famous Brighton bathing boxes.",
    image: `${LP}/2024/08/explore-australia-tours-hot-springs.jpg`,
  },
  {
    name: "Gunnamatta Horse Rides",
    category: "Tours & Activities",
    blurb:
      "Horseback riding along the back beaches and bushland of the Mornington Peninsula.",
    image: `${LP}/2024/09/Gunnamatta-horse-trails.png.webp`,
  },
  {
    name: "The Dunes Golf Links",
    category: "Tours & Activities",
    blurb:
      "Championship links-style course, rated among Australia's top public golf courses.",
    image: `${LP}/2022/01/the-dunes-golf-links.jpg.webp`,
  },
  {
    name: "Coco's Wine Tours",
    category: "Tours & Activities",
    blurb: "Tailored wine tour operator helping every group find its perfect itinerary.",
    image: `${LP}/2022/01/cocos-private-wine-tours.jpg.webp`,
  },
  {
    name: "Salty Surf School",
    category: "Tours & Activities",
    blurb: "Surf lessons for all ages and abilities - safety first, fun close behind.",
    image: `${LP}/2024/08/salty-surf-school-surfing-lessons-waves.jpg.webp`,
  },
  {
    name: "Flinders Golf Club",
    category: "Tours & Activities",
    blurb:
      "Exclusive member rates and priority booking on this championship cliff-top course.",
    image: `${LP}/2024/08/flinders-golf-club-championship-course.jpg.webp`,
  },
  {
    name: "Global Ballooning",
    category: "Tours & Activities",
    blurb: "Over 30 years of helping guests create the kind of memory that doesn't fade.",
    image: `${LP}/2024/07/global-hot-air-ballooning-australia.jpg.webp`,
  },
  {
    name: "Moonraker Dolphin Swims",
    category: "Tours & Activities",
    blurb:
      "Unforgettable marine encounters - swim with wild dolphins and seals off Sorrento.",
    image: `${LP}/2024/08/moonshaker-dolphin-swims.png.webp`,
  },
  {
    name: "X Golf Mornington",
    category: "Tours & Activities",
    blurb: "Indoor golf simulator with a 10% guest discount - perfect for a rainy afternoon.",
    image: `${LP}/2024/08/x-golf-mornington.jpg.webp`,
  },
];
