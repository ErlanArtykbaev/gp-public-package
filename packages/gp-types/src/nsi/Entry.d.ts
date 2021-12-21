export interface EntryVersionObject {
  [key:string]: any;
}

export interface EntryVersion {
  id: number;
  dateStart: string;
  dateEnd: string;
  createDate: string;
  description?: string;
  object: EntryVersionObject;
}
