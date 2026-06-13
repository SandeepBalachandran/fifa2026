export interface ScoringRules {
  win: number;
  draw: number;
  loss: number;
  cleanSheet: number;
  groupStageQualification: number;
  roundOf16: number;
  quarterFinal: number;
  semiFinal: number;
  runnerUp: number;
  champion: number;
}

export const DEFAULT_SCORING_RULES: ScoringRules = {
  win: 3,
  draw: 1,
  loss: 0,
  cleanSheet: 1,
  groupStageQualification: 5,
  roundOf16: 5,
  quarterFinal: 8,
  semiFinal: 10,
  runnerUp: 10,
  champion: 15,
};
