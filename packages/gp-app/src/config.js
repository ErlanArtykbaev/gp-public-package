/* Доступные переменные
 * process.env.VERSION - версия, хранится в package.json
 * process.env.PLATFORM_VERSION - версия GOST PLATFORM, хранится platform.json
 */
// import gostLogo from '@gostgroup/gp-core/lib/assets/images/logo-gost.png';
import createConfig from '@gostgroup/gp-core/lib/config/createConfig';
import nsi from '@gostgroup/gp-core/lib/modules/nsi/module';
// import navigation from './config/navigation';

export default createConfig({
  indexRoute: '/groups/', // начальная страница после логина или при входе в приложение
  // logos: [gostLogo], // логотипы в хедере
  title: 'GOST НСИ', // помещается в header
  // navigation,
  // version_description: `GOST Platform v. ${process.env.PLATFORM_VERSION}`, // помещается в footer на всех страницах,
  group: {
    // columns: ['shortTitle'], // Отображение столбцов в списке групп (ChildrenTable)
  },
  modules: [
    nsi(),
  ],
});
