import transliterate from 'transliterate';

export default name =>
  transliterate(name)
    .toLowerCase()
    .replace(/[^a-z_0-9]/g, '_');
