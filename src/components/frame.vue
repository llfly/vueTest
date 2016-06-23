<template>
	<iframe :src="src"></iframe>
</template>
<script>
	module.exports = {
		props:['src'],
		route: {
            data: function (transition) {
            	this.src = 'https://cn.bing.com/search?q=' + transition.to.path
            }
        }
	}
</script>
<style>
	
</style>