export function validateNumber(data) {
  if (!data && data !== 0) {
    return void 0;
  }
  return !/^[- {2}+]?[0-9]*\.?\,?[0-9]+$/.test(data) ? 'Поле должно быть числом' : void 0;
}
