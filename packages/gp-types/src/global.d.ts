/**
 * Теперь TS не будет ругаться на global.
 * Добавляйте что-то по мере появления новой ругани TS.
 */
declare module NodeJS {
  interface Global {
    APP_DATE_FORMAT: string;
    APP_DATETIME_FORMAT: string;
    SERVER_DATE_FORMAT: string;
    SERVER_DATETIME_FORMAT: string;
    APP_DATE_FORMAT_RUS: string;
    APP_DATETIME_FORMAT_RUS: string;
  }
}
