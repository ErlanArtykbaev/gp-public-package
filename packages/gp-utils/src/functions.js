/**
 * Вспомогательные функции
 * @module utils/functions
 */

export function isNotNull(value) {
  return typeof value !== 'undefined' && value !== null;
}

/**
 * Проверяет значение на "пустоту"
 * "Пустым" считается значение undefined, null и пустая строка
 * @example
 * // true
 * isEmpty('');
 * @example
 * // true
 * isEmpty({}.a)
 * @example
 * // true
 * isEmpty(null)
 * @return {boolean} isEmpty - пyстое ли значение
 */
export function isEmpty(value) {
  if (!isNotNull(value)) return true;
  if (typeof value === 'string' && value.length === 0) return true;
  return false;
}

export function isEmptySoft(obj) {
  if (obj == null) return true;
  if (obj.length > 0) return false;
  if (obj.length === 0) return true;
  if (typeof obj !== 'object') return true;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
  }
  return true;
}
