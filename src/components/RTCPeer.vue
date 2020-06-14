<template>
    <div class="notification" :class="statusClass">
        {{ peer.id }} (WebRTC) - {{ peer.connectionState | capitalize }}
        <div>{{ JSON.stringify(peer) }}</div>
        <!-- <div v-if="peer.remoteDescription.sdp">
            {{ peer.remoteDescription.sdp }}
        </div> -->
        <!-- {{ JSON.stringify(peer) }} -->
        <!-- <div v-html="sdp"></div> -->
    </div>
</template>

<script>
export default {
    props: {
        peer: RTCPeerConnection
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
        status: function(to, from){
            console.log(from)
            if(to =='failed'){
                console.log("failed")
            }
        }
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
                return "is-danger"
            } else {
                return "is-info"
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
        console.log(JSON.stringify(this.peer))
        console.log("RTCPeer",this.peer)
    },
    created: function(){
    }

}
</script>

<style scoped>
</style>
