<template>
	<div class="taskSearchTool">
		<span>评价时间</span>
		<input type="text" @click="showCalendar" v-model="value" placeholder="请输入日期">
    	<calendar :show.sync="show" :value.sync="value" :x="x" :y="y" :begin="begin" :end="end" :range="range"></calendar>
    	<span>类型</span>
    	<select v-model="typesSele">
    		<option v-for="item in typesList" :value="item.text">{{item.text}}</option>
		</select>
    	<span>评价</span>
    	<select v-model="evalsSele">
			<option v-for="item in evalsList" :value="item.text">{{item.text}}</option>
		</select>
		<span>标签</span>
		<select>
			<option v-for="item in tagsList" :value="item.text" :selected="$index == 0 ? true : false">{{item.text}}</option>
		</select>
		<span>最佳方案</span>
		<select v-model="bestDecSele">
    		<option v-for="item in bestDecList" :value="item.text">{{item.text}}</option>
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
</template>
<script>
	import calendar from '../components/calendar.vue';
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

            //类型 types
            typesSele:'全部',
            typesList:[{
            	text:'全部',
            },{
            	text:'VIPcase',

            },{
            	text:'重点case',
            },{
            	text:'一般case'
            }],
            //评价 evals	标签 tags
            evalsSele:'全部',
            evalsList:[{
				text: '全部',
				tags: [
						{text: '全部'},
						{text: '未定'},
						{text: '最佳'},
						{text:'非最佳'},
						{text:'绕路'},
						{text:'畸形'},
						{text:'不避堵'},
						{text:'小路多'},
						{text:'其他'}
					]
				},
				{
					text: '合理',
					tags: [
						{text: '未定'},
						{text: '最佳'},
						{text: "非最佳"}
					]
				},
				{
					text:'不合理',
					tags:[
						{text:'绕路'},
						{text:'畸形'},
						{text:'不避堵'},
						{text:'小路多'},
						{text:'其他'}
					]
				},
				{
					text:'无评价',
					tags:[
						{text:'全部'}
					]
				}
			],

            //最佳方案 bestDec
            bestDecSele:'全部',
            bestDecList:[{
            	text:'全部',
            },{
            	text:'单条最佳'
            },{
            	text:'多条最佳'
            },{
            	text:'无最佳'
            }],

            //table
            items:[{
            	index:1,
            	type:'匹配校验',

            }],
            	tagOptions:[{text: '未定', value: 'a' },
            	{text:'最佳',value:'b'},
            	{text:'非最佳',value:'c'}
            ],
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
    },
    computed: {
    	tagsList: {
      		get: function() {
        		let that = this;
        		return this.evalsList.filter(function(item) {
          			return item.text == that.evalsSele;
        		})[0].tags;
			}
    	}
  	}
}
</script>
<style>
	
</style>