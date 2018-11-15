import React, { Component } from 'react';
import {
  PanResponder,
  View,
  TouchableHighlight,
  Animated,
  ViewPropTypes,
} from 'react-native';
import PropTypes from 'prop-types';

/* eslint-disable */
export default class Switch extends Component {
  constructor(props) {
    super(props);
    const {
      switchWidth,
      switchHeight,
      buttonRadius,
      buttonOffset,
      active,
    } = this.props;
    const w = (switchWidth - Math.min(switchHeight, buttonRadius * 2) - buttonOffset);
    this.state = {
      width: w,
      state: active,
      position: new Animated.Value(active ? w : buttonOffset),
    };
    this.padding = 8;
    this.start = {};
  }

  componentWillMount() {
    const { position, width } = this.state;
    const { enableSlide } = this.props;
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        if (!enableSlide) return;

        this.setState({ pressed: true });
        this.start.x0 = gestureState.x0;
        this.start.pos = position._value;
        this.start.moved = false;
        this.start.state = this.state.state;
        this.start.stateChanged = false;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!enableSlide) return;

        this.start.moved = true;
        if (this.start.pos == 0) {
          if (gestureState.dx <= width && gestureState.dx >= 0) {
            position.setValue(gestureState.dx);
          }
          if (gestureState.dx > width) {
            position.setValue(width);
          }
          if (gestureState.dx < 0) {
            position.setValue(0);
          }
        }
        if (this.start.pos === width) {
          if (gestureState.dx >= -width && gestureState.dx <= 0) {
            position.setValue(width + gestureState.dx);
          }
          if (gestureState.dx > 0) {
            position.setValue(width);
          }
          if (gestureState.dx < -width) {
            position.setValue(0);
          }
        }
        const currentPos = position._value;
        this.onSwipe(currentPos, this.start.pos,
          () => {
            if (!this.start.state) this.start.stateChanged = true;
            this.setState({ state: true });
          },
          () => {
            if (this.start.state) this.start.stateChanged = true;
            this.setState({ state: false });
          });
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        this.setState({ pressed: false });
        const currentPos = position._value;
        if (!this.start.moved || (Math.abs(currentPos - this.start.pos) < 5 && !this.start.stateChanged)) {
          this.toggle();
          return;
        }
        this.onSwipe(currentPos, this.start.pos, this.activate, this.deactivate);
      },
      onPanResponderTerminate: (evt, gestureState) => {
        const currentPos = position._value;
        this.setState({ pressed: false });
        this.onSwipe(currentPos, this.start.pos, this.activate, this.deactivate);
      },
      onShouldBlockNativeResponder: (evt, gestureState) => true,
    });
  }

    componentWillReceiveProps(nextProps) {
      const { active } = nextProps
      const { position, width } = this.state;
      const { switchAnimationTime, buttonOffset } = this.props;
      this.setState({
        state : active
      })
      Animated.timing(
        position,
        {
          toValue: active ? width : buttonOffset,
          duration: switchAnimationTime,
          useNativeDriver: true,
        },
      ).start();
    }

  onSwipe = (currentPosition, startingPosition, onChange, onTerminate) => {
    const { width } = this.state;
    if (currentPosition - startingPosition >= 0) {
      if (currentPosition - startingPosition > width / 2 || startingPosition === width) {
        onChange();
      } else {
        onTerminate();
      }
    } else if (currentPosition - startingPosition < -width / 2) {
      onTerminate();
    } else {
      onChange();
    }
  }

  activate = () => {
    const { position, width } = this.state;
    const { switchAnimationTime } = this.props;
    Animated.timing(
      position,
      {
        toValue: width,
        duration: switchAnimationTime,
        useNativeDriver: true,
      },
    ).start();
    this.changeState(true);
  }

  deactivate = () => {
    const { position } = this.state;
    const { buttonOffset, switchAnimationTime } = this.props;
    Animated.timing(
      position,
      {
        toValue: buttonOffset,
        duration: switchAnimationTime,
        useNativeDriver: true,
      },
    ).start();
    this.changeState(false);
  }

  changeState = (state) => {
    const { switchAnimationTime } = this.props;
    const callHandlers = this.start.state !== state;
    setTimeout(() => {
      this.setState({ state });
      if (callHandlers) {
        this.callback();
      }
    }, switchAnimationTime / 2);
  }

  callback = () => {
    const { onActivate, onDeactivate, onChangeState } = this.props;
    const { state } = this.state;
    if (state) {
      onActivate();
    } else {
      onDeactivate();
    }
    onChangeState(state);
  }

  toggle = () => {
    const { enableSlide } = this.props;
    const { state } = this.state;
    if (!enableSlide) return;

    if (state) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  render() {
    const {
      enableSlideDragging,
      style,
      activeBackgroundColor,
      inactiveBackgroundColor,
      activeButtonPressedColor,
      inactiveButtonPressedColor,
      activeButtonColor,
      inactiveButtonColor,
      switchHeight,
      switchWidth,
      buttonRadius,
      buttonShadow,
      buttonContent,
    } = this.props;
    const {
      pressed,
      state,
      position,
    } = this.state;

    const doublePadding = this.padding * 2 - 2;
    const halfPadding = doublePadding / 2;

    const panHandlers = enableSlideDragging ? this._panResponder.panHandlers : null;
    const pressHandlers = !enableSlideDragging ? { onPress: () => this.toggle() } : null;

    return (
      <View
        {...panHandlers}
        style={[{ padding: this.padding, position: 'relative' }, style]}
      >
        <View
          style={{
            backgroundColor: state ? activeBackgroundColor : inactiveBackgroundColor,
            height: switchHeight,
            width: switchWidth,
            borderRadius: switchHeight / 2,
          }}
        />
        <TouchableHighlight
          {...pressHandlers}
          underlayColor="transparent"
          activeOpacity={1}
          style={{
            height: Math.max(buttonRadius * 2 + doublePadding, switchHeight + doublePadding),
            width: switchWidth + doublePadding,
            position: 'absolute',
            top: 1,
            left: 1,
          }}
        >
          <Animated.View style={[{
            backgroundColor:
                this.state.state
                  ? (pressed ? activeButtonPressedColor : activeButtonColor)
                  : (pressed ? inactiveButtonPressedColor : inactiveButtonColor),
            height: buttonRadius * 2,
            width: buttonRadius * 2,
            borderRadius: buttonRadius,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            position: 'absolute',
            top: halfPadding + switchHeight / 2 - buttonRadius,
            left: switchHeight / 2 > buttonRadius ? halfPadding : halfPadding + switchHeight / 2 - buttonRadius,
            transform: [{ translateX: position }],
          },
          buttonShadow]}
          >
            {buttonContent}
          </Animated.View>
        </TouchableHighlight>
      </View>
    );
  }
}

Switch.propTypes = {
  active: PropTypes.bool,
  style: ViewPropTypes.style,
  inactiveButtonColor: PropTypes.string,
  inactiveButtonPressedColor: PropTypes.string,
  activeButtonColor: PropTypes.string,
  activeButtonPressedColor: PropTypes.string,
  buttonShadow: ViewPropTypes.style,
  activeBackgroundColor: PropTypes.string,
  inactiveBackgroundColor: PropTypes.string,
  buttonRadius: PropTypes.number,
  switchWidth: PropTypes.number,
  switchHeight: PropTypes.number,
  buttonContent: PropTypes.element,
  buttonOffset: PropTypes.number,
  enableSlide: PropTypes.bool,
  enableSlideDragging: PropTypes.bool,
  switchAnimationTime: PropTypes.number,
  onActivate: PropTypes.func,
  onDeactivate: PropTypes.func,
  onChangeState: PropTypes.func,
};

Switch.defaultProps = {
  active: false,
  style: {},
  inactiveButtonColor: '#2196F3',
  inactiveButtonPressedColor: '#42A5F5',
  activeButtonColor: '#FAFAFA',
  activeButtonPressedColor: '#F5F5F5',
  buttonShadow: {
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 1,
    shadowOffset: { height: 1, width: 0 },
  },
  activeBackgroundColor: 'rgba(255,255,255,.5)',
  inactiveBackgroundColor: 'rgba(0,0,0,.5)',
  buttonRadius: 15,
  switchWidth: 40,
  switchHeight: 20,
  buttonContent: null,
  buttonOffset: 0,
  enableSlide: true,
  enableSlideDragging: true,
  switchAnimationTime: 200,
  onActivate() {},
  onDeactivate() {},
  onChangeState() {},
};
