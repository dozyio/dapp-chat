<template>
    <div class="notification" :class="statusClass">
        {{ peer.id }} (WebRTC) - {{ peer.connectionState | capitalize }}
        <div>{{ JSON.stringify(peer) }}</div>
    </div>
</template>

<script>
export default {
    props: {
        peer: [RTCPeerConnection, Object]
    },
    components: {
    },
    name: 'RTCPeer',
    data: function() {
        return {
            status: ''
        }
    },
    watch: {
    },
    computed: {
        sdp: function(){
            if(this.peer.remoteSet !== undefined){
                return JSON.stringify(this.peer.remoteSet).replace(/\\r\\n/g,'<br>')
            } else if(this.peer.remoteDescription !== undefined){
                return JSON.stringify(this.peer.remoteDescription).replace(/\\r\\n/g,'<br>')
            }
            else {
                return ''
            }
        },
        statusClass: function() {
            if(this.peer.connectionState == "connected"){
                    return "is-success"
            } else if(this.peer.connectionState == "failed") {
                this.$emit('failedPeer', this.peer)
                return "is-danger"
            } else if(this.peer.connectionState == "disconnected") {
                this.$emit('failedPeer', this.peer)
                return "is-info"
            } else {
                return "is-warning"
            }
        }

    },
    filters: {
        capitalize: function(value){
            if(!value) return ''
            value = value.toString()
            return value.charAt(0).toUpperCase() + value.slice(1)
        }
    },
    mounted: function(){
        console.log("RTCPeer",this.peer)
    },
    created: function(){
    }

}
</script>

<style scoped>
</style>
