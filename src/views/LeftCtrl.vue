<template>
	<div class="leftCtrl clearfix">
		<ul class="leftList">
			<li v-link="'/taskList'">任务列表</li>
			<li v-link="'/sampleList'">样本库列表</li>
			<li v-link="'/newTask'">新建任务</li>
		</ul>
	</div>
</template>
<script>
	export default {
		data(){
			return{}
		}
	}
</script>
<style>
	.leftCtrl{
		width:200px;
		height: 400px;
		overflow: hidden;
		float: left;
	}
	.clearfix:after{  /*最简方式*/
		content: '';
		display: block;
		clear: both;
    }
	.leftList{
		list-style: none;
		line-height: 45px;
		margin:0;
		margin-top:20px;
		margin-left:20px;
		margin-bottom: -1px;
		padding: 0;
		border: 1px solid #ccc;
		border-radius: 5px;
		text-align: center;
	}
	.leftList li{
		border-bottom: 1px solid #ccc;
		cursor: pointer;
		color:rgb(42,162,230);
	}
	.leftList li:hover{
		background-color: #ccc;
	}
</style>