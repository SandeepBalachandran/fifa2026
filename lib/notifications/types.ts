export type NotificationType =
  | 'MATCH_WIN'
  | 'MATCH_DRAW'
  | 'MATCH_LOSS'
  | 'QUALIFICATION'
  | 'ELIMINATION'
  | 'BATTLE_RESULT'
  | 'RANK_CHANGE';

export interface AppNotification {
  id: string;
  participantName: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  read: boolean;
}
