<template>
    <div>
        <div class="notification" :class="statusClass">
            {{ peer.id }} (WebSocket) - {{ status }}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        peer: Object
    },
    components: {
    },
    name: 'WebSocketPeer',
    data: function() {
        return {
        }
    },
    computed: {
        status: function(){
            if(this.peer.wire !== undefined){
                if(this.peer.wire !== null){
                    return "Connected"
                } else {
                    return "Connecting"
                }
            }
            return "Disconnected"
        },
        statusClass: function() {
            if(this.peer.wire !== undefined){
                if(this.peer.wire !== null){
                    return "is-success"
                } else {
                    return "is-info"
                }
            }
            return "is-danger"
        }

    },
    mounted: function(){
        //console.log("Websocket peer",this.peer)
    },
    created: function(){
    }

}
</script>

<style scoped>
</style>
