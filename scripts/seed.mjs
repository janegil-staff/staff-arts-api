import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/staffarts";

// ── Schemas (inline so script is self-contained) ──

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: String,
  displayName: { type: String, required: true },
  username: { type: String, unique: true, lowercase: true },
  role: { type: String, enum: ["artist", "collector", "gallery", "admin"], default: "collector" },
  avatar: String,
  coverImage: String,
  bio: String,
  location: String,
  website: String,
  socialLinks: { instagram: String, twitter: String },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  verified: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  preferences: { theme: String, notifications: Boolean, privacy: String },
  provider: { type: String, default: "credentials" },
}, { timestamps: true });

const artworkSchema = new mongoose.Schema({
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: String,
  story: String,
  images: [{ url: String, width: Number, height: Number, alt: String }],
  primaryImage: String,
  medium: String,
  style: [String],
  tags: [String],
  dimensions: { width: Number, height: Number, unit: String },
  year: Number,
  status: { type: String, default: "available" },
  pricing: { type: { type: String, default: "fixed" }, price: Number, currency: String },
  category: [String],
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId }],
  saves: [{ type: mongoose.Schema.Types.ObjectId }],
  featured: { type: Boolean, default: false },
  curated: { type: Boolean, default: false },
}, { timestamps: true });

const eventSchema = new mongoose.Schema({
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  description: String,
  coverImage: String,
  type: String,
  artworkIds: [{ type: mongoose.Schema.Types.ObjectId }],
  artistIds: [{ type: mongoose.Schema.Types.ObjectId }],
  venue: { name: String, address: String, city: String, country: String },
  isVirtual: Boolean,
  startDate: Date,
  endDate: Date,
  ticketing: { free: Boolean, price: Number, currency: String },
  tags: [String],
  featured: { type: Boolean, default: false },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: String,
  content: String,
  images: [String],
  linkedArtworkId: { type: mongoose.Schema.Types.ObjectId },
  likes: [{ type: mongoose.Schema.Types.ObjectId }],
  comments: [{ userId: mongoose.Schema.Types.ObjectId, text: String, createdAt: Date }],
  tags: [String],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Artwork = mongoose.models.Artwork || mongoose.model("Artwork", artworkSchema);
const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);
const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

// ── Artists ──
const ARTISTS = [
  {
    email: "elena.vasquez@staffarts.com",
    displayName: "Elena Vasquez",
    username: "elenavasquez",
    role: "artist",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    bio: "Contemporary painter exploring the intersection of light, memory, and emotional landscapes. Based in Barcelona, working primarily with oil and mixed media on large-scale canvases.",
    location: "Barcelona, Spain",
    website: "https://elenavasquez.art",
    socialLinks: { instagram: "@elenavasquez.art" },
    verified: true,
    featured: true,
  },
  {
    email: "marcus.chen@staffarts.com",
    displayName: "Marcus Chen",
    username: "marcuschen",
    role: "artist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    bio: "Sculptor and installation artist. My work examines the tension between organic forms and industrial materials. Recent exhibitions at Tate Modern and MoMA PS1.",
    location: "London, UK",
    website: "https://marcuschen.studio",
    socialLinks: { instagram: "@marcus.chen.studio" },
    verified: true,
    featured: true,
  },
  {
    email: "amara.okafor@staffarts.com",
    displayName: "Amara Okafor",
    username: "amaraokafor",
    role: "artist",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop",
    bio: "Photographer and visual storyteller documenting African diaspora identity through portraiture and landscape. Winner of the 2025 World Press Photo Award.",
    location: "Lagos, Nigeria",
    socialLinks: { instagram: "@amara.okafor" },
    verified: true,
    featured: true,
  },
  {
    email: "kai.tanaka@staffarts.com",
    displayName: "Kai Tanaka",
    username: "kaitanaka",
    role: "artist",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop",
    bio: "Digital artist and creative coder. I create generative art systems that respond to environmental data — wind, temperature, ocean currents — translating nature into visual poetry.",
    location: "Tokyo, Japan",
    website: "https://kaitanaka.dev",
    socialLinks: { instagram: "@kai.generative" },
    verified: true,
    featured: false,
  },
  {
    email: "sofia.lindberg@staffarts.com",
    displayName: "Sofia Lindberg",
    username: "sofialindberg",
    role: "artist",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    bio: "Ceramic artist creating vessels that blur the line between functional craft and fine art. Inspired by Scandinavian minimalism and Japanese wabi-sabi aesthetics.",
    location: "Stockholm, Sweden",
    socialLinks: { instagram: "@sofia.ceramics" },
    verified: true,
    featured: false,
  },
  {
    email: "rafael.moreno@staffarts.com",
    displayName: "Rafael Moreno",
    username: "rafaelmoreno",
    role: "artist",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    bio: "Mixed media artist working at the intersection of street art and gallery practice. My murals can be found in São Paulo, Berlin, and New York.",
    location: "São Paulo, Brazil",
    socialLinks: { instagram: "@rafael.moreno.art" },
    verified: false,
    featured: false,
  },
  {
    email: "iris.nowak@staffarts.com",
    displayName: "Iris Nowak",
    username: "irisnowak",
    role: "artist",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    bio: "Printmaker and textile artist. I create large-scale woodblock prints inspired by Eastern European folk traditions and contemporary feminist discourse.",
    location: "Warsaw, Poland",
    socialLinks: { instagram: "@iris.prints" },
    verified: false,
    featured: false,
  },
  {
    email: "gallery@staffarts.com",
    displayName: "Staff Gallery",
    username: "staffgallery",
    role: "gallery",
    avatar: "https://images.unsplash.com/photo-1577720643272-265f09367456?w=200&h=200&fit=crop",
    bio: "Staff Gallery is a contemporary art space dedicated to exhibiting emerging and mid-career artists. Founded in Oslo, 2024.",
    location: "Oslo, Norway",
    website: "https://staffgallery.com",
    verified: true,
    featured: true,
  },
];

// ── Artworks ──
const ARTWORKS = [
  // Elena Vasquez — paintings
  { artistIdx: 0, title: "Amber Reverie", description: "Oil on canvas. A meditation on golden-hour light filtering through Barcelona's Gothic Quarter. The amber tones dissolve into abstraction at the edges, suggesting the impermanence of memory.", image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1000&fit=crop", medium: "painting", style: ["abstract", "contemporary", "expressionism"], tags: ["oil", "light", "memory", "warm"], dimensions: { width: 120, height: 150, unit: "cm" }, year: 2025, price: 8500, featured: true },
  { artistIdx: 0, title: "Tidal Memory", description: "Mixed media on panel. Layers of acrylic, sand, and pigment create a surface that shifts between ocean and sky. Part of the 'Coastal Fragments' series.", image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=1000&fit=crop", medium: "painting", style: ["abstract", "mixed media"], tags: ["ocean", "texture", "blue", "series"], dimensions: { width: 100, height: 100, unit: "cm" }, year: 2025, price: 6200, featured: true },
  { artistIdx: 0, title: "Solstice", description: "Oil and gold leaf on canvas. Inspired by the long shadows of midsummer in southern Spain. The gold leaf catches actual light, making the painting different at every hour.", image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=1000&fit=crop", medium: "painting", style: ["abstract", "contemporary"], tags: ["gold", "summer", "light", "oil"], dimensions: { width: 90, height: 120, unit: "cm" }, year: 2024, price: 7800, featured: false },
  { artistIdx: 0, title: "Quiet Hours", description: "Watercolor and ink on paper. A series of intimate studies capturing the stillness of early morning. Loose washes and precise line work coexist.", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=1000&fit=crop", medium: "painting", style: ["figurative", "minimalist"], tags: ["watercolor", "morning", "quiet", "intimate"], dimensions: { width: 56, height: 76, unit: "cm" }, year: 2025, price: 2400, featured: false },

  // Marcus Chen — sculpture
  { artistIdx: 1, title: "Erosion Study No. 7", description: "Corten steel and reclaimed oak. This piece explores how natural weathering transforms industrial materials. The steel is allowed to rust organically, changing the sculpture over months.", image: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&h=1000&fit=crop", medium: "sculpture", style: ["contemporary", "minimalist"], tags: ["steel", "wood", "weathering", "industrial"], dimensions: { width: 80, height: 200, unit: "cm" }, year: 2025, price: 18500, featured: true },
  { artistIdx: 1, title: "Threshold", description: "Cast bronze and glass. A doorway-scale piece that plays with transparency and weight. Visitors can walk through it, experiencing the shift from solid to transparent.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=1000&fit=crop", medium: "sculpture", style: ["installation", "contemporary"], tags: ["bronze", "glass", "interactive", "space"], dimensions: { width: 120, height: 250, unit: "cm" }, year: 2024, price: 32000, featured: true },
  { artistIdx: 1, title: "Folded Light", description: "Polished aluminum and LED. A kinetic sculpture that rotates slowly, catching and reflecting light across the room. The movement is barely perceptible, creating a meditative presence.", image: "https://images.unsplash.com/photo-1561214078-f3247647fc5e?w=800&h=1000&fit=crop", medium: "sculpture", style: ["kinetic", "light art"], tags: ["aluminum", "LED", "kinetic", "light"], dimensions: { width: 60, height: 60, unit: "cm" }, year: 2025, price: 14000, featured: false },

  // Amara Okafor — photography
  { artistIdx: 2, title: "Homecoming", description: "Archival pigment print. A portrait series documenting the return of diaspora youth to Lagos. Each subject is photographed in locations meaningful to their family history.", image: "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800&h=1000&fit=crop", medium: "photography", style: ["documentary", "portrait"], tags: ["portrait", "identity", "africa", "diaspora"], dimensions: { width: 80, height: 120, unit: "cm" }, year: 2025, price: 4500, featured: true },
  { artistIdx: 2, title: "Golden Hour, Lagos", description: "Archival pigment print. The Nigerian coast at sunset, where the Atlantic meets West Africa. Part of the 'Shoreline' series exploring borders both physical and cultural.", image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=1000&fit=crop", medium: "photography", style: ["landscape", "fine art"], tags: ["landscape", "sunset", "ocean", "africa"], dimensions: { width: 120, height: 80, unit: "cm" }, year: 2024, price: 3800, featured: false },
  { artistIdx: 2, title: "Market Colours", description: "Archival pigment print. An intimate look at the Balogun Market — one of the largest in West Africa. The composition focuses on the extraordinary palette of textiles.", image: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800&h=1000&fit=crop", medium: "photography", style: ["documentary", "street"], tags: ["market", "color", "textile", "street"], dimensions: { width: 100, height: 70, unit: "cm" }, year: 2025, price: 3200, featured: false },
  { artistIdx: 2, title: "The Elders", description: "Archival pigment print on cotton rag. Formal portraits of community elders in traditional dress. Shot with a large-format camera, each portrait took hours of conversation before a single frame was made.", image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=800&h=1000&fit=crop", medium: "photography", style: ["portrait", "fine art"], tags: ["portrait", "elders", "tradition", "formal"], dimensions: { width: 90, height: 120, unit: "cm" }, year: 2024, price: 5500, featured: true },

  // Kai Tanaka — digital
  { artistIdx: 3, title: "Wind Map: Pacific", description: "Generative digital print. Real-time Pacific Ocean wind data from January 2025, translated into flowing particle systems. Each line represents an actual wind current.", image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=1000&fit=crop", medium: "digital", style: ["generative", "data art"], tags: ["generative", "data", "wind", "ocean"], dimensions: { width: 100, height: 100, unit: "cm" }, year: 2025, price: 2800, featured: true },
  { artistIdx: 3, title: "Neural Garden", description: "Generative digital print. A botanical illustration that doesn't exist — every leaf, stem, and petal was grown by an algorithm trained on 10,000 pressed flower specimens.", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=1000&fit=crop", medium: "digital", style: ["generative", "AI art"], tags: ["AI", "botanical", "generative", "algorithm"], dimensions: { width: 80, height: 100, unit: "cm" }, year: 2025, price: 1800, featured: false },
  { artistIdx: 3, title: "City Pulse: Tokyo", description: "Generative digital print. A visualization of Tokyo's subway system over 24 hours. Each colored thread represents a train line; density shows rush hours.", image: "https://images.unsplash.com/photo-1633186710895-309db2eca9e4?w=800&h=1000&fit=crop", medium: "digital", style: ["generative", "data art", "urban"], tags: ["tokyo", "transit", "data", "urban"], dimensions: { width: 120, height: 80, unit: "cm" }, year: 2024, price: 2200, featured: false },

  // Sofia Lindberg — ceramic
  { artistIdx: 4, title: "Vessel No. 23", description: "Stoneware with volcanic ash glaze. Hand-thrown on a traditional kick wheel. The glaze, made from Icelandic volcanic ash, creates an unpredictable surface that recalls frozen lava flows.", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=1000&fit=crop", medium: "ceramic", style: ["minimalist", "craft"], tags: ["stoneware", "glaze", "vessel", "handmade"], dimensions: { width: 25, height: 35, unit: "cm" }, year: 2025, price: 1400, featured: true },
  { artistIdx: 4, title: "Moon Jar", description: "Porcelain with celadon glaze. Inspired by Korean moon jars, this piece took three firings to achieve the luminous, slightly irregular surface that gives it its name.", image: "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop", medium: "ceramic", style: ["traditional", "minimalist"], tags: ["porcelain", "celadon", "Korean", "moon jar"], dimensions: { width: 30, height: 32, unit: "cm" }, year: 2025, price: 2200, featured: false },

  // Rafael Moreno — mixed media
  { artistIdx: 5, title: "Favela Cartography", description: "Spray paint, acrylic, and found paper on canvas. A map-like composition created from actual street ephemera collected in São Paulo's Vila Madalena neighborhood.", image: "https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=800&h=1000&fit=crop", medium: "mixed_media", style: ["street art", "collage", "urban"], tags: ["street art", "collage", "São Paulo", "urban"], dimensions: { width: 180, height: 140, unit: "cm" }, year: 2025, price: 9500, featured: true },
  { artistIdx: 5, title: "Concrete Bloom", description: "Spray paint on reclaimed concrete slab. Hyper-detailed botanical illustrations painted directly on broken concrete. Nature reclaiming industrial ruins.", image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=1000&fit=crop", medium: "mixed_media", style: ["street art", "botanical"], tags: ["concrete", "botanical", "street", "reclaimed"], dimensions: { width: 100, height: 80, unit: "cm" }, year: 2024, price: 6800, featured: false },

  // Iris Nowak — print
  { artistIdx: 6, title: "Motherland Triptych", description: "Woodblock print on handmade mulberry paper. A three-panel print exploring feminine archetypes in Eastern European folklore. Carved and printed entirely by hand.", image: "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=800&h=1000&fit=crop", medium: "print", style: ["folk", "feminist", "traditional"], tags: ["woodblock", "folklore", "feminist", "triptych"], dimensions: { width: 180, height: 60, unit: "cm" }, year: 2025, price: 3600, featured: true },
  { artistIdx: 6, title: "Winter Hymn", description: "Linocut print, edition of 25. A stark winter landscape reduced to pure black and white. The simplicity of the medium emphasizes the silence of the scene.", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=1000&fit=crop", medium: "print", style: ["minimalist", "landscape"], tags: ["linocut", "winter", "landscape", "black and white"], dimensions: { width: 50, height: 70, unit: "cm" }, year: 2024, price: 800, featured: false },
];

// ── Events ──
const EVENTS = [
  {
    title: "New Horizons: Contemporary Painting Now",
    description: "A group exhibition featuring five painters from Staff Arts who are redefining what contemporary painting can be. From Elena Vasquez's luminous abstractions to Rafael Moreno's street-influenced canvases, this show surveys the breadth of painting practice today.",
    coverImage: "https://images.unsplash.com/photo-1577720643272-265f09367456?w=1200&h=600&fit=crop",
    type: "exhibition",
    venue: { name: "Staff Gallery", address: "Tjuvholmen allé 12", city: "Oslo", country: "Norway" },
    startDate: new Date("2026-03-15"),
    endDate: new Date("2026-04-20"),
    ticketing: { free: true },
    tags: ["painting", "contemporary", "group show"],
    featured: true,
  },
  {
    title: "Digital Frontiers: Art in the Age of Data",
    description: "An online exhibition exploring how artists use data, algorithms, and AI as creative tools. Featuring generative works by Kai Tanaka and other digital pioneers. Experience the exhibition in your browser — no gallery visit required.",
    coverImage: "https://images.unsplash.com/photo-1633186710895-309db2eca9e4?w=1200&h=600&fit=crop",
    type: "online_show",
    isVirtual: true,
    startDate: new Date("2026-03-01"),
    endDate: new Date("2026-03-31"),
    ticketing: { free: true },
    tags: ["digital", "generative", "AI", "online"],
    featured: true,
  },
  {
    title: "Emerging Voices: Artist Talk with Amara Okafor",
    description: "Join photographer Amara Okafor for an intimate conversation about her 'Homecoming' series, identity in the diaspora, and the ethics of documentary photography. Followed by Q&A and a book signing.",
    coverImage: "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=1200&h=600&fit=crop",
    type: "talk",
    venue: { name: "Staff Arts HQ", address: "Youngstorget 3", city: "Oslo", country: "Norway" },
    startDate: new Date("2026-03-22T19:00:00"),
    ticketing: { free: false, price: 150, currency: "NOK" },
    tags: ["photography", "talk", "diaspora", "identity"],
    featured: true,
  },
  {
    title: "Craft & Process: Ceramics Workshop with Sofia Lindberg",
    description: "A full-day workshop where you'll learn traditional throwing techniques, volcanic ash glazing, and the philosophy behind Sofia's minimalist approach to form. All skill levels welcome. Materials included.",
    coverImage: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&h=600&fit=crop",
    type: "workshop",
    venue: { name: "Keramikkverkstedet", address: "Grünerløkka", city: "Oslo", country: "Norway" },
    startDate: new Date("2026-04-05T10:00:00"),
    endDate: new Date("2026-04-05T17:00:00"),
    ticketing: { free: false, price: 1200, currency: "NOK" },
    tags: ["ceramics", "workshop", "craft", "hands-on"],
    featured: false,
  },
  {
    title: "Spring Art Fair Oslo 2026",
    description: "The third annual Spring Art Fair brings together 40 galleries and 200+ artists for a weekend of art, performance, and conversation. Browse thousands of works from emerging talent to established names.",
    coverImage: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1200&h=600&fit=crop",
    type: "fair",
    venue: { name: "Kulturhuset", address: "Youngstorget 3", city: "Oslo", country: "Norway" },
    startDate: new Date("2026-05-10"),
    endDate: new Date("2026-05-12"),
    ticketing: { free: false, price: 200, currency: "NOK" },
    tags: ["art fair", "galleries", "emerging", "oslo"],
    featured: true,
  },
];

// ── Posts ──
const POSTS_DATA = [
  { artistIdx: 0, type: "studio_update", content: "Just finished the last piece for the 'New Horizons' show at Staff Gallery. Can't wait for the opening on March 15th. This has been six months of intense work — the largest canvases I've ever attempted.", images: ["https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop"] },
  { artistIdx: 1, type: "studio_update", content: "Experimenting with a new bronze casting technique today. The patina is coming out with this incredible deep green that I wasn't expecting. Sometimes the best results come from mistakes.", images: ["https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop"] },
  { artistIdx: 2, type: "text", content: "Photography is not about the camera. It's about learning to see. The best portrait I ever made was with a broken lens and expired film. The imperfections made it honest." },
  { artistIdx: 3, type: "artwork_share", content: "New generative piece: 'Wind Map: Pacific' — translating real wind data into visual poetry. Every line is a real wind current captured on January 12, 2025. Nature is the greatest artist." },
  { artistIdx: 4, type: "studio_update", content: "Opening the kiln after a three-day firing. This is always the most nerve-wracking moment — you never fully know what the fire has decided to do.", images: ["https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=600&fit=crop"] },
  { artistIdx: 5, type: "image", content: "Found this wall in Vila Madalena that's been painted over a hundred times. Each layer is someone's voice. This is what I try to bring to canvas — the archaeology of a surface.", images: ["https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=800&h=600&fit=crop"] },
  { artistIdx: 6, type: "text", content: "Just received 200 sheets of handmade mulberry paper from my supplier in Japan. The texture, the weight, the way it absorbs ink — there's no substitute. Time to start carving the new blocks." },
  { artistIdx: 7, type: "text", content: "We're thrilled to announce our spring exhibition program. 'New Horizons' opens March 15th, followed by a solo show from Marcus Chen in May. Full program on our website." },
];

// ── SEED ──
async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.\n");

  // Clear existing data
  console.log("Clearing existing data...");
  await User.deleteMany({});
  await Artwork.deleteMany({});
  await Event.deleteMany({});
  await Post.deleteMany({});

  // Create password hash (all demo accounts use "staffarts123")
  const passwordHash = await bcrypt.hash("staffarts123", 12);

  // Create users
  console.log("Creating artists and gallery...");
  const users = [];
  for (const artist of ARTISTS) {
    const user = await User.create({
      ...artist,
      passwordHash,
      preferences: { theme: "dark", notifications: true, privacy: "public" },
    });
    users.push(user);
    console.log(`  ✓ ${user.displayName} (${user.role})`);
  }

  // Add some followers
  for (let i = 0; i < users.length; i++) {
    const others = users.filter((_, j) => j !== i);
    const followCount = Math.floor(Math.random() * others.length);
    const followers = others.slice(0, followCount).map((u) => u._id);
    await User.findByIdAndUpdate(users[i]._id, { followers });
  }

  // Create artworks
  console.log("\nCreating artworks...");
  const artworks = [];
  for (const aw of ARTWORKS) {
    const artwork = await Artwork.create({
      artistId: users[aw.artistIdx]._id,
      title: aw.title,
      description: aw.description,
      images: [{ url: aw.image, width: 800, height: 1000, alt: aw.title }],
      primaryImage: aw.image,
      medium: aw.medium,
      style: aw.style,
      tags: aw.tags,
      dimensions: aw.dimensions,
      year: aw.year,
      status: "available",
      pricing: { type: "fixed", price: aw.price, currency: "USD" },
      category: [aw.medium],
      views: Math.floor(Math.random() * 500) + 50,
      likes: users.slice(0, Math.floor(Math.random() * users.length)).map((u) => u._id),
      featured: aw.featured,
      curated: aw.featured,
    });
    artworks.push(artwork);
    console.log(`  ✓ "${artwork.title}" by ${users[aw.artistIdx].displayName} — $${aw.price}`);
  }

  // Create events
  console.log("\nCreating events...");
  for (const ev of EVENTS) {
    const event = await Event.create({
      ...ev,
      organizerId: users[7]._id, // Staff Gallery
      artistIds: users.slice(0, 5).map((u) => u._id),
      artworkIds: artworks.slice(0, 4).map((a) => a._id),
    });
    console.log(`  ✓ ${event.title}`);
  }

  // Create posts
  console.log("\nCreating social posts...");
  for (const p of POSTS_DATA) {
    const linkedArtwork = p.type === "artwork_share" ? artworks.find((a) => a.artistId.equals(users[p.artistIdx]._id)) : null;
    await Post.create({
      authorId: users[p.artistIdx]._id,
      type: p.type,
      content: p.content,
      images: p.images || [],
      linkedArtworkId: linkedArtwork?._id,
      likes: users.slice(0, Math.floor(Math.random() * 5)).map((u) => u._id),
      tags: [],
    });
    console.log(`  ✓ Post by ${users[p.artistIdx].displayName}`);
  }

  console.log("\n══════════════════════════════════════");
  console.log("  SEED COMPLETE");
  console.log(`  ${users.length} users`);
  console.log(`  ${artworks.length} artworks`);
  console.log(`  ${EVENTS.length} events`);
  console.log(`  ${POSTS_DATA.length} posts`);
  console.log("══════════════════════════════════════");
  console.log("\nDemo login: any artist email + password: staffarts123");
  console.log("Example: elena.vasquez@staffarts.com / staffarts123\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
