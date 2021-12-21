export default (schema, value = true) => ({
  ...schema,
  config: {
    ...schema.config,
    isInlineEditable: value,
  },
});
