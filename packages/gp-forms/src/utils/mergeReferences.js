import unionBy from 'lodash/unionBy';

export default function mergeReferences(...args) {
  const finalReferences = {};
  args.forEach((references = {}) => {
    Object.keys(references).forEach((referenceKey) => {
      const referenceData = references[referenceKey];
      if (finalReferences[referenceKey]) {
        finalReferences[referenceKey] = unionBy(finalReferences[referenceKey], referenceData, 'id');
      } else {
        finalReferences[referenceKey] = referenceData;
      }
    });
  });

  return finalReferences;
}
