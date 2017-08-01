/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';

// 引入外部文件
import LaunchPage from './app/main/launchPage';

export default class AwesomeProject extends Component {
  render() {
    return (
        <Navigator
            initialRoute={{
                name:'launchPage',
                component:LaunchPage
            }}

            renderScene={(route, navigator) => {
                let Component = route.component;
                return <Component {...route.params} navigator={navigator} />
            }}
        />
    );
  }
}

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
