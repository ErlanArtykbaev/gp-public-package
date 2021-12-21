/**
 * Типы, не относящиеся к бизнес-логике.
 */

/**
 * Аналог Record<string, any>
 */
export interface StringKeyHashTable<ValueType = any> {
  [key: string]: ValueType;
}
export interface NumberKeyHashTable<ValueType = any> {
  [key: number]: ValueType;
}

export type ArrayOrType<LeftType, RightType> =  LeftType[] | RightType[];
export type OrType<LeftType, RightType> =  LeftType | RightType;

/**
 * Проходит по ключам типа и объединяет значения типов через |
 */
export type ObjectKeysUnion<T> = T[keyof T];
