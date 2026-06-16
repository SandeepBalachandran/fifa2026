export interface PersonCurrentTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string | null;
}

export interface PersonDetail {
  id: number;
  name: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  position: string | null;
  shirtNumber: number | null;
  lastUpdated: string;
  currentTeam: PersonCurrentTeam | null;
}
