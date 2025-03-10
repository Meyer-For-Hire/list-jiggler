// Rank-Biased Overlap implementation
// Based on: http://codalism.com/research/papers/webber_evaluating_2010.pdf

function calculateRBO(ranking1: string[], ranking2: string[], p: number = 0.9): number {
  const maxLength = Math.max(ranking1.length, ranking2.length);
  let score = 0;
  let weight = 1;
  
  for (let d = 0; d < maxLength; d++) {
    const set1 = new Set(ranking1.slice(0, d + 1));
    const set2 = new Set(ranking2.slice(0, d + 1));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const agreement = intersection.size / (d + 1);
    
    score += weight * agreement;
    weight *= p;
  }
  
  return score * (1 - p);
}

export function findOptimalRanking(rankings: string[][]): string[] {
  if (rankings.length === 0) return [];
  if (rankings.length === 1) return rankings[0];

  // Get all unique items
  const items = new Set(rankings.flat());
  const itemArray = Array.from(items);

  // Calculate average RBO score for each possible ranking
  const scores = itemArray.map(item => {
    let totalScore = 0;
    for (const ranking of rankings) {
      totalScore += calculateRBO([item], ranking);
    }
    return { item, score: totalScore / rankings.length };
  });

  // Sort items by their average RBO score
  return scores
    .sort((a, b) => b.score - a.score)
    .map(score => score.item);
}

export function validateRankings(rankings: string[][]): boolean {
  if (rankings.length < 2) return true;

  const firstSet = new Set(rankings[0]);
  const firstLength = rankings[0].length;

  return rankings.every(ranking => 
    ranking.length === firstLength && 
    new Set(ranking).size === firstLength &&
    ranking.every(item => firstSet.has(item))
  );
} 