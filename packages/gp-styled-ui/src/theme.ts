export interface ButtonTheme {
  background: {
    color: {
      default: string;
      primary: string;
      danger: string;
      hover: {
        default: string;
        primary: string;
        danger: string;
      };
    };
  };
  border: {
    width: string;
    style: string;
    color: {
      default: string;
      primary: string;
      danger: string;
    };
    radius: string;
  };
  color: {
    default: string;
    primary: string;
    danger: string;
    hover: {
      default: string;
      primary: string;
      danger: string;
    };
  };
  font: {
    size: {
      default: string;
      small: string;
      large: string;
    };
  };
  height: {
    small: string;
    default: string;
    large: string;
  };
  padding: string;
  margin: string;
}
export const buttonTheme: ButtonTheme = {
  background: {
    color: {
      default: '#FFFFFF',
      primary: '#1890ff',
      danger: '#FFFFFF',
      hover: {
        default: '#1890ff',
        primary: '#40a9ff',
        danger: '#f5222d',
      },
    },
  },
  border: {
    width: '1px',
    style: 'solid',
    color: {
      default: 'rgb(217, 217, 217)',
      primary: '#40a9ff',
      danger: '#f5222d',
    },
    radius: '4px',
  },
  color: {
    default: 'rgba(0,0,0,.65)',
    primary: '#FFFFFF',
    danger: '#f5222d',
    hover: {
      default: '#FFFFFF',
      primary: '#FFFFFF',
      danger: '#FFFFFF',
    },
  },
  font: {
    size: {
      default: '14px',
      small: '14px',
      large: '16px',
    },
  },

  height: {
    small: '24px',
    default: '32px',
    large: '40px',
  },
  padding: '0 15px',
  margin: '0 5px 0 0',
};

export interface CircleTheme {
  border: {
    width: string;
    style: string;
    radius: string;
    color: string;
  };
  height: {
    default: string;
    small: string;
    large: string;
  };
  box: {
    shadow: string;
  };
  width: {
    default: string;
    small: string;
    large: string;
  };
  background: {
    color: string;
  };
}
export const circleTheme: CircleTheme = {
  border: {
    width: '1px',
    style: 'solid',
    color: '#FFFFFF',
    radius: '50%',
  },
  box: {
    shadow: '0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)',
  },
  height: {
    default: '40px',
    small: '30px',
    large: '50px',
  },
  width: {
    default: '40px',
    small: '30px',
    large: '50px',
  },
  background: {
    color: '#FFFFFF',
  },
};
export interface Theme {
  button: ButtonTheme;
  circle: CircleTheme;
}

export const theme: Theme = {
  button: buttonTheme,
  circle: circleTheme,
};
