// Bayesian-inspired doctor matching algorithm

/**
 * Match doctors to patient symptoms using weighted specialty scoring.
 * Each symptom maps to specialties with primary (weight=2) and secondary (weight=1) relevance.
 * Final score incorporates specialty match, experience, and rating.
 */
export function matchDoctors(selectedSymptoms, symptomMap, doctorsDB) {
  if (!selectedSymptoms.length) return [];

  // Build specialty scores from symptoms
  const specialtyScores = {};
  selectedSymptoms.forEach(symptom => {
    const specialties = symptomMap[symptom] || ["General Medicine"];
    specialties.forEach((sp, i) => {
      // Primary specialty gets higher weight
      specialtyScores[sp] = (specialtyScores[sp] || 0) + (i === 0 ? 2 : 1);
    });
  });

  // Get top specialties
  const topSpecialties = Object.entries(specialtyScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);

  // Score each matching doctor
  const matched = doctorsDB
    .filter(d => topSpecialties.includes(d.specialty))
    .map(d => {
      const specialtyWeight = specialtyScores[d.specialty] || 0;
      const maxSpecialtyScore = Math.max(...Object.values(specialtyScores));

      // Normalized components (0-1)
      const specialtyMatch = specialtyWeight / maxSpecialtyScore;
      const experienceScore = Math.min(d.yearsExperience / 25, 1);
      const ratingScore = (d.rating - 4.0) / 1.0; // normalize 4.0-5.0 to 0-1
      const availabilityBonus = d.available ? 0.05 : 0;

      // Weighted composite score (as percentage)
      const rawScore =
        specialtyMatch * 0.50 +
        ratingScore * 0.25 +
        experienceScore * 0.15 +
        availabilityBonus +
        Math.random() * 0.05; // Small jitter for realism

      const score = Math.min(Math.round(rawScore * 100), 99);

      return { ...d, score };
    })
    .sort((a, b) => b.score - a.score);

  return matched;
}
