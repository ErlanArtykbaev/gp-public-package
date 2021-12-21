import { isEmpty } from '@gostgroup/gp-utils/lib/functions';

export default function cleanRow(rowConfig, rowData, type = rowConfig.type) {
  if (!rowData) {
    return rowData;
  }
  switch (type) {
    case 'object':
      return rowConfig.config.properties
        .reduce((acc, row) => (acc[row.id] = cleanRow(row, rowData[row.id]), acc), {});
    case 'list':
    case 'table':
      return rowData.reduce((acc, row) => (acc.push(cleanRow(Object.assign({}, rowConfig.typeConfig), row)), acc), []);
    case 'number':
      return (rowData == 0) ? rowData : (typeof rowData === 'string') ? parseFloat(rowData.replace(',', '.')) : rowData;
    case 'bool':
      return !!rowData;
    case 'integer':
    case 'reference':
      return isEmpty(rowData) ? null : parseInt(rowData, 10);
    case 'file': {
      const { uuid, name, mime, size } = rowData;
      return { uuid, name, mime, size };
    }
    default:
      return rowConfig.extends ? cleanRow(rowConfig, rowData, rowConfig.extends) : rowData;
  }
}
