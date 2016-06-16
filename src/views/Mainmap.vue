<template>
	<Planbox></Planbox>
	<Assess v-show="assessShow"></Assess>
</template>
<script>
import Planbox from '../components/Planbox.vue';
import Assess from '../components/Assess.vue';
	export default{
		data(){
			return{
				assessShow:false
			}
		},
		components:{
			Planbox,
			Assess
		}
	}
</script>
<style>
	
</style>