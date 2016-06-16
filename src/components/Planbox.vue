<template>
	<div class="plan-box">
		<span class="plan-origin">{{origin[0].value}}</span>
		<div class="plan-info1">
			<span class="border">{{time}}</span>
			<span class="border">{{dist}}</span>
			<span>{{trafficLight}}</span>
		</div>
		<div class="plan-info2">
			<span class="border">{{trafficBlock}}</span>
			<span class="border">{{pathway}}</span>
			<span>{{roadCondi}}</span>
		</div>
		<div class="plan-opt">
			<span>设为最佳</span>
			<span>隐藏</span>
		</div>
		<span class="plan-btn">评价</span>
	</div>
</template>
<script>
	module.exports = {
		data(){
			return{
				origin:[{
					id:0,
					value:'线上方案',
					type:'0',//0人工评价,1二次评价
					isAssess:1,//是否已经评价1是 0否
					assess:[[{text:'重新评价'},{text:'评价'}],[{text:'设为最佳 隐藏',},{text:'取消最佳 隐藏'}]]
				},{

				}],
				//origin:['线上方案','全程畅通','世纪高通','自定义','新结果','历史不合理','老自定义','新自定义','新结果'],
				time:'1小时30分钟',
				dist:'22.3公里',
				trafficLight:'8个红绿灯（3个左转）',
				trafficBlock:'3段拥堵，共500米',
				pathway:'小路1.8公里',
				roadCondi:'有路况20.5公里'

			}
		}
	}
</script>
<style scope>
	.plan-box{
		width:440px;
		height: 80px;
		border:1px solid #999;
		font-size:14px;
		position: relative;
	}
	.plan-origin{
		width:80px;
		color:white;
		background-color: #444;
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
	.plan-box .border{
		border-right: 1px solid #000;
	}
	.plan-box .plan-btn{
		background-color: rgb(0,153,255);
		padding: 5px;
		border-radius: 5px;
		display:inline-block;
		position: absolute;
		right: 15px;
		top:35px;
		color:white;
		cursor: pointer;
	}
	.plan-box .plan-opt{
		position: absolute;
		top:3px;
		right: 3px;
		color:#666;
	}
</style>