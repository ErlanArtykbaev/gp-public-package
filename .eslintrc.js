var path = require('path');

module.exports = {
  "extends": "airbnb",
  "env": {
    node: true,
    browser: true,
    mocha: true,
  },

  "globals": {
    ol: true,
    window: true,
    document: true,
    confirmDialog: true,
    textDialog: true,
    FileAPI: true,
    __DEVELOPMENT__: true,
  },
  "parser": "babel-eslint",
  "rules": {
    "line": 0,
    "linebreak-style": 0,
    "generator-star-spacing": 0,
    "strict": "off",
    "no-tabs": "error",
    "no-mixed-spaces-and-tabs": "off",
    "no-confusing-arrow": "off",
    "quote-props": "warn",
    "no-underscore-dangle": ["off", { "allowAfterThis": true }], // временно
    "class-methods-use-this": "off",
    "max-len": ["off", 120],
    "camelcase": ["off"], // временно
    "no-param-reassign": ["off"], // временно
    "no-unused-expressions": ["error", { "allowShortCircuit": true }],
    "jsx-a11y/no-static-element-interactions": ["off"],
    "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
    "jsx-a11y/label-has-for": ["off"],
    "react/forbid-prop-types": ["off"],
    "react/no-unused-prop-types": ["error", { skipShapeProps: true }],
    "react/jsx-filename-extension": ["error", { extensions: ['js', '.jsx'] }],
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
  },
  "settings": {
    "import/resolver": {
      "webpack": {
        config: path.resolve(__dirname, 'scripts', 'webpack', 'webpack.config.dev.js')
      }
    }
  }
}
