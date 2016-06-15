<template>
    <div class="taskSearchTool">
        <select v-model="timeTypeSele">
            <option v-for="item in timeTypeList" :value="item.text">{{item.text}}</option>
        </select>
        <input type="text" @click="showCalendar" v-model="value" placeholder="请输入日期">
        <calendar :show.sync="show" :value.sync="value" :x="x" :y="y" :begin="begin" :end="end" :range="range"></calendar>
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
        <button type="button">搜索</button>
        <button type="button">统计查看</button>
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
                    <td><a href="#">查看</a>&nbsp;<a href="#">删除</a></td>
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
            timeTypeSele:'匹配时间',
            timeTypeList:[{
                text:'匹配时间',
            },{
                text:'重评时间'
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
        }
    },
    components:{
        calendar
    }
}
</script>