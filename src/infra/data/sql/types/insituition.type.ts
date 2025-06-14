import { Institution } from '../entities';

export interface EventPayload {
  name: string;
}

export type UpdateInstitutionData = Omit<Partial<Institution>, 'events'> & {
  events?: EventPayload[];
};
