<template>
	<div class="home">
		<img alt="Vue logo" src="../assets/logo.png" />

		<div  style="width: 600px; height: 300px; margin-bottom: 30px;">
			<spuerPlayer ref="player" style="width: 600px; height: 300px;" />
		</div>

		<!-- <div style="width: 400px; height: 400px;" v-if="flag">
			<spuerPlayer ref="player2" style="width: 300px; height: 200px;" />
		</div>
 -->
		<button @click="changeUrl">切换1</button>
		<button @click="changeUrl2">切换2</button>
		<button @click="triggePlayer">隐藏2</button>
		<button @click="playPlayer">播放2</button>
		<button @click="pausePlayer">暂停2</button>
		<button @click="fullPlayer">全屏2</button>
		<button @click="setMute">静音2</button>
    <button @click="getDuration">播放时长</button>
    <button @click="getStatus">播放状态</button>
	</div>
</template>

<script>
/* eslint-disable */
// import spuerPlayer from './../../lib/vue-super-player.umd.min.js';
// import './../../lib/vue-aliplay-player.css';

import spuerPlayer from './../../packages/vue-super-player/src/player.vue';

export default {
	name: 'Home',
	components: {
		spuerPlayer: spuerPlayer
	},
	data(){
		return {
			flag: true
		}
	},
	mounted() {
		this.$nextTick(() => {
			this.player();
		});
	},

	methods: {
		player() {
      // this.$refs.player.loadPlayer('http://hls01open.ys7.com/openlive/847a2635381e4fc4b17a0f005711fd7f.m3u8');
      // this.$refs.player.loadPlayer('https://bd41f9e82b5749738bacd020487d5292.apigw.cn-east-3.huaweicloud.com/live/work003?app=vis&stream=channel_76323456271320000088');
      this.$refs.player.loadPlayer('http://localhost:8081/cyberplayer-demo.flv');
			// this.$refs.player.loadPlayer('rtmp://rtmp.open.ys7.com/openlive/f01018a141094b7fa138b9d0b856507b');
			// this.$refs.player2.loadPlayer('http://hls01open.ys7.com/openlive/847a2635381e4fc4b17a0f005711fd7f.m3u8');
		},
		changeUrl() {
			this.$refs.player.loadPlayer('http://hls01open.ys7.com/openlive/847a2635381e4fc4b17a0f005711fd7f.m3u8');
		},
		changeUrl2() {
			// this.$refs.player.loadPlayer('rtmp://rtmp.open.ys7.com/openlive/f01018a141094b7fa138b9d0b856507b');
			this.$refs.player.loadPlayer('http://localhost:8081/cyberplayer-demo.flv');
		},
		triggePlayer(){
			this.flag = !this.flag
			this.$nextTick(()=>{
				if(this.flag){
					this.$refs.player2.loadPlayer('http://hls01open.ys7.com/openlive/b374fade33b84c34822e8d54cb80d34b.m3u8');
				}
			})
		},
		playPlayer(){
			this.$refs.player2.play();
		},
		pausePlayer(){
			this.$refs.player2.pause();
		},
		fullPlayer(){
			this.$refs.player2.setFullscreen(true);
		},
		setMute(){
			this.$refs.player2.setMute(true);
		},
    getDuration(){
      console.log(this.$refs.player2.getDuration())
    },
    getStatus(){
      console.log(this.$refs.player2.getStatus())
    }
	}
};
</script>
