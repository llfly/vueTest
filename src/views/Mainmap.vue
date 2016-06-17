<template>
	<div class="leftMainBox">
		<Planinfo></Planinfo>
		<div class="plans">
			<Planbox></Planbox>
		</div>
	</div>
	<div class="mapMainBox">
	</div>
	<Assess v-show="assessShow"></Assess>
	<Bestplan v-show="BestplanShow"></Bestplan>
</template>
<script>
import Planinfo from '../components/Planinfo.vue';
import Planbox from '../components/Planbox.vue';
import Assess from '../components/Assess.vue';
import Bestplan from '../components/Bestplan.vue';
	export default{
		data(){
			return{
				assessShow:false,
				BestplanShow:false,
			}
		},
		components:{
			Planbox,
			Assess,
			Bestplan,
			Planinfo
		}
	}
</script>
<style>
	
</style>