/**
 * Здесь у нас типы для всех хоков.
 * Когда каждый хок будет лежать в отдельной папке,
 * то к нему рядом уже будем прикладывать его типы.
 * В итоге этого файла и папки @types не будет.
 */
export interface ISearchableInjectedProps {
  query?: string;
  setQuery?(value: string): void;
}
