import { DOCTORS_DB } from '../data/doctors';

// Bayesian-inspired doctor matching algorithm

/**
 * Match doctors to patient symptoms using weighted specialty scoring.
 * Each symptom maps to specialties with primary (weight=2) and secondary (weight=1) relevance.
 * Final score incorporates specialty match, experience, and rating.
 */
export async function matchDoctors(selectedSymptoms, symptomMap) {
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

  // Use mock database
  const doctorsDB = DOCTORS_DB || [];

  // Score each matching doctor
  const matched = doctorsDB
    // We do a loose match or exact match on specialty
    // The dataset has exact matching strings or similar
    .filter(d => {
      // Standardize case and handle both field names
      const dSpec = (d.specialty || d.specialization || '').toLowerCase();
      if (!dSpec) return false;

      // Extract significant words (length > 2)
      const dWords = dSpec.split(/[\s-]+/).filter(w => w.length > 2);

      return topSpecialties.some(ts => {
        const target = ts.toLowerCase();
        // Exact or partial match
        if (dSpec.includes(target) || target.includes(dSpec)) return true;

        // Word-level overlap (e.g., "General Medicine" vs "general-physician" both share "general")
        const tWords = target.split(/[\s-]+/).filter(w => w.length > 2);
        return dWords.some(dw => tWords.some(tw => dw.includes(tw) || tw.includes(dw)));
      });
    })
    .map(d => {
      const dSpec = (d.specialty || d.specialization || '').toLowerCase();
      const dWords = dSpec.split(/[\s-]+/).filter(w => w.length > 2);

      // Find the best matched specialty for weighting
      const matchedTs = topSpecialties.find(ts => {
        const target = ts.toLowerCase();
        if (dSpec.includes(target) || target.includes(dSpec)) return true;
        const tWords = target.split(/[\s-]+/).filter(w => w.length > 2);
        return dWords.some(dw => tWords.some(tw => dw.includes(tw) || tw.includes(dw)));
      });

      const specialtyWeight = specialtyScores[matchedTs] || 0;
      const maxSpecialtyScore = Math.max(...Object.values(specialtyScores));

      // Normalized components (0-1)
      const specialtyMatch = maxSpecialtyScore > 0 ? (specialtyWeight / maxSpecialtyScore) : 0.5;

      // Experience normalization - robustly parse "12 years" or 12
      const expRaw = d.experience || d.yearsExperience || 0;
      const expNum = typeof expRaw === 'string' ? (parseInt(expRaw.replace(/\D/g, '')) || 0) : expRaw;
      const experienceScore = Math.min(expNum / 40, 1);

      // Rating normalization
      const ratingRaw = d.rating || 4.5;
      const ratingNum = typeof ratingRaw === 'string' ? parseFloat(ratingRaw) : ratingRaw;
      const ratingScore = Math.max(0, Math.min(((ratingNum || 4.0) - 3.0) / 2.0, 1)); // normalize 3.0-5.0 to 0-1

      // Available flag
      const isAvailable = d.available !== undefined ? d.available : (Math.random() > 0.3);
      const availabilityBonus = isAvailable ? 0.05 : 0;

      // Weighted composite score (as percentage)
      const rawScore =
        specialtyMatch * 0.50 +
        ratingScore * 0.25 +
        experienceScore * 0.15 +
        availabilityBonus +
        Math.random() * 0.05;

      const score = isNaN(rawScore) ? 50 : Math.min(Math.round(rawScore * 100), 99);

      return {
        ...d,
        score,
        available: isAvailable,
        yearsExperience: expNum,
        consultationFee: parseInt(d.fee || d.consultationFee || 500),
        avatar: d.name ? d.name.charAt(0) : 'D',
        city: d.location || 'Bangalore',
        specialty: d.specialty || d.specialization || 'General'
      };
    })
    .sort((a, b) => b.score - a.score);

  return matched;
}
