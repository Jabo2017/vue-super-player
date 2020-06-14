<template>
	<div class="home">
		<img alt="Vue logo" src="../assets/logo.png" />

		<div  style="width: 300px; height: 300px;">
			<spuerPlayer ref="player" style="width: 400px; height: 400px;" />
		</div>

		<div style="width: 400px; height: 400px;">
			<spuerPlayer ref="player2" style="width: 300px; height: 200px;" />
		</div>

		<button @click="changeUrl">切换1</button>
		<button @click="changeUrl2">切换2</button>
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
	mounted() {
		this.$nextTick(() => {
			this.player();
		});
	},

	methods: {
		player() {
			this.$refs.player.loadPlayer('rtmp://rtmp.open.ys7.com/openlive/f01018a141094b7fa138b9d0b856507b');
			this.$refs.player2.loadPlayer('http://hls01open.ys7.com/openlive/b374fade33b84c34822e8d54cb80d34b.m3u8');
		},
		changeUrl() {
			this.$refs.player.loadPlayer('http://hls01open.ys7.com/openlive/b374fade33b84c34822e8d54cb80d34b.m3u8');
		},
		changeUrl2() {
			this.$refs.player.loadPlayer('rtmp://rtmp.open.ys7.com/openlive/f01018a141094b7fa138b9d0b856507b');
		}
	}
};
</script>
