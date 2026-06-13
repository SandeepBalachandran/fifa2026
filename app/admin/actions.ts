'use server';

import { revalidatePath } from 'next/cache';
import { addParticipant, assignTeam, unassignTeam } from '@/lib/draft/store';
import { updateScoringRules, recalculateAllScores } from '@/lib/scoring/store';
import { runSync } from '@/lib/match-sync';
import type { ScoringRules } from '@/lib/scoring/types';

export async function actionAddParticipant(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  if (name) addParticipant(name);
  revalidatePath('/admin');
  revalidatePath('/leaderboard');
}

export async function actionAssignTeam(formData: FormData) {
  const team = String(formData.get('team') ?? '').trim();
  const owner = String(formData.get('owner') ?? '').trim();
  if (team && owner) assignTeam(team, owner);
  else if (team && !owner) unassignTeam(team);
  revalidatePath('/admin');
  revalidatePath('/draft');
  revalidatePath('/battles');
}

export async function actionUpdateScoringRules(formData: FormData) {
  const rules: ScoringRules = {
    win: Number(formData.get('win')),
    draw: Number(formData.get('draw')),
    loss: Number(formData.get('loss')),
    cleanSheet: Number(formData.get('cleanSheet')),
    groupStageQualification: Number(formData.get('groupStageQualification')),
    roundOf16: Number(formData.get('roundOf16')),
    quarterFinal: Number(formData.get('quarterFinal')),
    semiFinal: Number(formData.get('semiFinal')),
    runnerUp: Number(formData.get('runnerUp')),
    champion: Number(formData.get('champion')),
  };
  updateScoringRules(rules);
  revalidatePath('/admin');
}

export async function actionRecalculate() {
  recalculateAllScores();
  revalidatePath('/leaderboard');
  revalidatePath('/');
}

export async function actionRunSync() {
  await runSync();
  revalidatePath('/fixtures');
  revalidatePath('/battles');
  revalidatePath('/leaderboard');
  revalidatePath('/');
}
