<template>
<div class="planBox">
	<div class="bestPlanBox">
		<div class="title" v-text="isBestPlan?'确定要取消最佳方案吗?':'确定要设为最佳方案么？'"></div>
		<div class="form-group">
			<span>理由：</span>
			<textarea v-model="assessText"></textarea>
		</div>
		<div class="form-group">
			<button @click="setBest(false)">取消</button>
			<button @click="setBest(true)">确定</button>
		</div>
	</div>
</div>
</template>
<script>
	export default{
		props:['isBestPlan'],
		data(){
			return{
				assessText:'',
			}
		},
		methods:{
			setBest(bool){
				this.$dispatch('bestPlanBox',bool,this.assessText);
			}
		}
	}
</script>
<style>
	.planBox{
		position: absolute;
		top:0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0,0,0,0.5);
		z-index: 99999;
	}
	.bestPlanBox{
		border:1px solid red;
		background-color: #fff;
		width:350px;
		height: 200px;
		position: absolute;
		top:0;
		bottom:0;
		left:0;
		right:0;
		margin: auto;
		z-index: 2;
	}
	.bestPlanBox .title{
		margin-top: 30px;
		text-align: center;
	}
	.bestPlanBox .form-group textarea{
		width:250px;
		resize: none;
	}
	.bestPlanBox .form-group button{
		margin-left: 70px;
	}
</style>