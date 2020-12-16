<template>
  <div class="wrap">
    <div :class="['row', [showFlag ? 'show' :'']]" v-show="showFlag">1
      <div class="live" v-for="(item, index) in currentUrlArr" :key="index"><spuerPlayer :source="item" h5player="ali" ref="player" /></div>
    </div>
    <div :class="['row', [!showFlag ? 'show' :'']]" v-show="!showFlag">2
      <div class="live" v-for="(item, index) in nextUrlArr" :key="index"><spuerPlayer :source="item" ref="player2" /></div>
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
        'http://hls01open.ys7.com/openlive/d9d59cc417ad4d3c8757b4960ae0fb8e.m3u8',
        'http://hls01open.ys7.com/openlive/d7fcdc7971974c529caefffe58179d3a.m3u8',
        'http://hls01open.ys7.com/openlive/71f04eb9a373430a9c6a1dbd6b4c5e53.m3u8',
        'http://hls01open.ys7.com/openlive/b169893dbd8d482e9b674cedcae36854.m3u8',
        'http://hls01open.ys7.com/openlive/fe2cd600533e44c88dd1ff3175699305.m3u8',
        'http://hls01open.ys7.com/openlive/560ead4dd094428b949b112906fd8575.m3u8',
        'http://hls01open.ys7.com/openlive/b374fade33b84c34822e8d54cb80d34b.m3u8',
        'http://hls01open.ys7.com/openlive/847a2635381e4fc4b17a0f005711fd7f.m3u8',
        'http://hls01open.ys7.com/openlive/847a2635381e4fc4b17a0f005711fd7f.m3u8',
        'http://hls01open.ys7.com/openlive/b374fade33b84c34822e8d54cb80d34b.m3u8'
      ],
      currentUrlArr: [],
      nextUrlArr: [],
      showFlag: true
    };
  },
  created() {
    this.getPlayUrl();
  },
  mounted() {},

  methods: {
    getPlayUrl() {
      if (this.urlArr.length <= 4) {
        this.currentUrlArr = this.urlArr;
      } else {
        if (this.showFlag) {
          if (this.currentUrlArr.length == 0) {
            this.currentUrlArr = this.urlArr.splice(0, 4);
            this.$nextTick(() => {
              this.urlArr = this.urlArr.concat(this.currentUrlArr);
              this.nextUrlArr = this.urlArr.splice(0, 4);
              this.$nextTick(() => {
                this.urlArr = this.urlArr.concat(this.nextUrlArr);
              });
              
              this.$nextTick(() => {
                this.$refs.player.map(item => {
                  item.loadPlayer();
                });
                this.$refs.player2.map(item => {
                  item.loadPlayer();
                });
                this.player();
              });
            });
          } else {
            // 展示备用第一个展示，第二个更新
            this.nextUrlArr = this.urlArr.splice(0, 4);
            this.$nextTick(() => {
              this.urlArr = this.urlArr.concat(this.nextUrlArr);
            });
            this.$nextTick(() => {
              this.$refs.player2.map(item => {
                item.loadPlayer();
              });
              this.player();
            });
          }
        } else {
          // // 展示备用第二个展示，第一个更新
          this.currentUrlArr = this.urlArr.splice(0, 4);
          this.urlArr = this.urlArr.concat(this.currentUrlArr);
          this.$nextTick(() => {
            this.$refs.player.map(item => {
              item.loadPlayer();
            });
            this.player();
          });
        }
      }
      
    },
    player() {
      setTimeout(() => {
        this.showFlag = !this.showFlag;
        this.getPlayUrl();
      }, 10000);
      // this.$refs.player.loadPlayer('http://hls01open.ys7.com/openlive/b374fade33b84c34822e8d54cb80d34b.m3u8');
    }
  }
};
</script>

<style scoped="scoped">
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
