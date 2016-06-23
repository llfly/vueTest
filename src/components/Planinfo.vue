<template>
	<div class="planinfo">
		<div class="start">
			<span class="start-icon"></span>{{start}}
		</div>
		<div class="end">
			<span class="end-icon"></span>{{end}}
		</div>
		<span class="eva">{{eva}}</span>
		<span class="lktime">{{lktime}}</span>
	</div>
</template>
<script>
	module.exports = {
		props:['start','end','eva','lktime'],
		data(){
			return{
			}
		},
		ready(){
			//console.log(1);
		}
	}
</script>
<style>
	.planinfo{
		width:440px;
		height: 70px;
		font-size:14px;
		position: relative;
	}
	.planinfo .start{
		margin-top: 10px;
		height: 30px;
	}
	.planinfo .start .start-icon{
		display: inline-block;
		width: 20px;
		height:20px;
		background: url('./../assets/startIcon.png');
		background-size:100% 100%;
	}
	.planinfo .end{
		height: 30px;
	}
	.planinfo .end .end-icon{
		display: inline-block;
		width: 20px;
		height:20px;
		background: url('./../assets/endIcon.png');
		background-size: 100% 100%;
	}
	.planinfo .eva{
		position: absolute;
		top:5px;
		right: 5px;
		color: blue;
	}
	.planinfo .lktime{
		position: absolute;
		right: 5px;
		bottom: 10px;
	}
</style>