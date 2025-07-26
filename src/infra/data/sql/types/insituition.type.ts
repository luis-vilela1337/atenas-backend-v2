import { Institution } from '../entities';

export interface EventPayload {
  id?: string;
  name: string;
}

export type UpdateInstitutionData = Omit<Partial<Institution>, 'events'> & {
  events?: EventPayload[];
};
