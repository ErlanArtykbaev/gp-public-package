import filter from 'lodash/filter';
import last from 'lodash/last';
import isEqual from 'lodash/isEqual';
import GJV from 'geojson-validation';

const validateGeoJSONResult = {
  required: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
      message: config => `Поле "${config.title}" должно быть полностью заполнено`,
    },
  },
  forceRequiredIfType: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
    },
  },
  validCoordinates: {
    passed: {
      result: true,
    },
    fail: {
      result: false,
    },
  },
};

export const validators = [];

function isCoordinateEmpty(coordinate) {
  if (typeof coordinate === 'undefined' || coordinate === null || coordinate.length === 0) {
    return true;
  }

  return false;
}

function validateCoordinate(coordinate) {
  if (typeof coordinate === 'undefined' || coordinate === null || coordinate.length === 0) return undefined;
  return typeof coordinate !== 'number' && !/^[- {2}+]?[0-9]*\.?[0-9]+$/.test(coordinate) ? 'Координата должна быть числом' : undefined;
}

function validateLatitude(coordinate) {
  const error = validateCoordinate(coordinate);
  if (error) return error;
  const asFloat = parseFloat(coordinate);
  if (asFloat > 90 || asFloat < -90) {
    return 'Широта должна находиться в диапазоне [-90, 90]';
  }
  return undefined;
}

function validateLongitude(coordinate) {
  const error = validateCoordinate(coordinate);
  if (error) return error;
  const asFloat = parseFloat(coordinate);
  if (asFloat > 180 || asFloat < -180) {
    return 'Долгота должна находиться в диапазоне [-180, 180]';
  }
  return undefined;
}

// TODO почему-то data instanceof GeoJSONFeature всегда возвращает false

export const fixedValidators = [
  {
    name: 'required',
    validator(config, data) {
      if (!config.required) {
        return validateGeoJSONResult.required.passed;
      }
      if (!GJV.valid(data)) {
        return validateGeoJSONResult.required.fail;
      }
      // if (!data || !data.type || !data.geometry.type) {
      //   return `Поле "${config.title}" должно быть полностью заполнено`;
      // }
      return validateGeoJSONResult.required.passed;
    },
  },
  {
    // Проверка заполнения координат если выбран тип
    name: 'forceRequiredIfType',
    validator(config, data) {
      if (!data || !data.features || !data.features.length) {
        return validateGeoJSONResult.forceRequiredIfType.passed;
      }
      const errors = [];
      data.features.forEach((feature, index) => {
        if (!feature.geometry || !feature.geometry.type) {
          return;
        }

        let hasErrors = false;

        const type = feature.geometry.type;
        const coordinates = feature.geometry.coordinates;

        if (type === 'Point') {
          coordinates.forEach((c) => {
            if (isCoordinateEmpty(c)) {
              hasErrors = true;
            }
          });
        } else if (type === 'LineString') {
          coordinates.forEach((c) => {
            c.forEach((innerC) => {
              if (isCoordinateEmpty(innerC)) {
                hasErrors = true;
              }
            });
          });
        } else if (type === 'Polygon') {
          // TODO сделать для внутренних полигонов так же
          coordinates[0].forEach((c) => {
            c.forEach((innerC) => {
              if (isCoordinateEmpty(innerC)) {
                hasErrors = true;
              }
            });
          });
          if (!hasErrors) {
            const firstPoint = coordinates[0][0];
            const lastPoint = last(coordinates[0]);
            if (!isEqual(firstPoint, lastPoint)) {
              errors[index] = 'Координаты первой и последней точки полигона должны совпадать';
            }
          }
        }

        if (hasErrors) {
          errors[index] = 'При выбранном типе координаты должны быть полностью заполнены';
        }
      });

//  CRUTCH: Не самое лучшее решение, но пока оставлю так
      validateGeoJSONResult.forceRequiredIfType.fail.message = () => errors;

      return filter(errors).length > 0 ? validateGeoJSONResult.forceRequiredIfType.fail : validateGeoJSONResult.forceRequiredIfType.passed;
    },
  },
  {
    name: 'validCoordinates',
    validator(config, data) {
      if (!data || !data.features || !data.features.length) {
        return validateGeoJSONResult.validCoordinates.passed;
      }

      const errors = [];

      data.features.forEach((feature, index) => {
        let error = [];
        if (!feature.geometry || !feature.geometry.type) {
          return;
        }
        const { type, coordinates } = feature.geometry;

        if (type === 'Point') {
          const latitudeError = validateLatitude(coordinates[1]);
          const longitudeError = validateLongitude(coordinates[0]);

          error[0] = { latitudeError, longitudeError };
        } else if (type === 'LineString') {
          coordinates.forEach((coordinate, i) => {
            const latitudeError = validateLatitude(coordinate[1]);
            const longitudeError = validateLongitude(coordinate[0]);

            const currentError = { latitudeError, longitudeError };

            error[i] = currentError;
          });
        } else {
          coordinates[0].forEach((coordinate, i) => {
            const latitudeError = validateLatitude(coordinate[1]);
            const longitudeError = validateLongitude(coordinate[0]);

            const currentError = { latitudeError, longitudeError };

            error[i] = currentError;
          });
        }

        error = error.map(e => e.latitudeError || e.longitudeError ? e : null);

        if (filter(error).length > 0) {
          errors[index] = error;
        }
      });

//    return filter(errors).length > 0 ? errors : undefined;

//  CRUTCH: Не самое лучшее решение, но пока оставлю так
      validateGeoJSONResult.validCoordinates.fail.message = () => errors;

      return filter(errors).length > 0 ? validateGeoJSONResult.validCoordinates.fail : validateGeoJSONResult.validCoordinates.passed;
    },
  },
];
