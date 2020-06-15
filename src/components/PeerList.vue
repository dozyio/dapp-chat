<template>
    <div>
        <div v-for="peer in peers" :key="peer.key" class="peers">
            <div v-if="peer.constructor.name == 'RTCPeerConnection' && webrtcCompatible"><RTCPeer :peer="peer" /></div>
            <div v-else-if="peer.constructor.name == 'Object'"><WebSocketPeer :peer="peer" /></div>
        </div>
    </div>
</template>

<script>
import WebSocketPeer from '@/components/WebSocketPeer'
import RTCPeer from '@/components/RTCPeer'
export default {
    props: {
        peers: Object
    },
    components: {
        WebSocketPeer,
        RTCPeer
    },
    name: 'PeerList',
    data: function() {
        return {
            webrtcCompatible: window.RTCPeerConnection || false
        }
    },
    computed: {
    },
    methods: {
        failedPeer: function(peer){
            console.log('failed peer peerlist',peer)
            this.$emit("failedPeer",peer)
        }
    },
    mounted: function(){
    },
    created: function(){
    }

}
</script>

<style scoped>
.peers {
    margin-bottom: 2px;
}
</style>
