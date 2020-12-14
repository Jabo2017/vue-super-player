<template>
  <div class="playe-wrap" ref="playerWrap" :id="playerId" :style="playStyle"></div>
</template>

<script>
export default {
  name: 'vue-super-player',
  props: {
    // 播放器样式：内联样式
    playStyle: {
      type: String,
      default: 'width:100%; height:100%'
    },
    // 版本 ckSdk
    cksdk: {
      type: String,
      default: 'https://fjycjd_admin.gitee.io/cdn/ckplayer/ckplayer.min.js'
    },
    // 版本 阿里云
    alisdk: {
      type: String,
      default: 'https://g.alicdn.com/de/prismplayer/2.8.8/aliplayer-min.js'
    },
    // 版本 腾讯
    tcsdk: {
      type: String,
      default: 'https://imgcache.qq.com/open/qcloud/video/vcplayer/TcPlayer-2.3.2.js'
    },
    bdsdk: {
      // 版本 sdk
      type: String,
      // default: 'https://fjycjd_admin.gitee.io/cdn/bplayer/cyberplayer.js'
      default:'https://bce.bdstatic.com/jwplayer/3.5.2/cyberplayer.js'
    },
    ak: {
      // 授权ak
      type: String,
      default: '69eeea78ae7e43d1ab4ad010565d9c9d'
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
    poster: {
      // 设置媒体流的预览图
      type: String,
      default: ''
    },
    variable: {
      // ck 专属
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
    preload: {
      // ali 专属
      // 播放器自动加载，目前仅h5可用。
      type: Boolean,
      default: true
    },
    // Safari浏览器可以启用Hls插件播放，Safari 11除外。
    useHlsPluginForSafari: {
      // ali 专属
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
  },
  data() {
    return {
      playerId:
        'superplayer_' +
        Math.random()
          .toString(36)
          .substr(2),
      instance: null, // h5 实例
      flashInstall: null, // flash 实例
      ckInstall: null, // ck 实例
      aliInstance: null, //ali 实例
      tcInstance: null, //tc 实例
      bdInstance: null, //bd 实例
      currentPlayerType: 'h5' // 当前播放器类型：h5、flash
    };
  },
  methods: {
    /**
     * @param {String} url
     * 加载播放器
     */
    loadPlayer(url) {
      let sourceUrl = url ? url : this.source;
      if (sourceUrl.match(/rtmp|.flv/)) {
        this.currentPlayerType = 'flash';
        if (this.flashplayer == 'ck') {
          if (window.ckplayer !== undefined) {
            this.initPlayer(sourceUrl);
          } else {
            this.$nextTick(() => {
              this.insertScriptTag(sourceUrl);
            });
          }
        } else if (this.flashplayer == 'ali') {
          if (window.Aliplayer !== undefined) {
            this.initPlayer(sourceUrl);
          } else {
            this.insertScriptTag(sourceUrl);
          }
        } else if (this.flashplayer == 'tc') {
          if (window.TcPlayer !== undefined) {
            this.initPlayer(sourceUrl);
          } else {
            this.insertScriptTag(sourceUrl);
          }
        } else if (this.flashplayer == 'bd') {
          if (window.cyberplayer !== undefined) {
            this.initPlayer(sourceUrl);
          } else {
            this.insertScriptTag(sourceUrl);
          }
        }
      } else {
        this.currentPlayerType = 'h5';
        if (this.h5player == 'ck') {
          if (window.ckplayer !== undefined) {
            this.initPlayer(sourceUrl);
          } else {
            this.$nextTick(() => {
              this.insertScriptTag(sourceUrl);
            });
          }
        } else if (this.h5player == 'ali') {
          if (window.Aliplayer !== undefined) {
            this.initPlayer(sourceUrl);
          } else {
            this.insertScriptTag(sourceUrl);
          }
        } else if (this.h5player == 'tc') {
          if (window.TcPlayer !== undefined) {
            this.initPlayer(sourceUrl);
          } else {
            this.insertScriptTag(sourceUrl);
          }
        } else if (this.h5player == 'bd') {
          if (window.cyberplayer !== undefined) {
            this.initPlayer(sourceUrl);
          } else {
            this.insertScriptTag(sourceUrl);
          }
        }
      }
    },
    /**
     * @param {String} url
     * 插入脚本
     */
    insertScriptTag(url) {
      let sdk = '',
        playerName = '';
      if (this.currentPlayerType == 'flash') {
        if (this.flashplayer == 'ali') {
          sdk = this.alisdk;
          playerName = 'ali';
        } else if (this.flashplayer == 'ck') {
          sdk = this.cksdk;
          playerName = 'ck';
        } else if (this.flashplayer == 'tc') {
          sdk = this.tcsdk;
          playerName = 'tc';
        } else if (this.flashplayer == 'bd') {
          sdk = this.bdsdk;
          playerName = 'bd';
        }
      } else {
        if (this.h5player == 'ali') {
          sdk = this.alisdk;
          playerName = 'ali';
        } else if (this.h5player == 'ck') {
          sdk = this.cksdk;
          playerName = 'ck';
        } else if (this.h5player == 'tc') {
          sdk = this.tcsdk;
          playerName = 'tc';
        } else if (this.h5player == 'bd') {
          sdk = this.bdsdk;
          playerName = 'bd';
        }
      }

      let playerScriptTag = document.getElementById(playerName + 'playerScriptTag');
      // 如果这个tag不存在，则生成相关代码tag以加载代码
      if (playerScriptTag === null) {
        playerScriptTag = document.createElement('script');
        playerScriptTag.type = 'text/javascript';
        playerScriptTag.src = sdk;
        playerScriptTag.id = playerName + 'playerScriptTag';
        let s = document.getElementsByTagName('body')[0];
        s.appendChild(playerScriptTag);
      }
      if (playerScriptTag.loaded) {
        this.$nextTick(() => {
          this.initPlayer(url);
        });
      } else {
        let loadReponse = () => {
          playerScriptTag.loaded = true;
          this.$nextTick(() => {
            this.initPlayer(url);
          });

          if (playerScriptTag.loaded) {
            playerScriptTag.removeEventListener('load', loadReponse);
            playerScriptTag.loaded = false;
          }
        };
        playerScriptTag.addEventListener('load', loadReponse);
      }
    },
    /**
     * @param {String} url
     * 初始化播放器
     */
    initPlayer(url) {
      if (this.currentPlayerType == 'flash') {
        if (this.flashplayer == 'ck') {
          this.initCkPlayer(url);
        } else if (this.flashplayer == 'ali') {
          this.initAliPlayer(url);
        } else if (this.flashplayer == 'tc') {
          this.initTcPlayer(url);
        } else if (this.flashplayer == 'bd') {
          this.initBdPlayer(url);
        }
      } else {
        if (this.h5player == 'ck') {
          this.initCkPlayer(url);
        } else if (this.h5player == 'ali') {
          this.initAliPlayer(url);
        } else if (this.h5player == 'tc') {
          this.initTcPlayer(url);
        } else if (this.h5player == 'bd') {
          this.initBdPlayer(url);
        }
      }
    },
    /**
     * @param {String} url
     * ck 播放器: 切换也是一样
     */
    initCkPlayer(url) {
      let videoObject = {
        playerID: this.playerId,
        container: '#' + this.playerId,
        variable: this.variable,
        autoplay: this.autoplay,
        flash: this.flash,
        video: url,
        live: this.live,
        loop: this.loop,
        poster: this.poster
      };
      /* eslint-disable */
      this.ckInstall = new ckplayer(videoObject);
      this.$nextTick(() => {
        let boxEle = document.getElementById(this.playerId),
          videoEle = '';
        if (boxEle) {
          videoEle = boxEle.querySelector('video');
          if (videoEle) {
            videoEle.setAttribute('playsinline', true);
            videoEle.setAttribute('x5-playsinline', true);
            videoEle.setAttribute('webkit-playsinline', true);
            videoEle.setAttribute('x5-video-player-type', true);
          }
        }
      });
    },
    /**
     * @param {String} url
     * ali 播放器: 目前只支持同种格式（mp4/flv/m3u8）之间切换。暂不支持直播rtmp流切换。
     */
    initAliPlayer(url) {
      if (!this.aliInstance) {
        this.aliInstance = window.Aliplayer({
          id: this.playerId,
          autoplay: this.autoplay,
          width: '100%',
          height: '100%',
          isLive: this.live,
          rePlay: this.loop,
          preload: this.preload,
          playsinline: this.playsinline,
          source: url,
          cover: this.poster,
          useHlsPluginForSafari: this.useHlsPluginForSafari
        });
      } else {
        this.aliInstance.loadByUrl(url);
      }
    },
    /**
     * @param {String} url
     * tc 播放器
     */
    initTcPlayer(url) {
      if (!this.tcInstance) {
        this.tcInstance = new TcPlayer(this.playerId, {
          mp4: url,
          rtmp: url,
          m3u8: url, //请替换成实际可用的播放地址
          live: this.live,
          flash: this.flash,
          autoplay: this.autoplay, //iOS 下 safari 浏览器是不开放这个能力的
          poster: this.poster,
          wording: this.wording,
          x5_player: this.x5player
        });
      } else {
        this.tcInstance.load(url);
      }
    },
    /**
     * @param {String} url
     * bd 播放器: 切换也是一样
     */
    initBdPlayer(url) {
      this.bdInstance = cyberplayer(this.playerId).setup({
        ak: this.ak,
        file: url,
        width: '100%',
        height: '100%',
        stretching: this.stretching,
        autoStart: this.autoplay,
        image: this.poster,
        repeat: this.loop
      });
    },
    /**
     *直接播放视频url，time为可选值（单位秒）目前只支持同种格式（mp4/flv/m3u8）之间切换暂不支持直播rtmp流切换
     *@argument url 视频地址
     */
    loadByUrl: function(url) {
      this.loadPlayer(url);
    },
    /**
     * 播放
     */
    play() {
      if (this.bdInstance) {
        this.bdInstance.play();
      }
      if (this.aliInstance) {
        this.aliInstance.play();
      }
      if (this.tcInstance) {
        this.tcInstance.play();
      }
      if (this.ckInstall) {
        this.ckInstall.videoPlay();
      }
    },
    /**
     * 暂停
     */
    pause() {
      if (this.bdInstance) {
        this.bdInstance.pause();
      }
      if (this.aliInstance) {
        this.aliInstance.pause();
      }
      if (this.tcInstance) {
        this.tcInstance.pause();
      }
      if (this.ckInstall) {
        this.ckInstall.videoPause();
      }
    },
    /**
     * @param {Boolean} flag
     * 设置当前播放器的声音开关。
     * Boolean - true : 关闭声音；false : 打开声音
     */
    setMute(flag) {
      if (this.bdInstance) {
        this.bdInstance.setMute(flag);
      }
      if (this.aliInstance) {
        if (flag) {
          this.aliInstance.setVolume(0);
        } else {
          this.aliInstance.setVolume(1);
        }
      }
      if (this.tcInstance) {
        this.tcInstance.mute(flag);
      }
      if (this.ckInstall) {
        if (flag) {
          this.ckInstall.videoMute();
        } else {
          this.ckInstall.videoEscMute();
        }
      }
    },
    /**
     * @param {Boolean} flag
     * 设置当前播放器是否全屏。
     * Boolean - true : 全屏；false : 非全屏
     */
    setFullscreen(flag) {
      if (this.bdInstance) {
        this.bdInstance.setFullscreen(flag);
      }
      if (this.aliInstance) {
        // 仅H5
        if (flag) {
          this.aliInstance.fullscreenService.requestFullScreen();
        } else {
          this.aliInstance.fullscreenService.cancelFullScreen();
        }
      }
      if (this.tcInstance) {
        this.tcInstance.fullscreen(flag);
      }
      if (this.ckInstall) {
        // ck 支不支持开启全屏，只有退出全屏
        if (!flag) {
          this.ckInstall.quitFullScreen();
        }
      }
    },
    /**
     * 获取播放器状态
     */
    getStatus() {
      if (this.bdInstance) {
        // {“playing”、“paused”、“idle”、“buffering”}
        return this.bdInstance.getState();
      }
      if (this.aliInstance) {
        return this.aliInstance.getStatus();
      }
      if (this.tcInstance) {
        // 返回 true,false
        return this.tcInstance.playing();
      }
      if (this.ckInstall) {
        return this.ckInstall.getMetaDate();
      }
    },
    /**
     * 获取播放时长【获取视频总时长】
     */
    getDuration(){
      if (this.bdInstance) {
        return this.bdInstance.getDuration();
      }
      if (this.aliInstance) {
        return this.aliInstance.getDuration();
      }
      if (this.tcInstance) {
        return this.tcInstance.getDuration();
      }
      if (this.ckInstall) {
        return this.ckInstall.getMetaDate();
      }
    },
    /**
     * 获取全屏状态
     */
    getFullscreen(){
      if (this.bdInstance) {
        return this.bdInstance.getFullscreen();
      }
      if (this.aliInstance) {
        return this.aliInstance.fullscreenService.getIsFullScreen();
      }
      if (this.tcInstance) {
        // 暂不支持
      }
      if (this.ckInstall) {
        // 暂不支持
      }
    },
    /**
     * 设置目标播放时间
     */
    setSeek(time){
      if (this.bdInstance) {
        this.bdInstance.seek(time);
      }
      if (this.aliInstance) {
        this.aliInstance.seek(time);
      }
      if (this.tcInstance) {
        // 暂不支持
        // this.tcInstance.seeked(time);
      }
      if (this.ckInstall) {
       this.ckInstall.videoSeek(time);
      }
    }
  },
  beforeDestroy() {
    // 移除当前播放器
    if (this.bdInstance) {
      this.bdInstance.remove();
      this.bdInstance = null;
    }
    if (this.aliInstance) {
      this.aliInstance.dispose();
      this.aliInstance = null;
    }
    if (this.tcInstance) {
      this.tcInstance.destroy();
      this.tcInstance = null;
    }
    this.ckInstall = null;
  }
};
</script>

<style lang="postcss">
@import 'https://g.alicdn.com/de/prismplayer/2.8.8/skins/default/aliplayer-min.css';
.prism-big-play-btn {
  left: 50% !important;
  bottom: 50% !important;
  transform: translate(-32px, 32px);
}

.vcp-bigplay {
  display: none;
}

.jw-rightclick,
.jw-warning {
  display: none !important;
}
</style>
