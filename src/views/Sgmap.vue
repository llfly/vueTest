<template>
	  <div id="map_canvas"></div>
</template>
<script>
	var $links = null;
	var $points = null;
	export default{
		props:['links','points'],
		data(){
			return{
				map:null,
				path:[],
			}
		},
		methods:{
			init(){
				var myLatlng = new sogou.maps.LatLng(39.99226610365429,116.32591408950312);
				var myOptions = {
				  'zoom': 17,
				  'center': myLatlng,
				  'mapTypeId': sogou.maps.MapTypeId.ROADMAP
				}
				this.map = new sogou.maps.Map(document.getElementById("map_canvas"), myOptions);
			},
			dealPoints(){
				//console.log(this.links)
				var link = $links[0];
				var point = $points[0];
				console.log(link);
				for(var i=0 , len=link.length ; i<len; i++){
					var start = link[i]&&link[i].index;
					var end = (link[i+1] && link[i+1].index) || point.length;
					var arr = [];
					console.log(start,end);
					for(var j = start;j<end;j++){
			 			arr.push(point[j]);
					}
					this.path.push(arr);
				}
				this.drawMap();
			},
			drawMap(){
				var colorArr = ['#0000ff','#00ff00','#ffff00','#ee4444','#990000'];
				var pathArr = [];
				for(var i=0,len = this.path.length;i<len;i++){
					try{
						var p = new Polyline({
                            'path':path[i],
                            "map": _m,
                            "strokeOpacity":0.5,
                            "disableLabel": true,
                            "strokeColor": colorArr[this.links[0].level-1],
                            "strokeWeight":"3px",
                            "dashstyle":"Solid"
                        });
                        pathArr.push(p1);
                        console.log(pathArr);
					}catch (ex){
                        continue;
                    }
				}
				//console.log(this.rous);
				//console.log(this.links);
				//console.log(this.points);
				//var path =

				// var path1 = this.points[0];
				// var flightPlanCoordinates = [
			 //        new sogou.maps.LatLng(39.992792,116.326142),
			 //        new sogou.maps.Point(12949589,4835996),
			 //        new sogou.maps.LatLng(39.986017,116.31049)
			 //    ];
		    // var flightPath = new sogou.maps.Polyline({
		    //   path: flightPlanCoordinates,
		    //   strokeColor: "#FF0000",
		    //   strokeOpacity: 1.0,
		    //   strokeWeight: 5
		    // });

		   //flightPath.setMap(map);

			},
			//基本逻辑
			//获取数据
			//处理数据 ： 根据routes 和 points 获取path
			//划线
		},
		ready(){
			//console.log(this.rous);
			this.init();
			$links = this.links;
			$points = this.points;
			//console.log($links);
			this.dealPoints();
		}
	}
</script>
<style>
	#map_canvas{
		width:1000px;
		height: 600px;
	}
</style>