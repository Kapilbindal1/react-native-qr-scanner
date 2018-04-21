import React, {Component} from 'react';
import Camera from 'react-native-camera';
import PropTypes from 'prop-types';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Animated,
  Easing,
  Text,
  Image,
  Vibration,
  NativeModules
} from 'react-native';

const CameraManager = NativeModules.CameraManager || NativeModules.CameraModule;

/**
 * 扫描界面遮罩
 * 单独写一个类，方便拷贝使用
 */
class QRScannerRectView extends Component {
  static defaultProps = {
    maskColor: '#0000004D',
    cornerColor: '#22ff00',
    borderColor: '#000000',
    rectHeight: 200,
    rectWidth: 200,
    borderWidth: 0,
    cornerBorderWidth: 4,
    cornerBorderLength: 20,
    isLoading: false,
    cornerOffsetSize: 1,
    isCornerOffset: true,
    bottomHeight: 100,
    scanBarAnimateTime: 2500,
    scanBarColor: '#22ff00',
    scanBarImage: null,
    scanBarHeight: 1.5,
    scanBarMargin: 6,
    hintText: '将二维码/条码放入框内，即可自动扫描',
    hintTextStyle: {
      color: '#fff',
      fontSize: 14,
      backgroundColor: 'transparent'
    },
    hintTextPosition: 130,
    isShowScanBar: true
  };

  constructor(props) {
    super(props);
    this.state = {
      topWidth: 0,
      topHeight: 0,
      leftWidth: 0,
      animatedValue: new Animated.Value(0)
    }
  }

  //获取背景颜色
  getBackgroundColor = () => {
    return ({backgroundColor: this.props.maskColor});
  }

  //获取扫描框背景大小
  getRectSize = () => {
    return ({height: this.props.rectHeight, width: this.props.rectWidth});
  }

  //获取扫描框边框大小
  getBorderSize = () => {
    if (this.props.isCornerOffset) {
      return ({
        height: this.props.rectHeight - this.props.cornerOffsetSize * 2,
        width: this.props.rectWidth - this.props.cornerOffsetSize * 2
      });
    } else {
      return ({height: this.props.rectHeight, width: this.props.rectWidth});
    }
  }

  //获取扫描框转角的颜色
  getCornerColor = () => {
    return ({borderColor: this.props.cornerColor});
  }

  //获取扫描框转角的大小
  getCornerSize = () => {
    return ({height: this.props.cornerBorderLength, width: this.props.cornerBorderLength});
  }

  //获取扫描框大小
  getBorderWidth = () => {
    return ({borderWidth: this.props.borderWidth});
  }

  //获取扫描框颜色
  getBorderColor = () => {
    return ({borderColor: this.props.borderColor});
  }

  //渲染加载动画
  renderLoadingIndicator = () => {
    if (!this.props.isLoading) {
      return null;
    }

    return (<ActivityIndicator
      animating={this.props.isLoading}
      color={this.props.color}
      size='large'/>);
  }

  //测量整个扫描组件的大小
  measureTotalSize = (e) => {
    let totalSize = e.layout;
    this.setState({topWidth: totalSize.width})
  }

  //测量扫描框的位置
  measureRectPosition = (e) => {
    let rectSize = e.layout;
    this.setState({topHeight: rectSize.y, leftWidth: rectSize.x})
  }

  //获取顶部遮罩高度
  getTopMaskHeight = () => {
    if (this.props.isCornerOffset) {
      return this.state.topHeight + this.props.rectHeight - this.props.cornerOffsetSize;
    } else {
      return this.state.topHeight + this.props.rectHeight;
    }
  }

  //获取底部遮罩高度
  getBottomMaskHeight = () => {
    if (this.props.isCornerOffset) {
      return this.props.rectHeight + this.state.topHeight - this.props.cornerOffsetSize;
    } else {
      return this.state.topHeight + this.props.rectHeight;
    }
  }

  //获取左右两边遮罩高度
  getSideMaskHeight = () => {
    if (this.props.isCornerOffset) {
      return this.props.rectHeight - this.props.cornerOffsetSize * 2;
    } else {
      return this.props.rectHeight;
    }
  }

  //获取左右两边遮罩宽度
  getSideMaskWidth = () => {
    if (this.props.isCornerOffset) {
      return this.state.leftWidth + this.props.cornerOffsetSize;
    } else {
      return this.state.leftWidth;
    }
  }

  getBottomHeight = () => {
    return ({bottom: this.props.bottomHeight});
  }

  getScanBarMargin = () => {
    return ({marginRight: this.props.scanBarMargin, marginLeft: this.props.scanBarMargin})
  }

  getScanImageWidth = () => {
    return this.props.rectWidth - this.props.scanBarMargin * 2
  }

  //绘制扫描线
  _renderScanBar = () => {
    if (!this.props.isShowScanBar) 
      return;
    if (this.props.scanBarImage) {
      return <Image
        style={{
        resizeMode: 'contain',
        width: this.getScanImageWidth()
      }}
        source={this.props.scanBarImage}/>
    } else {
      return <View
        style={[
        this.getScanBarMargin(), {
          backgroundColor: this.props.scanBarColor,
          height: this.props.scanBarHeight
        }
      ]}/>
    }
  }

  render() {
    const animatedStyle = {
      transform: [
        {
          translateY: this.state.animatedValue
        }
      ]
    };
    return (
      <View
        onLayout={({nativeEvent: e}) => this.measureTotalSize(e)}
        style={[
        styles.container, this.getBottomHeight()
      ]}>

        <View
          style={[
          styles.viewfinder, this.getRectSize()
        ]}
          onLayout={({nativeEvent: e}) => this.measureRectPosition(e)}>
          <View
            style={[
            this.getBorderSize(),
            this.getBorderColor(),
            this.getBorderWidth()
          ]}>

            <Animated.View style={[animatedStyle]}>
              {this._renderScanBar()}
            </Animated.View>

          </View>
          <View
            style={[
            this.getCornerColor(),
            this.getCornerSize(),
            styles.topLeftCorner, {
              borderLeftWidth: this.props.cornerBorderWidth,
              borderTopWidth: this.props.cornerBorderWidth
            }
          ]}/>
          <View
            style={[
            this.getCornerColor(),
            this.getCornerSize(),
            styles.topRightCorner, {
              borderRightWidth: this.props.cornerBorderWidth,
              borderTopWidth: this.props.cornerBorderWidth
            }
          ]}/>
          {this.renderLoadingIndicator()}
          <View
            style={[
            this.getCornerColor(),
            this.getCornerSize(),
            styles.bottomLeftCorner, {
              borderLeftWidth: this.props.cornerBorderWidth,
              borderBottomWidth: this.props.cornerBorderWidth
            }
          ]}/>
          <View
            style={[
            this.getCornerColor(),
            this.getCornerSize(),
            styles.bottomRightCorner, {
              borderRightWidth: this.props.cornerBorderWidth,
              borderBottomWidth: this.props.cornerBorderWidth
            }
          ]}/>
        </View>

        <View
          style={[
          this.getBackgroundColor(),
          styles.topMask, {
            bottom: this.getTopMaskHeight(),
            top: 0,
            width: this.state.topWidth
          }
        ]}/>

        <View
          style={[
          this.getBackgroundColor(),
          styles.leftMask, {
            height: this.getSideMaskHeight(),
            width: this.getSideMaskWidth()
          }
        ]}/>

        <View
          style={[
          this.getBackgroundColor(),
          styles.rightMask, {
            height: this.getSideMaskHeight(),
            width: this.getSideMaskWidth()
          }
        ]}/>

        <View
          style={[
          this.getBackgroundColor(),
          styles.bottomMask, {
            top: this.getBottomMaskHeight(),
            width: this.state.topWidth
          }
        ]}/>

        <View
          style={{
          position: 'absolute',
          bottom: this.props.hintTextPosition
        }}>
          <Text style={this.props.hintTextStyle}>{this.props.hintText}</Text>
        </View>

      </View>
    );
  }

  componentDidMount() {
    this.scannerLineMove();
  }

  scannerLineMove() {
    this.state.animatedValue.setValue(0); //重置Rotate动画值为0
    Animated.timing(
      this.state.animatedValue,
      {toValue: this.props.rectHeight,
      duration: this.props.scanBarAnimateTime,
      easing: Easing.linear
    }).start(() => this.scannerLineMove());
  }
}

/**
 * 扫描界面
 */
export default class QRScannerView extends Component {
  constructor(props) {
    super(props);
    //通过这句代码屏蔽 YellowBox
    console.disableYellowBox = true;
    this.state = {
      scanning: false,
    }
  }
  static defaultProps =  {
    onRead: ()=>{},
    renderTopView: () =>{},
    renderBottomView: ()=><View style={{flex:1,backgroundColor:'#0000004D'}}/>,
    rectHeight: 200,
    rectWidth: 200,
    torchMode: false  // 手电筒模式
  }
  render() {
    return (
      <View style={{
        flex: 1
      }}>
        <Camera
         style={{
          flex: 1
        }}
          onBarCodeRead={this._handleBarCodeRead}
          torchMode={!this.props.torchMode ? CameraManager.TorchMode.off : CameraManager.TorchMode.on}
          barcodeFinderVisible={true}
					barcodeFinderWidth={this.props.rectWidth+30}
					barcodeFinderHeight={this.props.rectHeight+140}
          barcodeFinderStyle={{borderWidth:0}}>
          <View style={[styles.topButtonsContainer, this.props.topViewStyle]}>
            {this.props.renderTopView()}
          </View>
          <QRScannerRectView
            maskColor={this.props.maskColor}
            cornerColor={this.props.cornerColor}
            borderColor={this.props.borderColor}
            rectHeight={this.props.rectHeight}
            rectWidth={this.props.rectWidth}
            borderWidth={this.props.borderWidth}
            cornerBorderWidth={this.props.cornerBorderWidth}
            cornerBorderLength={this.props.cornerBorderLength}
            isLoading={this.props.isLoading}
            cornerOffsetSize={this.props.cornerOffsetSize}
            isCornerOffset={this.props.isCornerOffset}
            bottomHeight={this.props.bottomHeight}
            scanBarAnimateTime={this.props.scanBarAnimateTime}
            scanBarColor={this.props.scanBarColor}
            scanBarHeight={this.props.scanBarHeight}
            scanBarMargin={this.props.scanBarMargin}
            hintText={this.props.hintText}
            hintTextStyle={this.props.hintTextStyle}
            scanBarImage={this.props.scanBarImage}
            hintTextPosition={this.props.hintTextPosition}
            isShowScanBar={this.props.isShowScanBar}/>
          <View style={[styles.bottomButtonsContainer, this.props.bottomViewStyle]}>
            {this.props.renderBottomView()}
          </View>
        </Camera>
      </View>
    );
  }
  // _setScanning(value) {
  //   this.setState({scanning: value});
  // }

  _handleBarCodeRead = (res) => {
    Vibration.vibrate();
    this.props.onRead(res)
    // if (!this.state.scanning) {
    //   Vibration.vibrate();
    //   this._setScanning(true);
    //   this.props.onRead(res)
    // }
  }
}

const styles = StyleSheet.create({
  topButtonsContainer: {
    position: 'absolute',
    height: 100,
    top: 0,
    left: 0,
    right: 0
  },
  bottomButtonsContainer: {
    position: 'absolute',
    height: 100,
    bottom: 0,
    left: 0,
    right: 0
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0
  },
  viewfinder: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  topLeftCorner: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  topRightCorner: {
    position: 'absolute',
    top: 0,
    right: 0
  },
  bottomLeftCorner: {
    position: 'absolute',
    bottom: 0,
    left: 0
  },
  bottomRightCorner: {
    position: 'absolute',
    bottom: 0,
    right: 0
  },
  topMask: {
    position: 'absolute',
    top: 0
  },
  leftMask: {
    position: 'absolute',
    left: 0
  },
  rightMask: {
    position: 'absolute',
    right: 0
  },
  bottomMask: {
    position: 'absolute',
    bottom: 0
  }
});

QRScannerView.propTypes = {
  onRead:PropTypes.func,
  maskColor: PropTypes.string,
  borderColor: PropTypes.string,
  cornerColor: PropTypes.string,
  borderWidth: PropTypes.number,
  cornerBorderWidth: PropTypes.number,
  cornerBorderLength: PropTypes.number,
  rectHeight: PropTypes.number,
  rectWidth: PropTypes.number,
  isLoading: PropTypes.bool,
  isCornerOffset: PropTypes.bool, //边角是否偏移
  cornerOffsetSize: PropTypes.number,
  bottomHeight: PropTypes.number,
  scanBarAnimateTime: PropTypes.number,
  scanBarColor: PropTypes.string,
  scanBarImage: PropTypes.any,
  scanBarHeight: PropTypes.number,
  scanBarMargin: PropTypes.number,
  hintText: PropTypes.string,
  hintTextStyle: PropTypes.object,
  hintTextPosition: PropTypes.number,
  renderTopView: PropTypes.func,
  renderBottomView: PropTypes.func,
  isShowScanBar: PropTypes.bool,
  topViewStyle: PropTypes.object,
  bottomViewStyle: PropTypes.object,
  torchMode: PropTypes.bool
}