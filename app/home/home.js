import React, { Component } from 'react';

import {
	View,
	Text,
	StyleSheet,
	Dimensions,
	TouchableOpacity,
	InteractionManager,
	ActivityIndicator,
	AsyncStorage,
	ListView,
	Image,
	Modal
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


//获取屏幕大小
const {width, height} = Dimensions.get('window');
import HomeSiftData from '../data/HomeSiftData.json';

export default class Home extends Component {

	static defaultProps = {
        loadDataNumber:{},   // 回调
    };

	constructor(props) {
		super(props);
		this.state = {
			dataSource: new ListView.DataSource({rowHasChanged:(r1, r2) => r1 !== r2}),   //是否有数据变化
			loaded:false, 
			isHalfHourHotModal: false,    //半小时热门
			isSiftModal: false           //筛选菜单
		}

		this.data = [];

		// 绑定操作
        this.loadData = this.loadData.bind(this);
        this.loadMore = this.loadMore.bind(this);
	}

	//加载最新数据
	loadData(resolve) {
		HTTPBase.get('https://guangdiu.com/api/getlist.php',{"count": 10})
			.then((responseData) => {
				this.data = [];
				this.data = this.data.concat(responseData.data);
				this.setState({
					dataSource: this.state.dataSource.cloneWithRows(this.data),
					loaded: true,
				});

				// 当下拉刷新时关闭刷新动画
                if (resolve !== undefined){
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                }

				this.loadDataNumber();

				//存储数组最后一个ID
				let cnlastID = responseData.data[responseData.data.length - 1].id;
				AsyncStorage.setItem('cnlastID', cnlastID.toString());

				//存储数组第一个ID
				let cnfirstID = responseData.data[0].id;
				AsyncStorage.setItem('cnfirstID', cnfirstID.toString());
			})
			.catch((error) => {
				this.setState({
					loaded: true
				});
			})
	}

	//更多数据
	loadMoreData(value) {
		HTTPBase.get('https://guangdiu.com/api/getlist.php', {"count": 10, "sinceid": value})
			.then((responseData) => {
				this.data = this.data.concat(responseData.data);
				this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(this.data),
                    loaded:true,
                });
                // 存储数组中最后一个元素的id
                let cnlastID = responseData.data[responseData.data.length - 1].id;
                AsyncStorage.setItem('cnlastID', cnlastID.toString());
			})
			.catch((error) => {

			})
	}

	//上拉加载更多
	loadMore() {
		AsyncStorage.getItem('cnlastID')
			.then((value) => {
				this.loadMoreData(value);
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
                "cate" : cate
            };
        }else {
            params = {
                "mall" : mall
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


	//模态到近半个小时热点
	pushToHourHot() {
		this.setState({
			isHalfHourHotModal: true
		});
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

	// 关闭模态
    closeModal(data) {
        this.setState({
            isHalfHourHotModal:data,
            isSiftModal:data,
        })
    }

    // 安卓模态销毁处理
    onRequestClose() {
        this.setState({
            isHalfHourHotModal:false,
            isSiftModal:false,
        })
    }

    //下拉菜单
    showSiftMenu() {
    	this.setState({
            isSiftModal:true,
        })
    }

	renderLeftItem() {
		return (
			<TouchableOpacity
				onPress={() => {this.pushToHourHot()}}
			>
				<Image source={{uri:'hot_icon_20x20'}} style={styles.navBarLeftItemStyle} />
			</TouchableOpacity>
		);
	}

	renderRightItem() {
		return (
			<TouchableOpacity>
				<Image source={{uri:'search_icon_20x20'}} style={styles.navBarRightItemStyle} />
			</TouchableOpacity>
		);
	}

	renderTitleItem() {
		return (
			<TouchableOpacity
				onPress={() => {this.showSiftMenu()}}
			>
				<Image source={{uri:'navtitle_home_down_66x20'}} style={styles.navBarTitleItemStyle} />
			</TouchableOpacity>
		);
	}

	// ListView尾部
    renderFooter() {
        return (
            <View style={{height: 100}}>
                <ActivityIndicator />
            </View>
        );
    }

	// 返回每一行cell的样式
    renderRow(rowData) {
        return(
            <TouchableOpacity
                onPress={() => this.pushToDetail(rowData.id)}
            >
                <CommunalCell
                    image={rowData.image}
                    title={rowData.title}
                    mall={rowData.mall}
                    pubTime={rowData.pubtime}
                    fromSite={rowData.fromsite}
                />
            </TouchableOpacity>
        );
    }

    //渲染首页列表
    renderListView() {
    	if (this.state.loaded === false) {      // 无数据
            return(
                <NoDataView />
            );
        }else{
        	return(
                <PullList ref="pullList"
                    onPullRelease={(resolve) => this.loadData(resolve)}     // 下拉刷新操作
                    dataSource={this.state.dataSource}          // 设置数据源
                    renderRow={this.renderRow.bind(this)}       // 根据数据创建相应 cell
                    showsHorizontalScrollIndicator={false}      // 隐藏水平指示器
                    style={styles.listViewStyle}                // 样式
                    initialListSize={7}                         // 优化:一次渲染几条数据
                    onEndReached={this.loadMore}                // 当接近底部特定距离时调用
                    onEndReachedThreshold={60}                  // 当接近底部60时调用
                    renderFooter={this.renderFooter}            // 设置尾部视图
                    removeClippedSubviews={true}                // 优化
                />
            );
        }
    }

	// 组件加载完成
    componentDidMount() {
        // 刷新数据
        this.loadData();
    }



	render(){
		return(
			<View style={styles.container}>
				{/* 导航栏样式 */}
				<CommunalNavBar
					leftItem = {() => this.renderLeftItem()}
	                titleItem = {() => this.renderTitleItem()}
	                rightItem = {() => this.renderRightItem()}
                />

                {this.renderListView()}

            	{/* 初始化近半小时热门 */}
                <Modal
                	pointerEvents={'box-none'}
                	animationType='slide'
                	transparent={false}
                	visible={this.state.isHalfHourHotModal}
                	onRequestClose={this.onRequestClose} >

                	<Navigator
                        initialRoute={{
                            name:'hourHot',
                            component:HourHot
                        }}

                        renderScene={(route, navigator) => {
                            let Component = route.component;
                            return <Component
                                removeModal={(data) => this.closeModal(data)}
                                {...route.params}
                                navigator={navigator} />
                    }} />
                </Modal>

            	{/* 初始化筛选菜单 */}
            	<Modal
            		pointerEvents={'box-none'}
                	animationType='none'
                	transparent={true}
                	visible={this.state.isSiftModal}
                	onRequestClose={() => this.onRequestClose()}
                >
                	<CommunalSiftMenu
                        removeModal={(data) => this.closeModal(data)}
                        data={HomeSiftData}
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