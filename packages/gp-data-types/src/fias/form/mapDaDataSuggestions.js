function withTypes(data, fields) {
  const dataWithTypes = {
    ...data,
    ...fields.reduce((res, field) => ({
      ...res,
      [`${field}_with_type`]: data[field] ? `${data[`${field}_type`]} ${data[field]}` : undefined,
    }), {}),
  };
  return dataWithTypes;
}

export default function mapDaDataSuggestions(suggestion) {
  return { value: suggestion.value, label: suggestion.value, addressData: withTypes(suggestion.data, ['house', 'block']), unrestricted_value: suggestion.unrestricted_value };
}
