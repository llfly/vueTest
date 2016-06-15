<template>
	<div class="taskSearchTool">
		<span>创建时间</span>
		<input type="text" @click="showCalendar" v-model="value" placeholder="请输入日期">
    	<calendar :show.sync="show" :value.sync="value" :x="x" :y="y" :begin="begin" :end="end" :range="range"></calendar>
    	<span>任务类型</span>
    	<select v-model="typeSele">
    		<option v-for="item in typesList" :value="item.text">{{item.text}}</option>
		</select>
    	<span>任务进度</span>
    	<select v-model="taskProSele">
    		<option v-for="item in taskProList" :value="item.text">{{item.text}}</option>
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
					<td>{{item.name}}</td>
					<td>{{item.schedule}}</td>
					<td>{{item.sampleSize}}</td>
					<td>{{item.unassess}}</td>
					<td>{{item.createTime}}</td>
					<td>{{item.lastAssessTime}}</td>
					<td>{{item.owner}}</td>
					<td>
						<span v-if="item.type == '匹配校验'" v-link="{name:'artificial',params:{id:20}}">查看</span>
						<span v-else v-link="{name:'matchList',params:{id:20}}">查看</span>
						&nbsp;<span @click="delItem(item)">删除</span>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div>
		<input type="submit" value="批量删除">
	</div>
    <cccc></cccc>
</template>
<script>

import calendar from '../components/calendar';
import cccc from '../components/DeleteConfirm';

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
            	name:'5月25日数据更新',
            	schedule:'进行中',
            	sampleSize:100,
            	unassess:50,
            	createTime:'2016.05.25 18:25:28',
            	lastAssessTime:'2016.05.25 18:25:28',
            	owner:'FengLuYi'//=='匹配校验'
            	//options:'<a href="./#Artificial">查看</a> <a href="">删除</a>'
            },{
            	index:2,
            	type:'普通评测',
            	name:'5月25日数据更新',
            	schedule:'进行中',
            	sampleSize:2,
            	unassess:50,
            	createTime:'2016.05.25 18:25:28',
            	lastAssessTime:'2016.05.25 18:25:28',
            	owner:'FengLuYi'//=='匹配校验'
            	//options:'<a href="./#Artificial">查看</a> <a href="">删除</a>'
            }],
            //任务类型
            typeSele:'全部',
            typesList:[{
            	text:'全部',
            },{
            	text:'匹配校验',

            },{
            	text:'普通评测',
            }],

            //任务进度
            taskProSele:'全部',
            taskProList:[{
            	text:'全部',
            },{
            	text:'进行中',
            },{
            	text:'已结束',
            }]

        }
    },
    ready(){
  //   	this.$http.get('book.json', function(data) {
		// 	this.$set('books', data);
		// }).error(function(data, status, request) {
		// 	console.log('fail' + status + "," + request);
		// })
		// this.$http.post(url,postdata,function callback）
		// Vue.http.options.emulateJSON = true;
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
        },
        delItem(item){
        	this.items.$remove(item);
        }
    },
    components:{
        calendar,
        cccc
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
	.taskSearchShow td span{
		cursor: pointer;
		color:blue;
		text-decoration: none;
	}
</style>