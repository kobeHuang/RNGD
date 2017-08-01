import React, { Component, PropTypes } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Platform,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default class communalNavBar extends Component {

	static propTypes = {
		leftItem: PropTypes.func,
		rightItem: PropTypes.func,
		titleItem: PropTypes.func
	}

	renderLeftItem() {
		if(this.props.leftItem) return this.props.leftItem();
		return;
	}

	renderRightItem() {
		if(this.props.rightItem) return this.props.rightItem();
		return;
	}

	renderTitleItem() {
		if(this.props.titleItem) return this.props.titleItem();
		return;
	}

	render() {
		return (
			<View style={styles.container}>
				<View>
					{this.renderLeftItem()}
				</View>
				<View>
					{this.renderTitleItem()}
				</View>
				<View>
					{this.renderRightItem()}
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
        width:width,
        height:Platform.OS === 'ios' ? 64 : 44,
        backgroundColor:'white',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        borderBottomWidth:0.5,
        borderBottomColor:'gray',
        paddingTop:Platform.OS === 'ios' ? 15 : 0,
    }
});