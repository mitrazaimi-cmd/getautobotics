// ─────────────────────────────────────────────────────────────
// About Me — founder details shown in the #about section.
// ─────────────────────────────────────────────────────────────

export const founder = {
  name: "Mitra",
  title: "Founder, Auto Botics",
  /**
   * Photo shown next to the bio.
   * `shape: "round"` suits a small portrait (mitra.png is 137×143) and keeps it sharp.
   * For the large portrait frame, add a photo of at least 800×1000 (e.g. public/founder.jpg),
   * point `photo` at it, and set `shape: "portrait"`.
   */
  photo: "/mitra.png" as string | null,
  photoWidth: 137,
  photoHeight: 143,
  shape: "round" as "round" | "portrait",
  photoAlt: "Mitra, founder of Auto Botics",
  bio: [
    "I have been working in the Information Technology field since 2000, building my experience across a wide range of areas including website development, databases, software solutions, and IT services. Throughout my career, I have worked with numerous clients and businesses, helping them solve technology challenges, improve their processes, and implement solutions tailored to their specific needs. This extensive experience has given me a strong understanding of both the technical side of IT and the practical needs of businesses.",
    "Today, I am focused on the next generation of technology: Artificial Intelligence and Business Automation. We specialize in developing AI-powered automation, chatbots, and intelligent AI agents that help businesses streamline their operations, improve customer service, generate and manage leads, automate communications, and handle everyday processes more efficiently. Our goal is simple: to make AI practical, accessible, and truly useful for businesses—so they can take advantage of powerful technology without having to become technology experts themselves.",
  ],
};

/** How working together feels — process facts, not claims about results. */
export const workingWithMe = [
  "You talk directly with the person who designs and builds your automation.",
  "We start with how your business works today, not with a tool.",
  "Human checkpoints stay in place wherever judgment matters.",
  "You get clear documentation and training, so your team stays in control.",
];
