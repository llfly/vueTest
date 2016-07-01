<template>
	<div>
		<ul>
			<li v-for="item in viewArr" track-by="$index">{{item.name}}</li>
		</ul>
	</div>
</template>
<script>
var arr =[{name:1},{name:2}];
setTimeout(function(){
	arr.push({name:4});
},2000);
	module.exports = {
		data(){
			return {
				viewArr : arr
			}
		},
		ready(){
			arr.push({name:3});
		}
	}
</script>