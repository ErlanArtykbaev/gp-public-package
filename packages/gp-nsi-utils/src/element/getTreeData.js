import get from 'lodash/get';

export default function getTreeData(reference_data, element, parentColumns, parentColumn, currentParent) {
  const data = [];
  let is_reference_data = false;
  let useBackendPagination = true;
  let referenceParentColumn;
  let childrenParentColumns;
  Object.keys(reference_data).forEach((id) => {
    const parent = element.element.schema.config.properties.find(prop => prop.id === id);
    if (!parent) {
      return;
    }

    const item = reference_data[id];
    const props = get(item.element.schema, ['config', 'properties']);
    if (!props) {
      return;
    }

    const items = props.filter(prop => (
      prop.type === 'reference' && (prop.config.key === item.element.absolutPath)
    ));
    if (items.length) {
      parent.children = items;
      parentColumns.push(parent);
    }
  });
  useBackendPagination = false;
  // в случае если есть выбранный родитель
  if (currentParent) {
    const parentColumnSplit = currentParent.split('/');
    parentColumn = parentColumnSplit[0];
    referenceParentColumn = parentColumnSplit[1];
  } else {
    parentColumn = parentColumns[0].id;
  }
  let element_versions = element.versions;

  if (reference_data[parentColumn]) {
    childrenParentColumns = parentColumn;
    is_reference_data = true;
    const reference_item = reference_data[parentColumn];
    element_versions = reference_item.versions;
    if (referenceParentColumn) {
      parentColumn = referenceParentColumn;
    } else {
      const refProps = reference_item.element.schema.config.properties;
      const referenceParentColumnObject = refProps.find(prop => (
        prop.type === 'reference' && (prop.config.key === reference_item.element.absolutPath)
      ));
      if (referenceParentColumnObject) {
        parentColumn = referenceParentColumnObject.id;
      }
    }
  }

  const elementItems = element_versions.items.reduce((result, v) => {
    result[v.id] = Object.assign({ $$meta: v, children: [] }, v.version.object);
    return result;
  }, {});
  Object.keys(elementItems).forEach((key) => {
    const item = elementItems[key];
    const referenceId = item[parentColumn];
    if (referenceId == null) { // если элемент корневой или указан как родитель
      data.push(item);
    } else { // если у элемента даты есть родитель и он при этом не ссылается сам на себя
      try {
        elementItems[referenceId].children.push(item); // закидываем этот элемент в родителя
      } catch (e) {
        console.log(e); // eslint-disable-line no-console
      }
    }
  });

  if (is_reference_data) { // если есть данные в reference_data по выбранному классификатору
    const versions = element.versions.items;
    versions.forEach((version) => {
      try {
        const item = version.version.object;
        if (elementItems[item[childrenParentColumns]]) {
          elementItems[item[childrenParentColumns]].children.push({ $$meta: version, children: [], ...item });
        }
      } catch (e) {
        console.log(e); // eslint-disable-line no-console
      }
    });
  }

  return {
    data,
    useBackendPagination,
  };
}
