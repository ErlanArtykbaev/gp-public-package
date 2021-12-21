import { Schema } from './Schema';

export interface Element {
  key: string;
  fullTitle: string;
  shortTitle: string;
  description?: string;
  parent?: string;
  isAvailable: boolean;
  dateStart?: string;
  dateEnd?: string;
  createDate?: string;
  type: string;
  schema: Schema;
}
