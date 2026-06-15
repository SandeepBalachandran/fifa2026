export interface TeamArea {
  id: number;
  name: string;
  code: string;
  flag: string | null;
}

export interface RunningCompetition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string | null;
}

export interface Coach {
  id: number | null;
  firstName: string | null;
  lastName: string | null;
  name: string;
  dateOfBirth: string | null;
  nationality: string | null;
}

export type SquadPosition = 'Goalkeeper' | 'Defence' | 'Midfield' | 'Offence';

export interface SquadMember {
  id: number;
  name: string;
  position: SquadPosition;
  dateOfBirth: string | null;
  nationality: string | null;
}

export interface TeamDetails {
  area: TeamArea;
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string | null;
  address: string | null;
  website: string | null;
  founded: number | null;
  clubColors: string | null;
  venue: string | null;
  runningCompetitions: RunningCompetition[];
  coach: Coach;
  squad: SquadMember[];
  lastUpdated: string;
}
