<template>
	<div class="plan-box" v-show='planIsHide'>
		<span class="plan-origin" :contenteditable="isEditor" @blur="changeName()" @keydown.13="changeName()">{{name}}</span>
		<span  v-bind:class="['plan-label', isBest ? 'plan-best-label' : '']" v-show="isLabel" >{{label}}</span>
		<div class="plan-info1">
			<span v-show="time" class="border-right">{{time}}</span>
			<span v-show="dist">{{dist}}</span>
			<span v-show="trafficLight" class="border-left">{{trafficLight}}</span>
		</div>
		<div class="plan-info2">
			<span v-show="trafficBlock" class="border-right">{{trafficBlock}}</span>
			<span v-show="pathway">{{pathway}}</span>
			<span v-show="roadCondi" class="border-left">{{roadCondi}}</span>
		</div>
		<div class="plan-opt">
			<span v-show="reBest" @click='bestPlanShow()' v-text="isBestPlan?'取消最佳':'设为最佳'"></span>
			<span v-show="ishide" @click='hidePlan()'>隐藏</span>
			<span v-show="isDel"  @click="delPlan()">删除</span>
		</div>
		<span class="plan-btn" @click='evaShow()' v-show="evaBtn" v-text="isEva?'重新评价':'评价'"></span>
		<span class="plan-btn" @click="customSave()" v-show="customBtn" v-text="'保存'"></span>
		<span v-bind:class="['plan-arrow-down',isUp?'plan-arrow-up':'']" @click="showReason()" v-show="isAssetsShow"></span>
		<div class="plan-reason" v-show='reasonShow'>
			理由：<span>{{reason}}</span>
		</div>
	</div>

</template>
<script>
	module.exports = {
		props:['type','name','time','dist','trafficLight','trafficBlock','pathway','roadCondi','isEva','isBestPlan','index','planIsHide','planType','label','customBtn','eva','reason'],
		// props(){
		// 	rmBest:true;
		// 	ishide:true;
		// },
		data(){
			return{

				//箭头方向
				isUp:false,
				//拒绝原因 显示隐藏
				reasonShow:false,
				//评价按钮 显示隐藏
				//evaBtn:false,


				//设为最佳按钮 显示隐藏
				//reBest:false,
				//隐藏按钮 显示隐藏
				//ishide:false,
				//标签按钮 显示隐藏
				//isLabel:false,
				//isBest:this.label == '最佳',
				//删除按钮 显示隐藏
				//isDel:false,
				//是否可编辑
				//isEditor:false,
				//origin:['线上方案','全程畅通','世纪高通','自定义','新结果','历史不合理','老自定义','新自定义','新结果'],
				// time:'1小时30分钟',
				// dist:'22.3公里',
				// trafficLight:'8个红绿灯（3个左转）',
				// trafficBlock:'3段拥堵，共500米',
				// pathway:'小路1.8公里',
				// roadCondi:'有路况20.5公里'
			}
		},
		ready(){
			// if(this.planType == 'getevaroute'){//普通匹配
			// 	if(this.type == '线上方案'){
			// 		this.evaBtn = true;
			// 	}else if(this.type == '世纪高通' || this.type == '全程畅通'){
			// 		this.reBest = true;
			// 		this.ishide = true;
			// 	}else if(this.type == '老自定义'){
			// 	 	this.reBest = true;
			// 	 	this.isDel = true;
			// 	}else if(this.type == '新自定义'){
			// 		this.isEditor = true;
			// 	}
			// }else if(this.planType == 'getmatchroute'){//匹配校验
			// 	if(this.type == '新结果'){
			// 		this.evaBtn = true;
			// 	}else if(this.type == '线上方案' || this.type == '世纪高通' || this.type == '全程畅通'){
			// 		this.reBest = true;
			// 		this.ishide = true;
			// 	}else if(this.type == '历史不合理'){
			// 		this.ishide = true;
			// 	}else if(this.type == '老自定义'){
			// 	 	this.reBest = true;
			// 	 	this.isDel = true;
			// 	}else if(this.type == '新自定义'){
			// 		this.isEditor = true;
			// 	}
			// }

			// else if(this.planType == 'dispcase'){
			// 	//显示label
			// 	this.isLabel = true;
			// }
			// if(this.label && this.label != "null"){
			// 	this.isLabel = true;
			// }
		},
		methods:{
			evaShow(){
				this.$dispatch('evaBox',this.index);
			},
			bestPlanShow(){
				this.$dispatch('bestPlanShow',this.index);
			},
			hidePlan(){
				this.$dispatch('hidePlan',this.index);
			},
			customSave(){
				//this.customBtn = false;
				this.$dispatch('customSave',this.index);
			},
			changeName(){
				var text = this.$el.querySelector('.plan-origin').innerHTML.replace(/<br>|<br\/>/g,"")
				this.$el.querySelector('.plan-origin').innerHTML = text;
				this.$dispatch('changeName',this.index,text);
			},
			delPlan(){
				this.$dispatch('delPlan',this.index);
			},
			showReason(){
				this.isUp = !this.isUp;
				this.reasonShow = !this.reasonShow;
			}
		},
		computed:{
			//标签 显示隐藏
			isLabel:function(){
				return this.label&& this.label!= 'null';
			},
			//最佳样式控制
			isBest:function(){
				return this.label == '最佳';
			},
			//评价按钮显示隐藏
			evaBtn:function(){
				if(this.planType == 'getevaroute' && this.type == '线上方案' || this.planType == 'getmatchroute' && this.type == '新结果'){
					return true;
				}
				return false;
			},
			//设为最佳按钮显示隐藏
			reBest:function(){
				if(this.planType == 'getevaroute'){
					if(this.type == '世纪高通' || this.type == '全程畅通' || this.type == '老自定义'){
						return true;
					}
				}
				if(this.planType == 'getmatchroute'){
					if(this.type == '线上方案' || this.type == '世纪高通' || this.type == '全程畅通'||this.type == '老自定义'){
						return true;
					}
				}
				return false;
			},
			//隐藏按钮 显示隐藏
			ishide:function(){
				if(this.planType == 'getevaroute'){
					if(this.type == '世纪高通' || this.type == '全程畅通'){
						return true;
					}
				}
				if(this.planType == 'getmatchroute'){
					if(this.type == '线上方案' || this.type == '世纪高通' || this.type == '全程畅通'||this.type == '历史不合理'){
						return true;
					}
				}
				return false;
			},
			//删除按钮 显示隐藏
			isDel:function(){
				if( (this.planType == 'getevaroute' || this.planType == 'getmatchroute' ) && (this.type == '老自定义' /*|| this.type == '新自定义'*/)){
					return true;
				}
				return false;
			},
			//是否可编辑名称
			isEditor:function(){
				if((this.planType == 'getevaroute' || this.planType == 'getmatchroute' ) && this.type == '新自定义'){
					return true;
				}
				return false;
			},
			isAssetsShow:function(){
				return this.eva != 'null' && this.reason && this.reason != 'null';
			}
		}
	}
</script>
<style scoped>
	.plan-box{
		width:440px;
		height: auto;
		border:1px solid #999;
		font-size:14px;
		position: relative;
		margin-bottom: 10px;
		cursor: pointer;
	}
	.plan-origin{
		width:80px;
		color:white;
		background-color: #444;
		padding: 0 8px;
	}
	.plan-label{
		width:80px;
		color:white;
		background-color: #777;
		padding: 0 8px;
	}
	.plan-best-label{
		width:80px;
		color:white;
		background-color: red;
		padding: 0 8px;
	}
	.plan-info1,.plan-info2{
		margin: 10px 0 0 10px;
	}
	.plan-info2{
		color:#999;
	}
	.plan-info1 span,.plan-info2 span{
		padding:0 8px;
	}
	.plan-box .border-left{
		border-left: 1px solid #000;
	}
	.plan-box .border-right{
		border-right: 1px solid #000;
	}
	.plan-box .plan-btn{
		background-color: rgb(0,153,255);
		padding: 3px 8px;
		border-radius: 5px;
		display:inline-block;
		position: absolute;
		right: 15px;
		top:25px;
		color:white;
		cursor: pointer;
	}
	.plan-box .plan-opt{
		position: absolute;
		top:3px;
		right: 3px;
		color:#666;
	}
	.plan-box .plan-opt span{
		cursor: pointer;
	}
	.plan-arrow-down{
		display: inline-block;
		position: absolute;
		right: 15px;
		top:55px;
		width:15px;
		height: 7.5px;
		background:url('./../assets/arrow-down.png');
		background-size: 100% 100%;
	}
	.plan-arrow-up{
		background:url('./../assets/arrow-up.png');
		background-size: 100% 100%;
	}
	.plan-box .plan-reason{
		margin: 5px;
		padding: 5px;
		border-top:1px solid #999;
	}
</style>