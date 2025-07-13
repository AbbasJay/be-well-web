export const BUSINESS_TYPES = [
  { value: "gym", label: "Gym" },
  { value: "fitness_studio", label: "Fitness Studio" },
  { value: "yoga_studio", label: "Yoga Studio" },
  { value: "pilates_studio", label: "Pilates Studio" },
  { value: "crossfit_box", label: "CrossFit Box" },
  { value: "martial_arts", label: "Martial Arts" },
  { value: "dance_studio", label: "Dance Studio" },
  { value: "swimming_pool", label: "Swimming Pool" },
  { value: "tennis_court", label: "Tennis Court" },
  { value: "climbing_gym", label: "Climbing Gym" },
  { value: "boxing_gym", label: "Boxing Gym" },
  { value: "spa_wellness", label: "Spa & Wellness" },
  { value: "massage_therapy", label: "Massage Therapy" },
  { value: "physiotherapy", label: "Physiotherapy" },
  { value: "nutrition_consultant", label: "Nutrition Consultant" },
  { value: "personal_trainer", label: "Personal Trainer" },
  { value: "sports_club", label: "Sports Club" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "meditation_center", label: "Meditation Center" },
  { value: "rehabilitation_center", label: "Rehabilitation Center" },
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number]["value"];
