export default (propertyFilters) => {
  const filter = {
    object: {},
  };

  propertyFilters.forEach((propertyFilter) => {
    if (propertyFilter.type && propertyFilter.key) {
      if (propertyFilter.type === 'equals') {
        filter.object[propertyFilter.key] = propertyFilter.value;
      } else {
        filter.object[propertyFilter.key] = {
          [`$${propertyFilter.type}`]: propertyFilter.value,
        };
      }
    }
  });

  return filter;
};
