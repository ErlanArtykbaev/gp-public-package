const LEAFLET_DRAW_LOCAL_RUSSIAN = {
  draw: {
    toolbar: {
      actions: {
        title: 'Отменяет рисование',
        text: 'Отменить',
      },
      finish: {
        title: 'Завершает рисование',
        text: 'Завершить',
      },
      undo: {
        title: 'Удаляет последнюю нарисованную точку',
        text: 'Удалить последнюю точку',
      },
      buttons: {
        polyline: 'Нарисовать линию',
        polygon: 'Нарисовать полигон',
        rectangle: 'Нарисовать прямоугольник',
        circle: 'Нарисовать круг',
        marker: 'Нарисовать маркер',
      },
    },
    handlers: {
      circle: {
        tooltip: {
          start: 'Нажмите на карту и потяните, чтобы нарисовать круг.',
        },
        radius: 'Радиус',
      },
      marker: {
        tooltip: {
          start: 'Нажмите на карту чтобы разместить маркер.',
        },
      },
      polygon: {
        tooltip: {
          start: 'Нажмите, чтобы начать рисовать.',
          cont: 'Нажмите, чтобы продолжить рисовать.',
          end: 'Для завершения нажмите на первую точку.',
        },
      },
      polyline: {
        error: '<strong>Ошибка:</strong> границы не могут пересекаться!',
        tooltip: {
          start: 'Нажмите на карту, чтобы начать рисовать линию.',
          cont: 'Нажмите на карту, чтобы продолжить рисовать линию.',
          end: 'Нажмите на последнюю точку, чтобы закончить.',
        },
      },
      rectangle: {
        tooltip: {
          start: 'Нажмите на карту и потяните, чтобы нарисовать прямоугольник.',
        },
      },
      simpleshape: {
        tooltip: {
          end: 'Отпустите кнопку мыши, чтобы закончить рисование.',
        },
      },
    },
  },
  edit: {
    toolbar: {
      actions: {
        save: {
          title: 'Сохранить изменения.',
          text: 'Сохранить',
        },
        cancel: {
          title: 'Отменить редактирование (удаляет все изменения).',
          text: 'Отменить',
        },
      },
      buttons: {
        edit: 'Редактировать слои.',
        editDisabled: 'Нет слоев для редактирования.',
        remove: 'Удалить слои.',
        removeDisabled: 'Нет слоев для удаления.',
      },
    },
    handlers: {
      edit: {
        tooltip: {
          text: 'Перетащите точки/маркер для изменения элемента.',
          subtext: 'Нажмите "Отменить" чтобы откатить изменения.',
        },
      },
      remove: {
        tooltip: {
          text: 'Нажмите на элемент для удаления',
        },
      },
    },
  },
};

export default function applyDrawLocal(leaflet, drawLocal) {
  leaflet.drawLocal = drawLocal || LEAFLET_DRAW_LOCAL_RUSSIAN;
}
