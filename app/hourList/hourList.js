import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    ListView,
    Dimensions,
    Navigator,
    ActivityIndicator,
    Modal,
    AsyncStorage,
    InteractionManager,
} from 'react-native';

//获取屏幕大小
const {width, height} = Dimensions.get('window');

import {PullList} from 'react-native-pull';

import CommunalNavBar from '../main/communalNavBar';
import CommunalDetail from '../main/communalDetail';
import CommunalCell from '../main/communalCell';
import NoDataView from '../main/NODataView';
import HTTPBase from '../http/HTTPBase';

export default class HourList extends Component {

	constructor(props) {
		super(props);
		
		this.state = {
			dataSource: new ListView.DataSource({rowHasChanged:(r1, r2) => r1 !== r2}),
			loaded: false,
			prompt:'',          // 标题栏状态
            isNextTouch:false   // 下一小时按钮状态
		}

		this.nexthourhour = '';     // 下一小时时间
        this.nexthourdate = '';     // 下一小时日期
        this.lasthourhour = '';     // 上一小时时间
        this.lasthourdate = '';     // 上一小时日期

		this.loadData = this.loadData.bind(this);
	}

	loadData(resolve, date, hour) {
		// 初始化参数对象
        let params = {};

        if (date) {     // 时间有值时
            params = {
                "date" : date,
                "hour" : hour
            }
        }

		HTTPBase.get('http://guangdiu.com/api/getranklist.php', params)
			.then((responseData) => {
				let isNextTouch = true;
				if(responseData.hasnexthour == 1 ){
					isNextTouch = false;
				}

				this.setState({
					dataSource: this.state.dataSource.cloneWithRows(responseData.data),
					loaded: true,
					prompt: responseData.displaydate + responseData.rankhour + '点档' + '(' + responseData.rankduring + ')',
					isNextTouch: isNextTouch
				});

				// 关闭刷新动画
                if (resolve !== undefined){
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                }

                this.nexthourhour = responseData.nexthourhour;
                this.nexthourdate = responseData.nexthourdate;
                this.lasthourhour = responseData.lasthourhour;
                this.lasthourdate = responseData.lasthourdate;
			})
	}

	renderTitleItem() {
		return(
			<Image source={{uri:'navtitle_rank_106x20'}} style={styles.navBarTitleItemStyle} />
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
		if (this.state.loaded === false) {
            return(
                <NoDataView />
            );
        }else {
            return(
                <PullList
                    onPullRelease={(resolve) => this.loadData(resolve)}
                    dataSource={this.state.dataSource}
                    renderRow={this.renderRow.bind(this)}
                    showsHorizontalScrollIndicator={false}
                    style={styles.listViewStyle}
                    initialListSize={5}
                />
            );
        }
	}

	// 上一小时点击事件
    lastHour() {
        this.loadData(undefined, this.lasthourdate, this.lasthourhour);
    }

    // 下一小时点击事件
    nextHour() {
        this.loadData(undefined, this.nexthourdate, this.nexthourhour);
    }

	componentDidMount() {
		this.loadData();
	}

	render(){
		return(
			<View style={styles.container}>
				<CommunalNavBar
					leftItem={() => this.renderTitleItem()} 
				/>

				<View style={styles.promptViewStyle}>
					<Text>{this.state.prompt}</Text>
				</View>

				{this.renderListView()}

				<View style={styles.operationViewStyle}>
                    {/* 上一小时按钮 */}
                    <TouchableOpacity
                        onPress={() => this.lastHour()}
                    >
                        <Text style={{marginRight:10, fontSize:17, color:'green'}}>{"< " + "上1小时"}</Text>
                    </TouchableOpacity>

                    {/* 下一小时按钮 */}
                    <TouchableOpacity
                        onPress={() => this.nextHour()}
                        disabled={this.state.isNextTouch}
                    >
                        <Text style={{marginLeft:10, fontSize:17, color:this.state.isNextTouch == false ? 'green' : 'gray'}}>{"下1小时" + " >"}</Text>
                    </TouchableOpacity>
                </View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
    },

    navBarTitleItemStyle: {
        width:106,
        height:20,
        marginLeft:(width-106)/2
    },
    navBarRightItemStyle: {
        fontSize:17,
        color:'rgba(123,178,114,1.0)',
        marginRight:15,
    },

    promptViewStyle: {
        width:width,
        height:44,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'rgba(251,251,251,1.0)',
    },

    operationViewStyle: {
        width:width,
        height:44,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
    },
});
