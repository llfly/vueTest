<template>
	<div class="taskSearchTool">
		<span>评价时间</span>
		<input type="text" @click="showCalendar" v-model="value" placeholder="请输入日期">
    	<calendar :show.sync="show" :value.sync="value" :x="x" :y="y" :begin="begin" :end="end" :range="range"></calendar>
    	<span>类型</span>
    	<select>
    		<option selected>全部</option>
    		<option>VIPcase</option>
    		<option>重点case</option>
    		<option>一般case</option>
		</select>
    	<span>评价</span>
    	<select>
    		<option selected>全部</option>
    		<option>合理</option>
    		<option>不合理</option>
    		<option>无评价</option>
		</select>
		<span>标签</span>
		<select options="tagOptions">
<!--     		<option selected>未定</option>
    		<option>最佳</option>
    		<option>非最佳</option> -->
		</select>

		<select v-model="selected">
			<option v-for="yx in YX" :value="yx.text">{{yx.text}}</option>
		</select>
		<select>
			<option v-for="zy in selection" :value="zy.text" :selected="$index == 0 ? true : false">{{zy.text}}</option>
		</select>

		<span>最佳方案</span>
		<select>
    		<option selected>全部</option>
    		<option>单条最佳</option>
    		<option>多条最佳</option>
    		<option>无最佳</option>
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

            items:[{
            	index:1,
            	type:'匹配校验',

            }],
            tagOptions:[{text: '未定', value: 'a' },
            {text:'最佳',value:'b'},
            {text:'非最佳',value:'c'}
            ],

            selected:'计信院',
            YX: [{
				text: '计信院',
				ZY: [{
					text: '软件工程'},
					{text: '计算机科学与技术'},
					{text: "信息安全"}
					]
				},
				{
				text: '商学院',
				ZY: [{text: '旅游管理'},
				{text: '工商管理'},
				{text: "行政管理"}
				]
			}, ]
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
    selection: {
      get: function() {
        var that = this;
        return this.YX.filter(function(item) {
          return item.text == that.selected;
        })[0].ZY;
      }
    }
  }
}
</script>
<style>
	
</style>