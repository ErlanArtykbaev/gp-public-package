import React, { PropTypes } from 'react';
import { autobind } from 'core-decorators';
import { validateRegexp, validateTestRegexp } from '../../validate';
import Div from '@gostgroup/gp-ui-components/lib/Div';
import Input from '../ui/Input';

const regularExpressions = [
  {
    title: 'Собственное выражение',
    example: '',
    regexp: /^$/,
  },
  {
    title: 'ФИО',
    example: 'Иванов Иван Иванович',
    regexp: /^([а-яА-Яa-zA-Z]+\s+[а-яА-Яa-zA-Z]+\s+[а-яА-Яa-zA-Z]+)$/,
  },
  {
    title: 'Электронная почта',
    example: 'user@example.com',
    regexp: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/,
  },
  {
    title: 'Номер телефона',
    example: '7(999)999-99-99',
    regexp: /^[0-9]{1}[(]{1}[0-9]{3,4}[)]{1}[0-9]{3,4}[-]{1}[0-9]{2}[-]{1}[0-9]{2}$/,
  },
  {
    title: 'Дата и время',
    example: '2016-01-07T23:23:23',
    regexp: /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/,
  },
];

@autobind
export default class PrimitiveEditor extends React.Component {

  static propTypes = {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func,
  }

  constructor() {
    super();

    this.state = {
      regexpError: null,
      testError: null,
    };
  }

  onRegexpRequiredChange(newRegexpRequired) {
    const typeConfig = this.props.value;

    this.props.onChange(typeConfig.set('isRegexpRequired', newRegexpRequired));
  }

  onIsTextChange(isText) {
    const typeConfig = this.props.value;
    this.props.onChange(typeConfig.set('isText', isText));
  }

  onRegexpSelect(e) {
    const newTest = regularExpressions[e.target.value].example;
    const newRegexp = regularExpressions[e.target.value].regexp.toString().replace(/[/]/g, '');
    let typeConfig = this.props.value;
    typeConfig = typeConfig.set('regexp', newRegexp);
    typeConfig = typeConfig.set('test', newTest);
    const regexpError = validateRegexp(newRegexp);
    const testError = validateTestRegexp(newTest, newRegexp);

    this.setState({ regexpError, testError });
    this.props.onChange(typeConfig);
  }

  onRegexpChange(newRegexp) {
    const typeConfig = this.props.value;

    const regexpError = validateRegexp(newRegexp);
    const testError = validateTestRegexp(typeConfig.get('test'), newRegexp);

    this.setState({ regexpError, testError });
    this.props.onChange(typeConfig.set('regexp', newRegexp));
  }

  onRegexpTestChange(newTest) {
    const typeConfig = this.props.value;

    const testError = validateTestRegexp(newTest, typeConfig.get('regexp'));

    this.setState({ testError });
    this.props.onChange(typeConfig.set('test', newTest));
  }

  render() {
    const typeConfig = this.props.value;
    const isRegexpRequired = typeConfig.get('isRegexpRequired'); // проверяется ли регуляркой
    const configRegexp = typeConfig.get('regexp'); // регулярка
    const configTest = typeConfig.get('test'); // пример использования регулярки

    const regexpOptions = regularExpressions.map((regexp, index) => <option key={index} value={index} data-example={regexp.example}>{regexp.title}</option>);

    return (
      <div>
        <Input
          type="bool"
          value={isRegexpRequired}
          label="Проверять на соответствие регулярному выражению"
          onChange={this.onRegexpRequiredChange}
        />

        <Div hidden={!isRegexpRequired}>
          <p style={{ color: '#7f8c8d' }}>
            Регулярное выражение должно быть обернуто в символы ^ и $ — <br />
            символы начала и конца строки.<br />
            Пример регулярного выражения, соответствующего трем цифрам: <br />
            ^[0-9]{'{3}'}$<br />
            В поле "Пример" вводится строка, соответствующая регулярному выражению.
          </p>

          <select onChange={this.onRegexpSelect}>{regexpOptions}</select>

          <Input
            value={configRegexp}
            error={this.state.regexpError}
            label="Регулярное выражение"
            onChange={this.onRegexpChange}
          />

          <Input
            value={configTest}
            error={this.state.testError}
            label="Пример"
            onChange={this.onRegexpTestChange}
          />
        </Div>

      </div>
    );
  }

}
