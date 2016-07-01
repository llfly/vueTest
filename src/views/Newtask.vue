<template>
	<div id="newtask">
		<div class="taskName">新建任务</div>
		<div class="newtask-form">
			<div class="form-group">
				<label for="newTaskName">任务名称</label>
				<input id="newTaskName" type="text" name="newTaskName" v-model="newTaskName"/>
			</div>
			<div class="form-group">
				<label>任务类型</label>
				<input type="radio" id="one" value="createeva" v-model="picked">
				<label for="one">普通评测</label>
				<input type="radio" id="two" value="creatematch" v-model="picked">
				<label for="one">匹配校验</label>
			</div>
			<div class="form-group">
				<label for="newTaskFile">文件导入</label>
				<input id="newTaskFile" type="file"></input>
			</div>
			<div class="form-group">
				<button type="reset">取消</button>
				<button type="button" value="确定" @click="submitMethod()">确定</button>
			</div>
		</div>
	</div>
</template>
<script>
import API_ROOT from '../store/resources.js';

	export default{
		data(){
			return{
				newTaskName:'',
				picked:'createeva',
			}
		},
		methods:{
			submitMethod(){

				var formData = new FormData();
				formData.append('file',this.$el.querySelector('#newTaskFile').files[0]);
				console.log(this.$el.querySelector('#newTaskFile').files[0]);
				var urlArr = [API_ROOT+this.picked];
				urlArr.push('taskname=' + this.newTaskName);
				if(sessionStorage.user){
					urlArr.push('user=' + sessionStorage.user);
					var url = urlArr.join('&');
					this.$http.post(url,formData,{
						headers:{
							"Content-Type":"multipart/form-data"
						}
					}).then((response)=>{
						console.log(response);
						alert('上传成功');
					},(response)=>{
						alert('上传失败');
					});
				}else{
					 this.$route.router.go({name:'login',params:{type:'newTask'}});
				}



				//this.$http.post(url,)
			}
		}
	}
</script>
<style>
	#newtask{
		width:450px;
		height: 250px;
		border:1px solid #ccc;
		margin: 100px;
	}
	.taskName{
		height: 30px;
		background-color: #eee;
		font-weight: 600;
		line-height: 30px;
		border-bottom: 1px solid #ccc;
	}
	.newtask-form{
	}
	.form-group{
		margin-top:20px;
		margin-left:20px;
	}
	.form-group label{
		margin-right: 20px;
	}
</style>