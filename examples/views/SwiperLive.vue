<template>
  <div class="wrap">
    <div class="row" v-show="showFlag">
      <div class="live" v-for="(item, index) in currentUrlArr" :key="index"><spuerPlayer :source="item" h5player="ali" ref="player" /></div>
    </div>
    <div class="row" v-show="!showFlag">
      <div class="live" v-for="(item, index) in nextUrlArr" :key="index"><spuerPlayer :source="item" h5player="ali" ref="player2" /></div>
    </div>
  </div>
</template>

<script>
import spuerPlayer from './../../packages/vue-super-player/src/player.vue';

export default {
  name: 'swiperLive',
  components: {
    spuerPlayer: spuerPlayer
  },
  data() {
    return {
      urlArr: [
        'http://hls01open.ys7.com/openlive/b374fade33b84c34822e8d54cb80d34b.m3u8',
        'http://hls01open.ys7.com/openlive/b374fade33b84c34822e8d54cb80d34b.m3u8',
        'http://hls01open.ys7.com/openlive/b374fade33b84c34822e8d54cb80d34b.m3u8',
        'http://hls01open.ys7.com/openlive/b374fade33b84c34822e8d54cb80d34b.m3u8',
        'http://hls01open.ys7.com/openlive/847a2635381e4fc4b17a0f005711fd7f.m3u8',
        'http://hls01open.ys7.com/openlive/847a2635381e4fc4b17a0f005711fd7f.m3u8',
        'http://hls01open.ys7.com/openlive/b374fade33b84c34822e8d54cb80d34b.m3u8',
        'http://hls01open.ys7.com/openlive/b374fade33b84c34822e8d54cb80d34b.m3u8',
        'http://hls01open.ys7.com/openlive/b374fade33b84c34822e8d54cb80d34b.m3u8',
        'http://hls01open.ys7.com/openlive/847a2635381e4fc4b17a0f005711fd7f.m3u8',
        'http://hls01open.ys7.com/openlive/847a2635381e4fc4b17a0f005711fd7f.m3u8',
        'http://hls01open.ys7.com/openlive/b374fade33b84c34822e8d54cb80d34b.m3u8'
      ],
      currentUrlArr: [],
      nextUrlArr: [],
      showFlag: true,
      i: 0
    };
  },
  created() {
    this.getPlayUrl();
  },
  mounted() {},

  methods: {
    getPlayUrl() {
      if(this.urlArr.length <= 4) {
        this.currentUrlArr = this.urlArr;
      } else if( (this.i + 1) * 8 <= this.urlArr.length){
        this.currentUrlArr = this.urlArr.slice(this.i * 8, this.i * 8 + 4);
        this.nextUrlArr = this.urlArr.slice(this.i * 8 + 4, this.i * 8 + 8);
        this.i++;
      } else if(this.i * 8 + 4 <= this.urlArr.length) {
        this.currentUrlArr = this.urlArr.slice(this.i * 8, this.i * 8 + 4);
        if(){
          
        }
      }
      
      this.$nextTick(() => {
        this.player();
      });
    },
    player() {
      this.$refs.player.map(item => {
        item.loadPlayer();
      });
      this.$refs.player2.map(item => {
        item.loadPlayer();
      });
      // this.$refs.player.loadPlayer('http://hls01open.ys7.com/openlive/b374fade33b84c34822e8d54cb80d34b.m3u8');
    }
  }
};
</script>

<style scoped="scoped" lang="scss">
.wrap {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
}

.live {
  position: relative;
  width: 25%;
  height: 300px;
  margin-bottom: 20px;
}
</style>
