import * as React from 'react';
import './index.scss'

interface HeaderProps {
  className?: string;
};

export default class Title extends React.PureComponent<HeaderProps> {
  constructor(props){
    super(props);
    this.state = {
      fff:3
    }
  }
  getState = ()=>{
    return this.state;
  }
  render() {
    return (
      <h1 className={this.props.className} onClick={()=>{
        console.log(4555)
        this.setState({
          fff:1
        })
      }}>
        {this.props.children}
      </h1>
    )
  }
}
