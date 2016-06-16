<template>
	<div class="taskSearchTool">
		<select v-model="timeTypeSele">
			<option v-for="item in timeTypeList" :value="item.text">{{item.text}}</option>
		</select>
		<input type="text" @click="showCalendar" v-model="value" placeholder="请输入日期">
    	<calendar :show.sync="show" :value.sync="value" :x="x" :y="y" :begin="begin" :end="end" :range="range"></calendar>
    	<span>状态</span>
    	<select v-model="stateSele">
    		<option v-for="item in stateList" :value="item.text">{{item.text}}</option>
		</select>
    	<span>评价</span>
    	<select v-model="EvalSele">
    		<option v-for="item in EvalList" :value="item.text">{{item.text}}</option>
		</select>
		<span>评价人</span>
		<input type="text">
    	<button type="button">搜索</button>
	</div>
	<div>
		<table class="taskSearchShow">
			<thead>
				<tr>
					<td>序号</td>
					<td>起点</td>
					<td>终点</td>
					<td>时间</td>
					<td>距离</td>
					<td>路况时间</td>
					<td>城市</td>
					<td>评价</td>
					<td>状态</td>
					<td>评价时间</td>
					<td>评价人</td>
					<td>操作</td>
				</tr>
			</thead>
			<tbody>
				<tr v-for='item in items'>
					<td>{{item.index}}</td>
					<td>{{item.start}}</td>
					<td>{{item.end}}</td>
					<td>{{item.time}}</td>
					<td>{{item.dist}}</td>
					<td>{{item.conditionTime}}</td>
					<td>{{item.city}}</td>
					<td>{{item.eval}}</td>
					<td>{{item.state}}</td>
					<td>{{item.stateTime}}</td>
					<td>{{item.owner}}</td>
					<td>
						<span v-link="{name:'mainmap',params:{id:20}}">查看</span>
						&nbsp;<span @click="delItem(item)">删除</span>
					</td>
				</tr>
			</tbody>
		</table>
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


            //评测时间
            timeTypeSele:'评价时间',
            timeTypeList:[{
            	text:'评价时间',
            },{
            	text:'路况时间'
            }],


            //状态
            stateSele:'全部',
            stateList:[{
            	text:'全部',
            },{
            	text:'已评价',

            },{
            	text:'未评价',
            }],

            //评价
            EvalSele:'全部',
            EvalList:[{
            	text:'全部',
            },{
            	text:'合理',
            },{
            	text:'不合理',
            }],

            //评价人

            items:[{
            	index:1,
            	start:'启迪科技大厦D座',
            	end:'798艺术区东门',
            	time:'1小时30分钟',
            	dist:'53.5公里',
            	conditionTime:'2016.05.23 9:25:28',
            	city:'北京',
            	eval:'2016.05.25 18:25:28',
            	state:'未评价',
            	stateTime:'2016.05.25 18:25:28',
            	owner:'FengLuYi'
            }],
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
        },
        delItem(item){

        }
    },
    components:{
        calendar
    }
}
</script>