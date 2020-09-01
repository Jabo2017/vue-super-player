# vue-super-player

#### 介绍
超级播放器:基于多个内核播放器整合开发


#### 安装教程

```
npm i vue-super-player -save
```

#### 使用说明
```
import player from 'vue-super-player'
import 'vue-super-player/lib/vue-super-player.css'
```

#### 参数
```
	// 播放器样式：内联样式
	playStyle: {
		type: String,
		default: 'width:100%; height:100%'
	},
	// 视频源
	source: {
		type: String,
		default: ''
	},
	// 是否是直播视频
	live: {
		type: Boolean,
		default: true
	},
	// 播放结束后是否循环播放
	loop: {
		type: Boolean,
		default: false
	},
	autoplay: {
		// 建议 false : 一些浏览器这样会报错
		// 播放器是否自动播放
		type: Boolean,
		default: true
	},
	// 设置媒体流的预览图
	poster: {
		type: String,
		default: ''
	},
	variable: {  // ck 专属
		//调用播放器的函数名称
		type: String,
		default: 'player'
	},
	flash: {
		// 是否强制使用flashplayer播放
		type: Boolean,
		default: false
	},
	// 指定h5 播发器：【ali、ck、tc、bd】
	h5player: {
		type: String,
		default: 'bd'
	},
	// flash 播放器：默认 ck
	flashplayer: {
		type: String,
		default: 'bd'
	},
	playsinline: {
		// H5是否内置播放，有的Android浏览器不起作用。
		type: Boolean,
		default: true
	},
	preload: { // ali 专属
		// 播放器自动加载，目前仅h5可用。
		type: Boolean,
		default: true
	},
	// Safari浏览器可以启用Hls插件播放，Safari 11除外。
	useHlsPluginForSafari: {  // ali 专属
		type: Boolean,
		default: true
	},
	wording: {
		// tc 专属
		type: Object,
		default: () => {
			return {
				4: '当前直播流需要flash支持,请开启flash'
			};
		}
	},
	x5player: {
		type: Boolean,
		default: false
	},
	stretching: {
		// bd 专属
		// 设置播放器缩放方式，缩放方式分为：
		// 1.none:不缩放；
		// 2.uniform:添加黑边缩放；
		// 3. exactfit:改变宽高比缩到最大；
		// 4.fill:剪切并缩放到最大（默认方式为uniform）
		type: String,
		default: 'exactfit'
	}

```


#### 方法
```
  1、loadPlayer(url)  // 加载播放器
  2、play()  // 播放API，ck直播模式不支持 【1.0.1+】
  3、pause()  // 暂停API，ck直播模式不支持 【1.0.1+】
  4、setMute()  // 静音API，true : 关闭声音；false : 打开声音，ck直播模式不支持 【1.0.1+】
  5、setFullscreen()  // 全屏API，true : 全屏；false : 非全屏 ，ck直播模式不支持 【1.0.1+】
  6、getStatus() // 返回播放器状态，不同播放器返回参数存在差异 【1.0.2+】
  7、getDuration() // 返回播放时长,对点播有用，不同播放器返回参数存在差异  【1.0.2+】
  8、setSeek(time) // 设置目标播放时间，对点播有用【1.0.2+】
```

#### 版本说明
```
1、1.0.0： 初始化版本
2、1.0.1   新增API：play、pause、setMute、setFullscreen，优化播放器资源回收
3、1.0.2   新增API：getStatus、getDuration、setSeek
4、1.0.3   修复bug
```

### 参考
1.  [阿里云播放器配置](https://helpcdn.aliyun.com/document_detail/125572.html?spm=a2c4g.11186623.4.1.27961c4cl6VC7x)
2.  [ckplayer](http://www.ckplayer.com/manualX/23.html)
3.  [百度播放器](https://cloud.baidu.com/doc/MCT/s/yjwvz4xm8)
4.  [腾讯播放器](https://cloud.tencent.com/document/product/881/20207)
