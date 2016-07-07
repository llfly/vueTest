<template>
	<div class="login-form">
		<div class="title">登录</div>
		<input type="text" class="input-block" placeholder="用户名" v-model="username">
		<input type="password" class="input-block" placeholder="密码" v-model="password">
		<button type="button" class="btn-login" @click="loginMethod()">登陆</button>
	</div>
</template>
<script>
import API_ROOT from '../store/resources.js';

	export default{
		name:'login',

		data(){
			return{
				username:'',
				password:''
			}
		},
		methods:{
			loginMethod(){
				var self = this;
				var urlArr = [API_ROOT+'login'];
				if(this.username && this.password){
					urlArr.push('user='+this.username);
					urlArr.push('pwd='+this.password);
					var url = urlArr.join('&');
					console.log(url);
					//console.log(self.$route.params.type);
					this.$http.get(url, function(data) {
						if(data.status == 'success'){
							sessionStorage.user = this.username;
							//console.log(self.$route.params.type);

							var type = self.$route.params.type;
							var type2 = self.$route.params.type2;
							var id = self.$route.params.id;
							var taskid = self.$route.params.taskid;
							console.log(type,type2,id,taskid);
							if(type!=':type'&&type2!='type2'&&id!=':id'&&taskid!=':taskid'){
								self.$route.router.go({name:type,params:{type:type2,id:id,taskid:taskid}});
							}else if(type!=':type'&&type2!='type2'&&id!=':id'){
								self.$route.router.go({name:type,params:{type:type2,id:id}});
							}else if(type!=':type'&&id!=':id'){
								self.$route.router.go({name:type,params:{id:id}});
							}else if(type!=":type"){
								self.$route.router.go({name:type});
							}else{
								self.$route.router.go({name:'taskList'})
							}
						}else{
							alert('账号或用户名错误');
						}
					},function(){

					}).catch(function(data, status, request) {
						alert('请求发送失败');
					});
				}
			}
		}
	}
</script>
<style>
	.login-form{
		width: 300px;
		height: 300px;
		margin: 200px auto;
	}
	.login-form .title{
		text-align: center;
	}
	.input-block{
		display: block;
		width: 90%;
		height: 34px;
		padding: 6px 5%;
		margin-bottom: 15px;
		font-size: 14px;
		line-height: 1.42857143;
		background-color: #fff;
		background-image: none;
		border: 1px solid #ccc;
		border-radius: 3px;
		-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
		box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
	}
	.btn-login{
		display: inline-block;
		margin-bottom: 0;
		width: 25%;
		float: right;
		font-weight: 400;
		text-align: center;
		vertical-align: middle;
		cursor: pointer;
		background: rgb(42,162,230);
		color:#fff;
		border: 1px solid transparent;
		white-space: nowrap;
		padding: 6px 12px;
		font-size: 14px;
		line-height: 1.42857143;
		border-radius: 3px;
	}
</style>
