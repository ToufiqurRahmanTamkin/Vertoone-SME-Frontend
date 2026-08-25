import type { Variants } from "motion/react";

/**
 * Shared Motion variants for the auth screens (login / register / forgot password).
 * The card orchestrates a staggered entrance for its children, and each field /
 * row uses `authItem` to fade + rise into place.
 */

// The glass card: fades + rises + settles, then staggers its children in.
export const authCard: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
      when: "beforeChildren",
      delayChildren: 0.12,
      staggerChildren: 0.07,
    },
  },
};

// Individual rows inside the card (header, each field, button, footer links).
export const authItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 24 },
  },
};

// Branding panel content (logo, heading, copy, chips).
export const brandItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 140, damping: 20 },
  },
};

export const brandContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
