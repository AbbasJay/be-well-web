export const CLASS_TYPES = [
  // Fitness Classes
  { value: "strength_training", label: "Strength Training" },
  { value: "cardio", label: "Cardio" },
  { value: "circuit_training", label: "Circuit Training" },
  { value: "bodybuilding", label: "Bodybuilding" },
  { value: "powerlifting", label: "Powerlifting" },
  { value: "crossfit", label: "CrossFit" },
  { value: "bootcamp", label: "Bootcamp" },

  // Yoga & Mind-Body
  { value: "yoga", label: "Yoga" },
  { value: "pilates", label: "Pilates" },
  { value: "meditation", label: "Meditation" },
  { value: "barre", label: "Barre" },
  { value: "stretching", label: "Stretching" },
  { value: "flexibility", label: "Flexibility" },

  // Dance & Movement
  { value: "dance", label: "Dance" },
  { value: "zumba", label: "Zumba" },

  // Martial Arts
  { value: "boxing", label: "Boxing" },
  { value: "kickboxing", label: "Kickboxing" },
  { value: "karate", label: "Karate" },

  // Sports & Recreation
  { value: "swimming", label: "Swimming" },
  { value: "tennis", label: "Tennis" },
  { value: "climbing", label: "Climbing" },
  { value: "cycling", label: "Cycling" },
  { value: "running", label: "Running" },
  { value: "basketball", label: "Basketball" },
  { value: "football", label: "Football" },
  { value: "volleyball", label: "Volleyball" },
  { value: "badminton", label: "Badminton" },
  { value: "squash", label: "Squash" },
  { value: "padel", label: "Padel" },

  // Wellness & Recovery
  { value: "massage", label: "Massage" },
  { value: "physiotherapy", label: "Physiotherapy" },
  { value: "sports_therapy", label: "Sports Therapy" },

  // Specialized
  { value: "kids_fitness", label: "Kids Fitness" },
  { value: "adaptive_fitness", label: "Adaptive Fitness" },
  { value: "weight_loss", label: "Weight Loss" },
] as const;

// Sorting helpers are now in app/utils/class.ts

export type ClassType = (typeof CLASS_TYPES)[number]["value"];
