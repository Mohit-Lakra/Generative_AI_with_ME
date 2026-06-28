/**
 * SM-2 Algorithm for spaced repetition
 * https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2
 */
function updateSM2(quality, currentEF, currentN, currentI) {
  // quality: 0-5
  // currentEF: Easiness factor (default 2.5)
  // currentN: Repetition number
  // currentI: Interval in days

  let n = currentN;
  let I = currentI;

  let EF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  EF = Math.max(EF, 1.3); // EF never drops below 1.3

  if (quality < 3) {
    n = 0;
    I = 1;
  } else {
    n = n + 1;
    if (n === 1) {
      I = 1;
    } else if (n === 2) {
      I = 6;
    } else {
      I = Math.round(I * EF);
    }
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + I);

  return {
    easinessFactor: EF,
    repetitionNumber: n,
    intervalDays: I,
    nextReviewDate
  };
}

module.exports = { updateSM2 };
