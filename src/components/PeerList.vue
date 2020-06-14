<template>
    <div>
        <div v-for="peer in peers" :key="peer.key" class="peers">
            <div v-if="peer.constructor.name == 'RTCPeerConnection'"><RTCPeer :peer="peer" v-on:failed-peer="onFailedPeer" /></div>
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
        }
    },
    computed: {
    },
    methods: {
        onFailedPeer: function(peerId){
            console.log('failed peer peerlist',peerId)
            this.$emit("failedPeer",peerId)
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
