<template>
    <div v-if="webrtcCompatible" class="notification" :class="statusClass">
        {{ peer.id }} (WebRTC) - {{ peer.connectionState | capitalize }}
        <div>{{ JSON.stringify(peer) }}</div>
    </div>
</template>

<script>
export default {
    props: ['peer'],
    components: {
    },
    name: 'RTCPeer',
    data: function() {
        return {
            webrtcCompatible: window.RTCPeerConnection || false
        }
    },
    watch: {
    },
    computed: {
        statusClass: function() {
            if(window.RTCPeerConnection){
                if(this.peer.constructor.name == 'RTCPeerConnection'){
                    if(this.peer.connectionState == "connected"){
                            return "is-success"
                    } else if(this.peer.connectionState == "failed") {
                        return "is-danger"
                    } else if(this.peer.connectionState == "disconnected") {
                        return "is-info"
                    } else {
                        return "is-warning"
                    }
                }
            }
            return ''
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
