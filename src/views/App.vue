<template>
  <div id="app">
    <Headerv></Headerv>
    <Leftctrl></Leftctrl>
    <div id="main">
    	<router-view v-ref:list keep-alive></router-view>
    </div>
  </div>
</template>

<script>
import Headerv from '../components/Header';
import Leftctrl from './LeftCtrl';

export default {
  components: {
    Headerv,
    Leftctrl
  }
}
</script>

<style>
html,body{
  margin:0;
  padding: 0;
  width: 100%;
  height: 100%;
}
#app {
  font-family: Source Sans Pro, Helvetica, sans-serif;
  border:1xp solid blue;
  height:100%;
}
#main{
	margin-left:210px;
	padding:20px 0 0 20px;
  height: 85%;
}

</style>
