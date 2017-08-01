import React, { Component, PropTypes } from 'react';

import {
    StyleSheet,
    WebView,
    View,
    Text,
    TouchableOpacity,
    DeviceEventEmitter,
    Image,
} from 'react-native';

import CommunalNavBar from '../main/communalNavBar';

export default class CommunalDetail extends Component {
	static propTypes = {
        url:PropTypes.string,
    };

    pop() {
    	this.props.navigator.pop();
    }

    renderLeftItem() {
    	return(
    		<TouchableOpacity
    			onPress={() => this.pop()}
    		>
    			<View style={{flexDirection:'row', alignItems:'center'}}>
                    <Image source={{uri:'back'}} style={styles.navBarLeftItemStyle} />
                    <Text>返回</Text>
                </View>
    		</TouchableOpacity>
    	);
    }

    componentWillMount() {
    	DeviceEventEmitter.emit('isHiddenTabBar', true);
    }

    componentWillUnmount() {
    	DeviceEventEmitter.emit('isHiddenTabBar', false);
    }

    render() {
    	return(
    		<View style={styles.container}>
    			<CommunalNavBar
    				leftItem={() =>  this.renderLeftItem() } 
    			/>

    			<WebView ref="webView"
                    style={styles.webViewStyle}                     // 样式
                    source={{uri:this.props.url, method: 'GET' }}   // 路径(uri:路径, method:请求方式)
                    javaScriptEnabled={true}                        // 安卓平台允许javaScript
                    domStorageEnabled={true}                        // 安卓平台允许DOM本地存储
                    scalesPageToFit={false}                         // 不允许网页缩放或用户改变缩放比例
                />
    		</View>
    	);
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1
    },

    webViewStyle: {
        flex:1
    },

    navBarLeftItemStyle: {
        width:20,
        height:20,
        marginLeft:15,
    },
});