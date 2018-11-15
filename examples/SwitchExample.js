import React, { Component } from 'react';
import { View } from 'react-native';
import Switch from 'rn-material-switch';

class SwitchExample extends Component {
  render() {
    return (
      <View>
        <Switch
          active={true}
          activeButtonColor='#009'
          inactiveButtonColor='#999'
          activeBackgroundColor='#999'
          inactiveBackgroundColor='#999'
          activeButtonPressedColor='#009'
          inactiveButtonPressedColor='#999'
          buttonRadius={11}
          switchWidth={35}
          switchHeight={16}
          onChangeState={(state) => {
            console.log('STATE', state )
          }}
        />
      </View>
    );
  }
}

export default SwitchExample;