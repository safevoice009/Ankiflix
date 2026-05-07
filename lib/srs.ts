/**
 * Simple SRS (SM-2 Algorithm) for Ankiflix Intelligence Discovery
 * Adapted from Milan-98 instructions to fit the Ankiflix mastery ecosystem.
 */

export interface SRSState {
  interval: number;
  repetition: number;
  ease: number;
  nextReview: Date;
}

/**
 * Calculates the next review metrics for a deck.
 * quality: 0 (forgot/unused) to 5 (perfect mastery)
 */
export const calculateNextReview = (
  state: SRSState = { interval: 0, repetition: 0, ease: 2.5, nextReview: new Date() },
  quality: number
): SRSState => {
  let { interval, repetition, ease } = state;

  if (quality >= 3) {
    // Success
    if (repetition === 0) interval = 1;
    else if (repetition === 1) interval = 6;
    else interval = Math.round(interval * ease);

    repetition += 1;
    ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else {
    // Failure
    repetition = 0;
    interval = 1;
    ease = Math.max(1.3, ease - 0.2);
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return { interval, repetition, ease, nextReview: nextDate };
};

/**
 * Initial state for a newly discovered deck
 */
export const INITIAL_SRS_STATE: SRSState = {
  interval: 0,
  repetition: 0,
  ease: 2.5,
  nextReview: new Date(),
};
