<template>
	<div class="bestPlanBox">
		<div class="title">确定要设为最佳方案么？</div>
		<div class="form-group">
			<span>理由：</span>
			<textarea v-model="assessText"></textarea>
		</div>
		<div class="form-group">
			<button @click="setBest(false)">取消</button>
			<button @click="setBest(true)">确定</button>
		</div>
	</div>
</template>
<script>
	export default{
		data(){
			return{
				assessText:'',
			}
		},
		methods:{
			setBest(bool){

			}
		}
	}
</script>
<style>
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