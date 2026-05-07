/**
 * Simple SRS (SM-2 Algorithm) for Ankiflix Rows
 * quality: 0 (forgot) to 5 (perfect)
 */
export interface DeckProgress {
  interval: number;
  repetition: number;
  ease: number;
  next_review: string; // ISO date string
}

export const calculateNextReview = (
  currentProgress: DeckProgress | null, 
  quality: number
): DeckProgress => {
  // Default values for a new card/deck
  let { interval, repetition, ease } = currentProgress || {
    interval: 0,
    repetition: 0,
    ease: 2.5,
    next_review: new Date().toISOString(),
  };

  if (quality >= 3) { // Success
    if (repetition === 0) interval = 1;
    else if (repetition === 1) interval = 6;
    else interval = Math.round(interval * ease);
    
    repetition += 1;
    ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else { // Failure
    repetition = 0;
    interval = 1;
    ease = Math.max(1.3, ease - 0.2);
  }

  // Ensure ease doesn't go too low (SM-2 standard is 1.3)
  ease = Math.max(1.3, ease);

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return { 
    interval, 
    repetition, 
    ease, 
    next_review: nextDate.toISOString() 
  };
};
