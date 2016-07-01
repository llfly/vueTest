<template>
	<div class="taskSearchTool">
		<select v-model="timeTypeSele">
            <option v-for="item in timeTypeList" :value="item.value">{{item.text}}</option>
        </select>
		<date-picker :time.sync="startTime" :option="startOption"></date-picker>-
        <date-picker :time.sync="endTime" :option="endOption"></date-picker>
    	<span>类型</span>
    	<select v-model="typesSele">
    		<option v-for="item in typesList" :value="item.text">{{item.text}}</option>
		</select>
    	<span>评价</span>
    	<select v-model="evalsSele">
			<option v-for="item in evalsList" :value="item.text">{{item.text}}</option>
		</select>
		<span>标签</span>
		<select v-model="labelSele">
			<option v-for="item in tagsList" :value="item.text">{{item.text}}</option>
		</select>
		<span>最佳方案</span>
		<select v-model="bestDecSele">
    		<option v-for="item in bestDecList" :value="item.text">{{item.text}}</option>
		</select>
    	<button type="button" @click="getData()">搜索</button>
	</div>
	<div>
		<table class="taskSearchShow">
			<thead>
				<tr>
					<td>批量操作</td>
					<td>序号</td>
					<td>编号</td>
					<td>类型</td>
					<td>起点</td>
					<td>终点</td>
					<td>时间</td>
					<td>距离</td>
					<td>路况时间</td>
					<td>评价</td>
					<td>当前标签</td>
					<td>城市</td>
					<td>评价时间</td>
					<td>评价人</td>
					<td>操作</td>
				</tr>
			</thead>
			<tbody>
				<tr v-for='item in items'>
					<td><input type="checkbox" v-model="checkedDel" value="{{item.caseid}}"></td>
					<td>{{item.index}}</td>
					<td>{{item.caseid}}</td>
					<td>{{item.type}}</td>
					<td>{{item.start}}</td>
					<td>{{item.end}}</td>
					<td>{{item.cost}}</td>
					<td>{{item.dis}}</td>
					<td>{{item.lktime}}</td>
					<td>{{item.eva}}</td>
					<td>{{item.label}}</td>
					<td>{{item.city}}</td>
					<td>{{item.etime}}</td>
					<td>{{item.own}}</td>
					<td>
						<span v-link="{name:'mainmap',params:{id:item.caseid,type:'dispcase'}}">查看</span>
						&nbsp;<span @click="delItem(item.caseid)">删除</span>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div class="bottomBtn">
		<input type="submit" value="批量删除" @click="delItem()">
        <input type="submit" value="导出" @click="printOut()">
        <Turnpage :all.sync="all" :cur.sync="page"></Turnpage>
	</div>
    <confirm v-show="delShow" :cur-item='checkedDel'></confirm>
</template>
<script>
import datePicker from '../components/vue-datepicker.vue'
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
            //评测时间
            timeTypeSele:'etime',
            timeTypeList:[{
                text:'评价时间',
                value:'etime'
            },{
                text:'路况时间',
                value:'lktime'
            }],




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
            labelSele:'',
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
                        {text: '全部'},
						{text: '未定'},
						{text: '最佳'},
						{text: "非最佳"}
					]
				},
				{
					text:'不合理',
					tags:[
                        {text: '全部'},
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
            var urlArr = [API_ROOT+'getcase'];
            if(this.startTime){
                var timeStr = this.timeTypeSele + '=' + this.startTime + ':00';
                if(this.endTime){
                    timeStr +=',' + this.endTime + ':00';
                }
                urlArr.push(timeStr);
            }
            // etime=xxx,xxx&lktime=xxx,xxx&
            // eva=xxx&label=xxx&cost=xx,xx&
            // dis=xxx,xxx&poi=xxx&id=xxx&own=xxx&page=xxx(从1开始)

            if(this.typesSele){
                urlArr.push('type='+ this.typesSele);
            }
            if(this.evalsSele){
                urlArr.push('eva=' + this.evalsSele);
            }
            if(this.labelSele){
                urlArr.push('label=' + this.labelSele)
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
            data = data.cases;
            //清空数据
            for(var i = 0,len = data.length;i<len;i++){
                this.items.push({
                    index:i+1,
                    caseid:data[i].caseid,
                    type:data[i].type,
                    start:data[i].start,
                    end:data[i].end,
                    cost:data[i].cost,
                    dis:data[i].dis + '公里',
                    lktime:data[i].lktime,
                    eva:data[i].eva!='null'?data[i].eva:'',
                    label:data[i].label!='null'?data[i].label:'',
                    city:data[i].city,
                    etime:data[i].etime,
                    own:data[i].own
                })
            }
        },
        delItem(item){
            if(item && this.checkedDel.indexOf(item.toString())==-1)
                this.checkedDel.push(item);
            if(this.checkedDel.length)
                this.delShow = true;
        },
        printOut(){
            if(this.checkedDel.length){
                var arr = [];
                var that = this;
                for(var i=0,len = this.checkedDel.length;i<len;i++){
                    arr.push(this.items.filter(function(item){return item.caseid == that.checkedDel[i];})[0].caseid);
                };
                var url = API_ROOT + 'exportcase' + '&caseid=' + arr.join(',');
                var iframe = document.createElement('iframe');
                iframe.style.width = '0';
                iframe.style.height = '0';
                iframe.style.opacity = 0;
                iframe.src = url;
                document.getElementsByClassName('bottomBtn')[0].appendChild(iframe);
                setTimeout(function(){
                    iframe.remove();
                },2000);
            }
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
                        this.items.$remove(this.items.filter(function(item){return item.caseid == that.checkedDel[i];})[0]);
                    };
                    //与后台交互，清空要删除的数组
                    var url = API_ROOT + 'delcase' + '&user='+ sessionStorage.user + '&caseid='+this.checkedDel.join(',');
                    this.$http.get(url,function(data){
                        if(data.status == 'fail'){
                            alert(data.detail);
                        }
                    }).catch(function(data,status,request){
                        alert('请求失败！');
                    });
                    this.checkedDel = [];
                }else{
                    this.$route.router.go({name:'login',params:{type:'sampleList'}});
                }
            }
    	},
        pageClick(num){
            this.page = num;
            this.getData();
        }
    },
    computed: {
    	tagsList: {
      		get: function() {
        		let that = this;
        		var tags = this.evalsList.filter(function(item) {
          			return item.text == that.evalsSele;
        		})[0].tags;
                //console.log(tags);
                this.labelSele = tags[0].text;
                return tags;
			}
    	}
  	}
}
</script>
<style>
</style>