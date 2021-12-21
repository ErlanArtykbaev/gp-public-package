import { Element } from './Element';

export interface NsiEntryVersion<VersionObjectType> {
  dateStart?: string;
  dateEnd?: string;
  id?: number | string;
  object?: VersionObjectType;
}
export interface NsiEntry<VersionType> {
  absolutPath?: string;
  element?: Element;
  fullTitle?: string;
  id?: number | string;
  isAvailable?: boolean;
  lastChange?: string;
  processUUID?: string;
  title?: string;
  versionId?: number;
  rfc?: boolean;
  version?: VersionType;
}

export type CompositeNsiEntry<VersionType, AdditionalType> =
  NsiEntry<VersionType>
  & AdditionalType;

export type CompositeNsiEntryVersion<VersionObjectType, AdditionalType> =
  NsiEntryVersion<VersionObjectType>
  & AdditionalType;

export type DefaultNsiEntry<VersionObjectType> = NsiEntry<NsiEntryVersion<VersionObjectType>>;

export interface NsiRoot {
  absolutPath?: string;
  children: NsiRoot[];
  fullTitle?: string;
  isAvailable?: boolean;
  key: string;
  parent: string;
  permissions: string[];
  shortTitle: string;
  status: string;
  type: string;
}
