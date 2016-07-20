<template>
	<div class="taskSearchTool">
		<select v-model="timeTypeSele">
			<option v-for="item in timeTypeList" :value="item.value">{{item.text}}</option>
		</select>
        <date-picker :time.sync="startTime" :option="startOption"></date-picker>-
        <date-picker :time.sync="endTime" :option="endOption"></date-picker>
    	<span>状态</span>
    	<select v-model="stateSele">
    		<option v-for="item in stateList" :value="item.text">{{item.text}}</option>
		</select>
    	<span>评价</span>
    	<select v-model="EvalSele">
    		<option v-for="item in EvalList" :value="item.text">{{item.text}}</option>
		</select>
		<span>评价人</span>
		<input type="text" v-model="own">
    	<button type="button" @click="getData()">搜索</button>
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
					<td>{{item.index | isNull}}</td>
					<td>{{item.start | isNull}}</td>
					<td>{{item.end | isNull}}</td>
					<td>{{item.time | isNull}}</td>
					<td>{{item.dist | isNull}}</td>
					<td>{{item.conditionTime | isNull}}</td>
					<td>{{item.city | isNull}}</td>
					<td>{{item.eval | isNull}}</td>
					<td>{{item.state}}</td>
					<td>{{item.stateTime | isNull}}</td>
					<td>{{item.own | isNull}}</td>
					<td>
						<span v-link="{name:'mainmap',params:{id:item.caseid,type:'getevaroute',taskid:this.$route.params.id}}">查看</span>
						&nbsp;<span @click="delItem(item.caseid)">删除</span>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
    <div class="bottomBtn">
        <span class="returnBtn" @click="backPage()">返回上一页</span>
        <button type="button" @click="saveData()">提交样本库</button>
        <Turnpage :all.sync="all" :cur.sync="page"></Turnpage>
    </div>
    <confirm v-show="delShow" :cur-item='checkedDel'></confirm>
</template>
<script>
import confirm from '../components/DeleteConfirm';
import Turnpage from '../components/TurnPage.vue';
import API_ROOT from '../store/resources.js';
import datePicker from '../components/vue-datepicker.vue'

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
            //评测时间
            timeTypeSele:'etime',
            timeTypeList:[{
            	text:'评价时间',
                value:'etime'
            },{
            	text:'路况时间',
                value:'lktime'
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
            own:'',

            items:[],
            //要删除的列表
            delShow:false,
            checkedDel:[],
            page:1,
            all:1,
        }
    },
    route:{
        data(){
            this.getData();
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
        getData(){
            //先清空列表
            this.items = [];
            var urlArr = [API_ROOT+'geteva'];
            urlArr.push('taskid='+this.$route.params.id);
            if(this.startTime){
                var timeStr = this.timeTypeSele +'='+ this.startTime + ':00';
                if(this.endTime){
                    timeStr +=',' + this.endTime + ':00';
                }
                urlArr.push(timeStr);
            }
            if(this.stateSele){
                urlArr.push('stat='+ this.stateSele);
            }
            if(this.EvalSele){
                urlArr.push('eva=' + this.EvalSele);
            }
            if(this.own){
                urlArr.push('own='+ this.own);
            }
            if(this.page){
                urlArr.push('page=' + this.page);
            }
            var url = urlArr.join('&');
            console.log(url);
            this.$http.get(url, function(data) {
                if(data.status == 'success')
                this.turnData(data);
            }).catch(function(data, status, request) {
                console.log('fail' + status + "," + request);
            });
        },
        turnData(data){
            this.all = data.pagenum;
            data = data.cases;
            for(var i = 0,len = data.length;i<len;i++){
                this.items.push({
                    index:i+1,
                    caseid:data[i].caseid,
                    start:data[i].start,
                    end:data[i].end,
                    time:data[i].cost +'分钟',
                    dist:data[i].dis/1000 +'公里',
                    conditionTime:data[i].lktime,
                    city:data[i].city,
                    eval:data[i].eva,
                    state:data[i].eva!='null'?'已评价':'未评价',
                    stateTime:data[i].etime,
                    own:data[i].own
                })
            }
        },
        saveData(){
            if(sessionStorage.user){
            var url = API_ROOT + 'submitevaall' + '&user=' + sessionStorage.user + '&taskid=' + this.$route.params.id;
            console.log(url);
            this.$http.get(url, function(data) {
                if(data.status = 'success'){
                        alert('提交成功');
                    }else{
                        alert('提交失败');
                    }
            }).catch(function(data, status, request) {
                alert('请求失败');
            });
            }else{
                 this.$route.router.go({name:'login',params:{type:'artificial',id:this.$route.params.id}});
            }
        },
        delItem(item){
            if(item && this.checkedDel.indexOf(item.toString())==-1)
                this.checkedDel.push(item);
            if(this.checkedDel.length)
                this.delShow = true;
        },
        backPage(){
            history.go(-1);
        }
    },
    components:{
        confirm,
        Turnpage,
        datePicker
    },
    events:{
        del(bool,item){
            this.delShow = false;
            var that = this;
            if(bool){
                if(sessionStorage.user){
                    for(var i=0,len = this.checkedDel.length;i<len;i++){
                        this.items.$remove(this.items.filter(function(item){return item.caseid == that.checkedDel[i];})[0]);
                    };
                    //与后台交互，清空要删除的数组
                    var url = API_ROOT + 'deleva' + '&user='+sessionStorage.user + '&caseid='+this.checkedDel.join(',') +'&taskid=' + this.$route.params.id;
                    this.$http.get(url,function(data){
                        if(data.status == 'fail'){
                            alert(data.detail);
                        }
                    }).catch(function(data,status,request){
                         alert('请求失败！');
                    });
                    this.checkedDel = [];
                }else{
                    this.$route.router.go({name:'login',params:{type:'artificial',id:this.$route.params.id}});
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