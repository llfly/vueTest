<template>
	<div class="deleteConfirm">
		<div class="title">删除提示</div>
		<div class="describe">确定要删除么？删除后将无法恢复</div>
		<button @click="dele(false)">取消</button>
		<button @click="dele(true)">确定</button>
	</div>
</template>
<script>
module.exports = {
		data(){
			return {
				del:false
			}
		},
		methods:{
			dele(bool) {
				//console.log(bool,this);
				this.del = bool;
			}
		}
	}
</script>
<style scope>
	.deleteConfirm{
		border:1px solid red;
		width:300px;
		height: 200px;
		position: absolute;
		top:0;bottom:0;left:0;right:0;
		margin: auto;
		z-index: 1;
		text-align: center;
	}
	.title{
		font-weight: 600;
		font-size:20px;
		margin: 10px 0 20px;
	}
	.describe{
		font-size:16px;
		margin-bottom: 40px;
	}
	.deleteConfirm button{
		margin:20px;
	}
</style>