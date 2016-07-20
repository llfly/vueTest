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
        <span>是否匹配</span>
        <select v-model="matchSele">
            <option v-for="item in matchList" :value="item.text">{{item.text}}</option>
        </select>
        <span>原评价</span>
        <select v-model="oldEvalSele">
            <option v-for="item in oldEvalList" :value="item.text">{{item.text}}</option>
        </select>
        <span>新评价</span>
        <select v-model="newEvalSele">
            <option v-for="item in newEvalList" :value="item.text">{{item.text}}</option>
        </select>
        <span>是否新评</span>
        <select v-model="isNewEvalSele">
            <option v-for="item in isNewEvalList" :value="item.text">{{item.text}}</option>
        </select>
        <button type="button" @click="getData()">搜索</button>
        <button type="button" @click="getTab()">统计查看</button>
    </div>
    <div>
        <table class="taskSearchShow">
            <thead>
                <tr>
                    <td>序号</td>
                    <td>编号</td>
                    <td>类型</td>
                    <td>起点</td>
                    <td>终点</td>
                    <td>是否匹配</td>
                    <td>原评价</td>
                    <td>原标签</td>
                    <td>是否新评</td>
                    <td>新评价</td>
                    <td>匹配时间</td>
                    <td>重评时间</td>
                    <td>评价人</td>
                    <td>操作</td>
                </tr>
            </thead>
            <tbody>
                <tr v-for='item in items'>
                    <td>{{item.index | isNull}}</td>
                    <td>{{item.caseid | isNull}}</td>
                    <td>{{item.type | isNull}}</td>
                    <td>{{item.start | isNull}}</td>
                    <td>{{item.end | isNull}}</td>
                    <td>{{item.match | isNull}}</td>
                    <td>{{item.eva | isNull}}</td>
                    <td>{{item.label | isNull}}</td>
                    <td>{{item.reva | isNull}}</td>
                    <td>{{item.neweva}}</td>
                    <td>{{item.mtime | isNull}}</td>
                    <td>{{item.retime | isNull}}</td>
                    <td>{{item.own | isNull}}</td>
                    <td>
                        <span v-link="{name:'mainmap',params:{id:item.caseid,type:'getmatchroute',taskid:this.$route.params.id}}">查看</span>
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
    <div v-show="statsShow" class="stats">
        <table class="taskSearchShow">
            <thead>
                <tr>
                    <td></td>
                    <td colspan="4">整体变化</td>
                    <td colspan="4">局部变化</td>
                    <td colspan="3">不匹配分析</td>
                </tr>
                <tr>
                    <td>类型</td>
                    <td>总计</td>
                    <td>匹配</td>
                    <td>不匹配</td>
                    <td>不匹配占比</td>
                    <td>合理</td>
                    <td>不匹配</td>
                    <td>不合理</td>
                    <td>不匹配</td>
                    <td>合理变不合理</td>
                    <td>不合理变合理</td>
                    <td>评价未变化</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td v-for="item in stats[0]" v-text="item" track-by="$index"></td>
                </tr>
                <tr>
                    <td v-for="item in stats[1]" v-text="item" track-by="$index"></td>
                </tr>
                <tr>
                    <td v-for="item in stats[2]" v-text="item" track-by="$index"></td>
                </tr>
                <tr>
                    <td v-for="item in stats[3]" v-text="item" track-by="$index"></td>
                </tr>
            </tbody>
        </table>
    </div>
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


            //评测时间
            timeTypeSele:'mtime',
            timeTypeList:[{
                text:'匹配时间',
                value:'mtime'
            },{
                text:'重评时间',
                value:'etime'
            }],

            //类型
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

            //是否匹配
            matchSele:'全部',
            matchList:[{
                text:'全部'
            },{
                text:'匹配',
            },{
                text:'不匹配',

            }],

            //原评价
            oldEvalSele:'全部',
            oldEvalList:[{
                text:'全部',
            },{
                text:'合理',
            },{
                text:'不合理',
            }],

            //新评价
            newEvalSele:'全部',
            newEvalList:[{
                text:'全部',
            },{
                text:'合理',
            },{
                text:'不合理',
            }],

            //是否新评
            isNewEvalSele:'全部',
            isNewEvalList:[{
                text:'全部',
            },{
                text:'未评',
            },{
                text:'已评',
            }],

            items:[],
            stats:[],
            statsShow:false,
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
            var urlArr = [API_ROOT+'getmatch'];
            urlArr.push('taskid='+this.$route.params.id);
            if(this.startTime){
                var timeStr = this.timeTypeSele +'='+ this.startTime + ':00';
                if(this.endTime){
                    timeStr +=',' + this.endTime + ':00';
                }
                urlArr.push(timeStr);
            }
            if(this.typesSele){
                urlArr.push('type='+ this.typesSele);
            }
            if(this.matchSele){
                urlArr.push('match=' + this.matchSele);
            }
            if(this.oldEvalSele){
                urlArr.push('eva='+ this.oldEvalSele);
            }
            if(this.newEvalSele){
                urlArr.push('neweva='+ this.newEvalSele);
            }
            if(this.isNewEvalSele){
                urlArr.push('isnew='+ this.isNewEvalSele);
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
                    type:data[i].type,
                    start:data[i].start,
                    end:data[i].end,
                    match:data[i].match,

                    eva:data[i].eva,
                    label:data[i].label,
                    reva:data[i].neweva =='null'?'未评':'已评',
                    neweva:data[i].neweva,
                    mtime:data[i].mtime,
                    retime:data[i].retime,
                    own:data[i].own,
                })
            }
        },
        saveData(){
            if(sessionStorage.user){
                var url = API_ROOT + 'submitmatchall' + '&user=' + sessionStorage.user + '&taskid=' + this.$route.params.id;
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
                this.$route.router.go({name:'login',params:{type:'matchList',id:this.$route.params.id}});
            }
        },
        delItem(item){
            if(item && this.checkedDel.indexOf(item.toString())==-1)
                this.checkedDel.push(item);
            if(this.checkedDel.length)
                this.delShow = true;
        },
        getTab(){
            var url = API_ROOT + 'getmatchstat' + '&taskid=' + this.$route.params.id;
            this.$http.get(url, function(data) {
                if(data.status == 'success'){
                   this.dealTab(data);
                }
            }).catch(function(data, status, request) {
                console.log('fail' + status + "," + request);
            });
        },
        dealTab(data){
            if(!this.statsShow){
                var arr = ['VIPcase','重点case','一般case','合计'];
                for(var i=0;i<3;i++){
                    data['stat'+i].unshift(arr[i]);
                    this.stats.push(data['stat'+i]);
                }
                this.statsShow = true;
            }
        },
        backPage(){
            history.go(-1);
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
                    var url = API_ROOT + 'delmatch' + '&user=' + sessionStorage.user + '&caseid='+this.checkedDel.join(',') +'&taskid=' + this.$route.params.id;
                    this.$http.get(url,function(data){
                    }).catch(function(data,status,request){
                        console.log('fail' + status + "," + request);
                    });
                    this.checkedDel = [];
                }else{
                    this.$route.router.go({name:'login',params:{type:'matchList',id:this.$route.params.id}});
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
    .stats{
        margin-top: 50px;
    }
</style>