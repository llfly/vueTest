<template>
<div class="planBox">
	<div class="assessBox">
		<div class="title">请进行评价</div>
		<div class="form-group">
			<span>评价：</span>
			<input type="radio" id="rea" value="合理" v-model="read">
			<label for="one">合理</label>
			<input type="radio" id="unrea" value="不合理" v-model="read">
			<label for="two">不合理</label>
		</div>
		<div class="form-group" v-if="read=='合理'">
			<span>标签：</span>
			<input type="radio" id="rea0" value="未定" v-model="sead">
			<label for="rea0">未定</label>
			<input type="radio" id="rea1" value="最佳" v-model="sead">
			<label for="rea1">最佳</label>
			<input type="radio" id="rea2" value="非最佳" v-model="sead">
			<label for="rea2">非最佳</label>
		</div>
		<div class="form-group" v-else>
			<span>标签：</span>
			<input type="radio" id="unrea0" value="绕路" v-model="unsead">
			<label for="unrea0">绕路</label>
			<input type="radio" id="unrea1" value="畸形" v-model="unsead">
			<label for="unrea1">畸形</label>
			<input type="radio" id="unrea2" value="不避堵" v-model="unsead">
			<label for="unrea2">不避堵</label>
			<br/>
			<input class="secondinput" type="radio" id="unrea3" value="小路多" v-model="unsead">
			<label for="unrea3">小路多</label>
			<input type="radio" id="unrea4" value="其他" v-model="unsead">
			<label for="unrea4">其他</label>
		</div>
		<div class="form-group">
			<span>理由：</span>
			<textarea v-model="assessText"></textarea>
		</div>
		<div class="form-group">
			<button @click="save(false)">取消</button>
			<button @click="save(true)">确定</button>
		</div>
	</div>
</div>
</template>
<script>
	module.exports = {
		props:{
		},
		data(){
			return {
				//评价
				read:'合理',
				sead:'未定',
				unsead:'绕路',
				assessText:''

			}
		},
		methods:{
			save(bool){
				var sead;
				if(this.read == '合理'){
					sead = this.sead;
				}else{
					sead = this.unsead;
				}
				this.$dispatch("assessSave", bool,this.read,sead,this.assessText);
			}
		}
	}
</script>
<style>
	.assessBox{
		border:1px solid red;
		background-color: #fff;
		width:350px;
		height: 280px;
		position: absolute;
		top:0;
		bottom:0;
		left:0;
		right:0;
		margin: auto;
		z-index: 2;
	}
	.assessBox .title{
		text-align: center;
	}
	.assessBox .form-group .secondinput{
		margin-left: 52px;
	}
	.assessBox .form-group textarea{
		width:250px;
		resize: none;
	}
	.assessBox .form-group button{
		margin-left: 70px;
	}
</style>