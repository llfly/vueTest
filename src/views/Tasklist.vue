<template>
	<div class="taskSearchTool">
		<span>创建时间</span>
		<date-picker :time.sync="startTime" :option="startOption"></date-picker>-
        <date-picker :time.sync="endTime" :option="endOption"></date-picker>
    	<span>任务类型</span>
    	<select v-model="typeSele">
    		<option v-for="item in typesList" :value="item.text">{{item.text}}</option>
		</select>
    	<span>任务进度</span>
    	<select v-model="taskProSele">
    		<option v-for="item in taskProList" :value="item.text">{{item.text}}</option>
		</select>
    	<button type="button" @click="getData()">搜索</button>
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
					<td><input type="checkbox" v-model="checkedDel" value="{{item.taskid}}"></td>
					<td>{{item.index}}</td>
					<td>{{item.type}}</td>
					<td>{{item.name}}</td>
					<td>{{item.pharse}}</td>
					<td>{{item.totalnum}}</td>
					<td>{{item.restnum}}</td>
					<td>{{item.ctime}}</td>
					<td>{{item.etime}}</td>
					<td>{{item.own}}</td>
					<td>
						<span v-if="item.type == '匹配校验'" v-link="{name:'matchList',params:{id:item.taskid}}">查看</span>
						<span v-else v-link="{name:'artificial',params:{id:item.taskid}}">查看</span>
						&nbsp;<span @click="delItem(item.taskid)">删除</span>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div class="bottomBtn">
		<input type="submit" value="批量删除" @click="delItem()">
        <Turnpage :all.sync="all" :cur.sync="page"></Turnpage>
	</div>
    <confirm v-show="delShow" :cur-item='checkedDel'></confirm>
</template>
<script>

import datePicker from '../components/vue-datepicker.vue';
import confirm from '../components/DeleteConfirm';
import Turnpage from '../components/TurnPage.vue';
import API_ROOT from '../store/resources.js';

module.exports = {
    data() {
        return {
            //时间相关
            startTime:'',
            startOption:{
                type: 'min',
                month: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                format: 'YYYY-MM-DD HH:mm',
                placeholder: '开始时间',
                buttons: {
                    ok: '确定',
                    cancel: '取消'
                }
            },
            endTime:'',
            endOption:{
                type: 'min',
                month: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                format: 'YYYY-MM-DD HH:mm',
                placeholder: '截止时间',
                buttons: {
                    ok: '确定',
                    cancel: '取消'
                }
            },


            //items:[],
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
            }],

            items:[],
            //删除面板显示隐藏
            delShow:false,
            //传递当前删除项给子组件
            //要删除的列表
            checkedDel:[],
            page:1,
            all:1,
        }
    },
    ready(){
        this.getData();

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
        getData(){
            //先清空列表
            this.items = [];
            var urlArr = [API_ROOT+'gettask'];
            if(this.startTime){
                var timeStr = 'ctime='+ this.startTime + ':00';
                if(this.endTime){
                    timeStr +=',' + this.endTime + ':00';
                }
                urlArr.push(timeStr);
            }
            if(this.typeSele){
                urlArr.push('type='+ this.typeSele);
            }
            if(this.taskProSele){
                urlArr.push('pharse=' + this.taskProSele);
            }
            if(this.page){
                urlArr.push('page=' + this.page);
            }
            var url = urlArr.join('&');
            console.log(url);
            this.$http.get(url, function(data) {
                if(data.status == "success")
                    this.turnData(data);
            }).catch(function(data, status, request) {
                console.log('fail' + status + "," + request);
            });
        },
        turnData(data){
            this.all = data.pagenum;
            data = data.tasks;
            //清空数据
            for(var i = 0,len = data.length;i<len;i++){
                this.items.push({
                    index:i+1,
                    taskid:data[i].taskid,
                    type:data[i].type,
                    name:data[i].name,
                    pharse:data[i].pharse,
                    totalnum:data[i].totalnum,
                    restnum:data[i].restnum,
                    ctime:data[i].ctime,
                    etime:data[i].etime,
                    own:data[i].own
                })
            }
        },
        //删除相关
        delItem(item){
            if(item && this.checkedDel.indexOf(item.toString())==-1)
                this.checkedDel.push(item);
            if(this.checkedDel.length)
                this.delShow = true;
        }
    },
    components:{
        datePicker,
        confirm,
        Turnpage
    },
    events:{
    	del(bool,item){
    		this.delShow = false;
            var that = this;
            if(bool){
                if(sessionStorage.user){
                    for(var i=0,len = this.checkedDel.length;i<len;i++){
                        this.items.$remove(this.items.filter(function(item){return item.taskid == that.checkedDel[i];})[0]);
                    };
                    //与后台交互，清空要删除的数组
                    var url = API_ROOT + 'deltask' + '&user='+ sessionStorage.user + '&taskid='+this.checkedDel.join(',');
                    console.log(url);
                    this.$http.get(url,function(data){
                        console.log(data);
                        if(data.status == 'fail'){
                            alert(data.detail);
                        }
                    }).catch(function(data,status,request){
                        alert('请求失败！');
                    });
                    this.checkedDel = [];
                }else{
                    this.$route.router.go({name:'login',params:{type:'taskList'}});
                }
            }
    	},
        pageClick(num){
            this.page = num;
            this.getData();
        }
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
    .bottomBtn{
        border:1px solid rgb(215,215,215);
        padding:10px;
        margin-top:30px;
        overflow:hidden;
        *zoom:1;
    }
</style>