import React, { Component } from 'react';

import {
	View,
	Text,
	StyleSheet,
	Dimensions,
	ListView,
	TouchableOpacity,
	ActivityIndicator,
	InteractionManager,
	Modal,
	Image,
	AsyncStorage
} from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';
import { PullList } from 'react-native-pull';

import CommunalNavBar from '../main/communalNavBar';
import CommunalDetail from '../main/communalDetail';
import CommunalCell from '../main/communalCell';
import CommunalSiftMenu from '../main/communalSiftMenu'
import NoDataView from '../main/NODataView';
import HourHot from './hourHot';
import HTTPBase from '../http/HTTPBase';
import HTSiftData from '../data/HTSiftData.json';

//获取屏幕大小
const {width, height} = Dimensions.get('window');

export default class HT extends Component {
	constructor(props) {
		super(props);

		this.state = {
			dataSource: new ListView.DataSource({rowHasChanged:(r1, r2) => r1 !== r2}),
			loaded: false,
			isHalfHourHotModal: false,
			isSiftModal: false
		}

		this.data = [];

		this.loadData = this.loadData.bind(this);
		this.loadMore = this.loadMore.bind(this);
	}

	loadData(resolve){
		HTTPBase.get('https://guangdiu.com/api/getlist.php',{
			"count": 10,
			"country": 'us'
		})
		.then((responseData) => {
			this.data = [];
			this.data = this.data.concat(responseData.data);
			this.setState({
				dataSource: this.state.dataSource.cloneWithRows(this.data),
				loaded: true
			});

			// 关闭刷新动画
            if (resolve !== undefined){
                setTimeout(() => {
                    resolve();
                }, 1000);
            }

            // 存储数组中最后一个元素的id
            let uslastID = responseData.data[responseData.data.length - 1].id;
            AsyncStorage.setItem('uslastID', uslastID.toString());

            // 存储数组中第一个元素的id
            let usfirstID = responseData.data[0].id;
            AsyncStorage.setItem('usfirstID', usfirstID.toString());

		})
		.catch((erroe) => {
			this.setSate({
				loaded: true
			});
		})
	}

	loadMore() {
		AsyncStorage.getItem('uslastID')
			.then((value) => {
				this.loadMoreData(value);
			})
	}

	loadMoreData(uslastID) {
		HTTPBase.get('https://guangdiu.com/api/getlist.php',{
			count: 10,
			country: 'us',
			sinceid: uslastID
		})
		.then((responseData) => {
			this.data = this.data.concat(responseData.data);
			this.setState({
				dataSource: this.state.dataSource.cloneWithRows(this.data),
				loaded: true
			});

			let uslastID = responseData.data[responseData.data.length - 1].id;
            AsyncStorage.setItem('uslastID', uslastID.toString());
		})
	}

	loadSiftData(mall, cate) {
		// 初始化参数对象
        let params = {};

        if (mall === "" && cate === "") {   // 全部
            this.loadData(undefined);
            return;
        }

        if (mall === "") {  // cate 有值
            params = {
                "cate" : cate,
                "country" : "us"
            };
        }else {
            params = {
                "mall" : mall,
                "country" : "us"
            };
        }
        // 筛选请求
        HTTPBase.get('https://guangdiu.com/api/getlist.php', params)
            .then((responseData) => {

                // 清空数组
                this.data = [];

                // 拼接数据
                this.data = this.data.concat(responseData.data);

                // 重新渲染
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(this.data),
                    loaded:true,
                });

                // 存储数组中最后一个元素的id
                let cnlastID = responseData.data[responseData.data.length - 1].id;
                AsyncStorage.setItem('cnlastID', cnlastID.toString());

            })
            .catch((error) => {
                // 网络等问题处理
            })
	}

	pushToHourHot() {
		this.setState({
			isHalfHourHotModal: true
		});
	}

	showSiftMenu() {
		this.setState({
			isSiftModal: true
		});
	}

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

	renderLeftItem() {
		return(
			<TouchableOpacity
				onPress={() => {this.pushToHourHot()}}
			>
				<Image source={{uri: 'hot_icon_20x20'}} style={styles.navBarLeftItemStyle} />
			</TouchableOpacity>
		);
	}

	renderRightItem(){
		return (
			<TouchableOpacity>
				<Image source={{uri:'search_icon_20x20'}} style={styles.navBarRightItemStyle} />
			</TouchableOpacity>
		);
	}

	renderTitleItem() {
		return(
			<TouchableOpacity
				onPress={() => {this.showSiftMenu()}}
			>
				<Image source={{uri: 'navtitle_home_down_66x20'}} style={styles.navBarTitleItemStyle} />
			</TouchableOpacity>
		);
	}

	renderFooter() {
		return(
			<View style={{height: 100}}>
				<ActivityIndicator />
			</View>
		);
	}

	renderRow(rowData) {
		return(
			<TouchableOpacity
				onPress={() => this.pushToDetail(rowData.id)}
			>
				<CommunalCell
					title={rowData.titel}
					image={rowData.image}
					mall={rowData.mall}
					pubTime={rowData.pubtime}
					fromSite={rowData.fromsite} 
				/>
			</TouchableOpacity>
		);
	}

	renderListView() {
		if(!this.state.loaded){
			return(
				<NoDataView />
			);
		}else{
			return(
				<PullList
					ref="pullList"
					onPullRelease={(resolve) => {this.loadData(resolve)}}
					dataSource={this.state.dataSource}
					renderRow={this.renderRow.bind(this)}
					showsHorizontalScrollIndicator={false}
					style={styles.listViewStyle}
					initialListSize={7}
					onEndReached={this.loadMore} 
					onEndReachedThreshold={60}
					renderFooter={this.renderFooter}
				/>
			);
		}
	}

	removeModal(data) {
		this.setState({
			isHalfHourHotModal: data,
			isSiftModal: data
		});
	}

	closeModal(data) {
        this.setState({
            isUSHalfHourHotModal:data,
            isSiftModal:data
        });
    }

	onRequestClose() {
		this.setState({
			isHalfHourHotModal: false,
			isSiftModal: false
		});
	}

	componentDidMount() {
		this.loadData();
	}

	render(){
		return(
			<View style={styles.container}>
				<CommunalNavBar
					leftItem = {() => this.renderLeftItem()}
	                titleItem = {() => this.renderTitleItem()}
	                rightItem = {() => this.renderRightItem()}
                />

                {this.renderListView()}

                <Modal
                	visible={this.state.isHalfHourHotModal}
                	animateType='slide'
                	transparent={false}
                	onRequestClose={() => this.onRequestClose()}
                >
                	<Navigator
                		initialRoute={{
                			name: 'HourHot',
                			component: HourHot
                		}}
                		renderScene = {(route, navigator) => {
                			let Component = route.component;
                			return(
                				<Component
                					removeModal = {(data) => this.removeModal(data)}
                					navigator = {navigator}
                				/>
                			);
                		}} 
                	/>
                </Modal>
                {/* 初始化筛选菜单 */}
                <Modal
                    animationType='none'
                    transparent={true}
                    visible={this.state.isSiftModal}
                    onRequestClose={() => this.onRequestClose()}
                >
                    <CommunalSiftMenu
                        removeModal={(data) => this.closeModal(data)}
                        data={HTSiftData}
                        loadSiftData={(mall, cate) => this.loadSiftData(mall, cate)} />
                </Modal>
			</View>
		);
	}
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        alignItems: 'center',
        backgroundColor: 'white',
    },

    navBarLeftItemStyle: {
        width:20,
        height:20,
        marginLeft:15,
    },
    navBarTitleItemStyle: {
        width:66,
        height:20,
    },
    navBarRightItemStyle: {
        width:20,
        height:20,
        marginRight:15,
    },

    listViewStyle: {
        width:width,
    },
});