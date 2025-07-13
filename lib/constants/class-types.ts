export const CLASS_TYPES = [
  // Fitness Classes
  { value: "strength_training", label: "Strength Training" },
  { value: "cardio", label: "Cardio" },
  { value: "hiit", label: "HIIT" },
  { value: "circuit_training", label: "Circuit Training" },
  { value: "functional_training", label: "Functional Training" },
  { value: "bodybuilding", label: "Bodybuilding" },
  { value: "powerlifting", label: "Powerlifting" },
  { value: "crossfit", label: "CrossFit" },
  { value: "bootcamp", label: "Bootcamp" },

  // Yoga & Mind-Body
  { value: "yoga", label: "Yoga" },
  { value: "pilates", label: "Pilates" },
  { value: "meditation", label: "Meditation" },
  { value: "tai_chi", label: "Tai Chi" },
  { value: "qigong", label: "Qigong" },
  { value: "barre", label: "Barre" },
  { value: "stretching", label: "Stretching" },
  { value: "flexibility", label: "Flexibility" },

  // Dance & Movement
  { value: "dance", label: "Dance" },
  { value: "zumba", label: "Zumba" },
  { value: "ballet", label: "Ballet" },
  { value: "contemporary_dance", label: "Contemporary Dance" },
  { value: "hip_hop", label: "Hip Hop" },
  { value: "salsa", label: "Salsa" },
  { value: "ballroom", label: "Ballroom" },

  // Martial Arts
  { value: "boxing", label: "Boxing" },
  { value: "kickboxing", label: "Kickboxing" },
  { value: "muay_thai", label: "Muay Thai" },
  { value: "karate", label: "Karate" },
  { value: "judo", label: "Judo" },
  { value: "taekwondo", label: "Taekwondo" },
  { value: "jiu_jitsu", label: "Jiu Jitsu" },
  { value: "kung_fu", label: "Kung Fu" },

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

  // Wellness & Recovery
  { value: "massage", label: "Massage" },
  { value: "physiotherapy", label: "Physiotherapy" },
  { value: "nutrition", label: "Nutrition" },
  { value: "wellness_coaching", label: "Wellness Coaching" },
  { value: "rehabilitation", label: "Rehabilitation" },
  { value: "sports_therapy", label: "Sports Therapy" },

  // Specialized
  { value: "senior_fitness", label: "Senior Fitness" },
  { value: "prenatal", label: "Prenatal" },
  { value: "postnatal", label: "Postnatal" },
  { value: "kids_fitness", label: "Kids Fitness" },
  { value: "adaptive_fitness", label: "Adaptive Fitness" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
] as const;

export type ClassType = (typeof CLASS_TYPES)[number]["value"];
