export const UNKNOWN_ERROR = 'gp-core/lib/sideeffects/errors/UNKNOWN_ERROR';

class UnknownError extends Error {}

export function unknownError(err) {
  const payload = err instanceof Error ? err : new UnknownError('UnknownError');
  return {
    type: UNKNOWN_ERROR,
    error: true,
    payload,
  };
}
