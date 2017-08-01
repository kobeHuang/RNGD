import React, { Component } from 'react';
import {
	StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    FlatList,
    Dimensions,
    ActivityIndicator,
    InteractionManager
} from 'react-native';

import CommunalHotCell from '../main/communalHotCell';
import CommunalNavBar from '../main/communalNavBar';
import CommunalDetail from '../main/communalDetail';
import HTTPBase from '../http/HTTPBase';

const {width, height} = Dimensions.get('window');

export default class HourHot extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dataSource: [],
			isLoading: true,
			error: false,
			refreshing: false,
            errorInfo: ""
		};
		this.fetchData = this.fetchData.bind(this);
	}

	//网络请求
	fetchData(resolve) {

		HTTPBase.get('http://guangdiu.com/api/gethots.php', {"c": "us"})
			.then((responseJson) => {
				this.setState({
					dataSource: responseJson.data,
					isLoading: false,
					refreshing: false
				});
			})
			.catch((err) => {
                this.setState({
                    error: true,
                    errorInfo: err.error,
                    refreshing: false
                })
            })
	}

	//标题
	renderTitleItem() {
        return(
            <Text style={styles.navbarTitleItemStyle}>近半小时热门</Text>
        );
    }

	//右边关闭按钮
	renderRightItem() {
		return(
			<TouchableOpacity
	            onPress={()=>{this.popToHome(false)}}
	        >
	            <Text style={styles.navbarRightItemStyle}>关闭</Text>
	        </TouchableOpacity>
		);
	}

	//返回首页
	popToHome(data) {
		this.props.removeModal(data);
	}

	//加载详情页
	pushToDetail(val) {
		InteractionManager.runAfterInteractions(() => {
			this.props.navigator.push({
                component: CommunalDetail,
                params: {
                    url: 'https://guangdiu.com/api/showdetail.php' + '?' + 'id=' + val
                }
            });
		});
	}

	//第一次加载loading
	renderLoadingView() {
		return (
			<View style={styles.container}>
	            <ActivityIndicator
	                animating={true}
	                style={[styles.gray, {height: 80}]}
	                color='red'
	                size="large"
	            />
            </View>
        );
	}

	//第一次加载数据错误
	renderErrorView(error) {
		return(
			<View style={styles.container}>
				<Text>
		            Fail: {error}
		        </Text>
	        </View>
		);
	}

	//渲染每一行的组件
	renderItemView({item}) {
		return(
			<TouchableOpacity
                onPress={() => this.pushToDetail(item.id)}
            >
				<CommunalHotCell
					image={item.image}
                    title={item.title}
				 />
			</TouchableOpacity>
		);
	}

	onRefreshing() {
		this.setState({
			refreshing: true
		});
		this.fetchData();
	}

	//渲染列表
	renderListView() {
		
        return(
        	<FlatList
        		data={this.state.dataSource}
        		renderItem={this.renderItemView.bind(this)}
        		refreshing={this.state.refreshing}
        		onRefresh={() => {this.onRefreshing()}}
        		style={styles.listViewStyle}
        	 />
        );
	}

	componentDidMount() {
		this.fetchData();
	}

	render() {
		return(
			<View style={styles.container}>
				<CommunalNavBar
					titleItem = {() => this.renderTitleItem()}
                    rightItem = {() => this.renderRightItem()} 
				/>
				{this.renderListView()}
			</View>
		);
	}
}


const styles = StyleSheet.create({
    container: {
        flex:1,
        alignItems: 'center',
    },

    navbarTitleItemStyle: {
        fontSize:17,
        color:'black',
        marginLeft:50
    },
    navbarRightItemStyle: {
        fontSize:17,
        color:'rgba(123,178,114,1.0)',
        marginRight:15
    },

    listViewStyle: {
        width:width,
    },

    headerPromptStyle: {
        height:44,
        width:width,
        backgroundColor:'rgba(239,239,239,0.5)',
        justifyContent:'center',
        alignItems:'center'
    },
    gray: {
	    backgroundColor: '#cccccc',
	}
});
