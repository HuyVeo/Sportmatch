export type RankTier = {
  name: string;
  minScore: number;
};

export const RANK_TIERS: RankTier[] = [
  { name: "Tân binh", minScore: 0 },
  { name: "Trung cấp", minScore: 50 },
  { name: "Chuyên nghiệp", minScore: 100 },
  { name: "Tinh anh", minScore: 150 },
  { name: "Huyền thoại", minScore: 200 },
];

export type ScoreInput = {
  averageStars: number;
  matchCount: number;
  trustScore: number;
  communityVotes: number;
};

export type ScoreBreakdown = {
  rating: number;
  matches: number;
  trust: number;
  community: number;
  total: number;
};

export function calculateScore(input: ScoreInput): ScoreBreakdown {
  const rating = input.averageStars * 30;
  const matches = input.matchCount * 1.5;
  const trust = input.trustScore * 0.4;
  const community = input.communityVotes * 2;

  return {
    rating,
    matches,
    trust,
    community,
    total: rating + matches + trust + community,
  };
}

export function getRankTier(totalScore: number): RankTier {
  let tier = RANK_TIERS[0];
  for (const candidate of RANK_TIERS) {
    if (totalScore >= candidate.minScore) {
      tier = candidate;
    }
  }
  return tier;
}
