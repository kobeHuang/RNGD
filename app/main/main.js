import React, { Component } from 'react';

import {
	StyleSheet,
	Platform,
	Image,
    AsyncStorage
} from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';

import TabNavigator from 'react-native-tab-navigator';

import Home from '../home/home';
import HT from '../ht/ht';
import HourList from '../hourList/hourList';
import HTTPBase from '../http/HTTPBase';


export default class AwesomeProject extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedTab: 'home',
            cnbadgeText:'',         // 首页Item角标文本
            usbadgeText:''          // 海淘Item角标文本
		}
	}

    // 获取最新数据个数网络请求
    loadDataNumber() {
        // 取出id
        AsyncStorage.multiGet(['cnfirstID', 'usfirstID'], (error, stores) => {
            // 拼接参数
            let params = {
                "cnmaxid" : stores[0][1],
                "usmaxid" : stores[1][1],
            };

            // 请求数据
            HTTPBase.get('http://guangdiu.com/api/getnewitemcount.php', params)
                .then((responseData) => {
                    this.setState({
                        cnbadgeText:responseData.cn,
                        usbadgeText:responseData.us
                    })
                })
                .catch((error) => {

                })
        });
    }

	// 设置 Navigator 转场动画
    setNavAnimationType(route) {
        if (route.animationType) {      // 有值
            let conf = route.animationType;
            conf.gestures = null;           // 关闭返回手势
            return conf;
        }else {
            return Navigator.SceneConfigs.PushFromRight;    // 默认转场动画
        }
    }

	//返回TabBar的item
	renderTabBarItem(title, selectedTab, image, selectedImage, component, badgeText, subscription) {
		return (
			<TabNavigator.Item
			    selected={this.state.selectedTab === selectedTab}
			    title={title}
                badgeText={badgeText == 0 ? '' : badgeText}
			    selectedTitleStyle={{color:'black'}}
			    renderIcon={() => <Image source={{uri:image}} style={styles.tabbarIconStyle} />}
			    renderSelectedIcon={() => <Image source={{uri:selectedImage}} style={styles.tabbarIconStyle} />}
			    onPress={() => this.setState({ selectedTab: selectedTab })}>
			    
			    <Navigator
                    initialRoute={{
                        name:selectedTab,
                        component:component
                    }}

                    configureScene={(route) => this.setNavAnimationType(route)}

                    renderScene={(route, navigator) => {
                        let Component = route.component;
                        return <Component {...route.params}
                                          navigator={navigator} />
                    }}

                />

			</TabNavigator.Item>
		);
	}

    // 组件加载完成
    componentDidMount() {
        this.loadDataNumber();
        // 最新数据的个数
        setInterval(() => {
            this.loadDataNumber();
        }, 30000);
    }

	render() {
		return(
			<TabNavigator>
				{/* 首页 */}
                {this.renderTabBarItem("首页", 'home', 'tabbar_home_30x30', 'tabbar_home_selected_30x30', Home, this.state.cnbadgeText)}
                {/* 海淘 */}
                {this.renderTabBarItem("海淘", 'ht', 'tabbar_abroad_30x30', 'tabbar_abroad_selected_30x30', HT, this.state.usbadgeText)}
                {/* 小时风云榜 */}
                {this.renderTabBarItem("小时风云榜", 'hourlist', 'tabbar_rank_30x30', 'tabbar_rank_selected_30x30', HourList)}
			</TabNavigator>
		);
	}
}

const styles = StyleSheet.create({
	container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    tabbarIconStyle: {
        width:Platform.OS === 'ios' ? 30 : 25,
        height:Platform.OS === 'ios' ? 30 : 25,
    }
});

