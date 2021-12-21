export default function initPropertyFilters(saved = [], schema) {
  const { config } = schema;
  const persistent = config.hasStaticFilters ? (config.staticFilters || []) : [];

  // Для каждого ключа выбираем один фильтр.
  // Если сохраненный = статичный + значение, оставляем его
  // Если у сохраненного и статичного разные типы - убираем сохраненный.

  const refinePersistent = saved
    .filter(f => persistent.some(p => p.key === f.key && p.type === f.type));

  const savedNoconflict = saved
    .filter(f => persistent.every(p => p.key !== f.key))
    .map(f => ({ ...f, persistent: false }));
  const persistentRefined = persistent
    .filter(f => refinePersistent.every(r => r.key !== f.key))
    .concat(refinePersistent)
    .map(f => ({ ...f, persistent: true }));

  return savedNoconflict.concat(persistentRefined);
}
