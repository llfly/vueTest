<template>
	<div class="taskSearchTool">
		<span>创建时间</span>
		<input type="text" @click="showCalendar" v-model="value" placeholder="请输入日期">
    	<calendar :show.sync="show" :value.sync="value" :x="x" :y="y" :begin="begin" :end="end" :range="range"></calendar>
    	<span>任务类型</span>
    	<select>
    		<option selected>全部</option>
    		<option>匹配校验</option>
    		<option>普通评测</option>
		</select>
    	<span>任务进度</span>
    	<select>
    		<option selected>全部</option>
    		<option>进行中</option>
    		<option>已结束</option>
		</select>
    	<button type="button">搜索</button>
	</div>
	<div>
		<table class="taskSearchShow">
			<thead>
				<tr>
					<td>批量操作</td>
					<td>序号</td>
					<td>任务类型</td>
					<td>任务名称</td>
					<td>任务进度</td>
					<td>样本数量</td>
					<td>未评数量</td>
					<td>创建时间</td>
					<td>最后评价时间</td>
					<td>创建人</td>
					<td>操作</td>
				</tr>
			</thead>
			<tbody>
				<tr v-for='item in items'>
					<td><input type="checkbox"></td>
					<td>{{item.index}}</td>
					<td>{{item.type}}</td>
					<td>121212</td>
					<td>121212</td>
					<td>121212</td>
					<td>121212</td>
					<td>121212</td>
					<td>121212</td>
					<td>121212</td>
					<td>121212</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div>
		<input type="submit" value="批量删除">
	</div>
</template>
<script>
import calendar from '../components/calendar.vue'
module.exports = {
    data() {
        return {
            show:false,
            type:"date", //date datetime
            // value:"2015-12-11",
            // begin:"2015-12-20",
            // end:"2015-12-25",
            x:0,
            y:0,
            range:true,//是否多选

            items:[{
            	index:1,
            	type:'匹配校验',

            }]
        }
    },
    methods:{
        showCalendar(e){
            e.stopPropagation();
            var that=this;
            that.show=true;
            that.x=e.target.offsetLeft;
            that.y=e.target.offsetTop+e.target.offsetHeight+8;
            var bindHide=function(e){
                e.stopPropagation();
                that.show=false;
                document.removeEventListener('click',bindHide,false);
            };
            setTimeout(function(){
                document.addEventListener('click',bindHide,false);
            },500);
        }
    },
    components:{
        calendar
    }
}
</script>
<style>
	.taskSearchTool{
		margin-bottom: 20px;
	}
	.taskSearchTool span{
		margin: 0 5px 0 20px;
	}
	.taskSearchShow{
		width:100%;
		border: 1px solid #222;
		border-collapse: collapse;
    	border-spacing: 0;
	}
	.taskSearchShow thead{
		border: 1px solid #666;
		padding: 8px;
		background-color: rgb(0,174,239);
		color:white;
	}
	.taskSearchShow tbody tr:nth-of-type(2n+1) {
    	background-color: #ebf2fa;
	}

	.taskSearchShow td{
		border:1px solid #999;
		text-align: center;
	}
</style>