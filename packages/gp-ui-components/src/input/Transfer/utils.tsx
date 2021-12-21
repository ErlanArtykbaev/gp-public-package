
export const intersectionFilter = (
  sourceArray: any[],
  seekingArray: number[],
  key = 'id',
) => sourceArray.filter(item => seekingArray.includes(item[key]));

export const differenceFilter = (
  sourceArray: any[],
  seekingArray: number[],
  key = 'id',
) => sourceArray.filter(item => !seekingArray.includes(item[key]));
