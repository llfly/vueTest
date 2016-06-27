<template>
	<div class="taskSearchTool">
		<select v-model="timeTypeSele">
			<option v-for="item in timeTypeList" :value="item.value">{{item.text}}</option>
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
					<td>{{item.own}}</td>
					<td>
						<span v-link="{name:'mainmap',params:{id:item.caseid,type:'getevaroute'}}">查看</span>
						&nbsp;<span @click="delItem(item.caseid)">删除</span>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
    <div class="bottomBtn">
        <button type="button" @click="saveData()">提交样本库</button>
        <span></span>
        <Turnpage :all.sync="all" :cur.sync="page"></Turnpage>
    </div>
    <confirm v-show="delShow" :cur-item='checkedDel'></confirm>
</template>
<script>
import calendar from '../components/calendar.vue'
import confirm from '../components/DeleteConfirm';
import Turnpage from '../components/TurnPage.vue';
import API_ROOT from '../store/resources.js';


module.exports = {
    data() {
        return {
            show:false,
            type:"date", //date datetime
            value:"",
            // begin:"2015-12-20",
            // end:"2015-12-25",
            x:0,
            y:0,
            range:true,//是否多选


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
            var urlArr = [API_ROOT+'geteva'];
            urlArr.push('taskid='+this.$route.params.id);
            // if(this.value){//etime,lktime  timeTypeSele
            //     urlArr.push(this.timeTypeSele +'='+ this.value);
            // }
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
                    time:data[i].cost,
                    dist:data[i].dis +'公里',
                    conditionTime:data[i].lktime,
                    city:data[i].city,
                    eval:data[i].eva!='null'?data[i].eva:'',
                    state:data[i].eva?'已评价':'未评价',
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
        }
    },
    components:{
        calendar,
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