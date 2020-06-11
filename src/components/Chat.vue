<template>
    <div>
        <div class="container">
            <div class="connectionDetails">
                <div v-if="peers.length">
                    <div v-for="peer in peers" :key="peer.key" class="notification is-success">
                        Connected to {{ peer.url }} ({{ peer.type }})
                    </div>
                </div>
                <div v-else class="notification is-danger">
                    Disconnected
                </div>
            </div>
        </div>
        <div class="container chats">
            <div v-for="msg in chats" :key="msg.x">
                <div class="box chatmessages" v-if="msg.msg">
                    <div class="columns">
                        <div class="column">
                            {{ msg.msg }}
                        </div>
                        <div class="column is-narrow" style="border-left: 1px dashed lightgrey">
                            <Timestamp class="timestamp" :time="getTimestamp(msg)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <footer class="container">
            <div class="form">
                <div class="field has-addons has-addons-fullwidth">
                    <div class="control">
                        <input class="input is-medium" v-model="newMessage" placeholder="hello..." v-on:keyup.enter="send" />
                    </div>
                    <div class="button is-primary is-medium" :class="[{ 'is-loading': sending }]" v-on:click="send">{{ sendButtonText }}</div>
                </div>
            </div>
            <div v-if="error">Error: {{ error }}</div>
        </footer>
    </div>
</template>

<script>
import Timestamp from '@/components/Timestamp'
import Gun from 'gun/gun'
/*
import WebRTC from 'gun/lib/webrtc'
console.log(WebRTC)
*/
export default {
    components: {
        Timestamp
    },
    name: 'Chats',
    data: function() {
        return {
            chats: {},
            staticPeers: ['https://i.dozy.io:8765/gun'],
                //'https://mvp-gun.herokuapp.com/gun',
                //'https://e2eec.herokuapp.com/gun'
            newMessage: "",
            sendButtonText: "Send",
            sending: false,
            error: "",
            chatroom: 1,
            peers: []
        }
    },
    methods: {
        send(){
            this.$gun.get('chatrooms').get(this.chatroom).get('chats').set({msg: this.newMessage}, this.sendCallback)
            this.sending = true
            this.newMessage = ""
            this.getGunUpdates()
        },
        sendCallback(ack){
            if(ack.ok == 1){
                this.newMessage = ""
                this.sending = false
            }
            if(!ack.ok){
                console.log(ack)
                if(ack.err == undefined){
                    this.error = "Couldn't send message"
                } else {
                    this.error = ack.err
                }
                this.sending = true
            }
        },
        isStaticPeer(peer){
            if(this.staticPeers.indexOf(peer) > -1){
                return true
            }
            return false
        },
        connectionDetails(){
            //console.log(this.$gun.back('opt.peers'))
            let connections = new Set()
            // eslint-disable-next-line no-unused-vars
            for(const [key, value] of Object.entries(this.$gun.back('opt.peers'))){
                connections.add({url: value.url, type: value.wire.constructor.name})
            }
            this.peers = [...connections]
        },
        getGunUpdates(){
            this.$gun.get('chatrooms').get(this.chatroom).get('chats').on(this.processGunUpdate, { change: true })
        },
        processGunUpdate(){
            this.$gun.get('chatrooms').get(this.chatroom).get('chats').map().on((node, key) => {
                this.$set(this.chats, key, node)
            })
        },
        getTimestamp(json){
            //check if node is a Gun data node
            // eslint-disable-next-line
            if(Gun.node.is(json)){
                let data = JSON.parse(JSON.stringify(json))
                let timestamp = data["_"][">"].msg
                if(isNaN(timestamp)){
                    return 0
                } else {
                    return timestamp
                }
            } else {
                return 0
            }
        }
    },
    mounted: function(){
        this.$gun.opt(this.staticPeers)
        this.$gun.get('chatrooms').get(this.chatroom).get('chats').once(this.processGunUpdate)
        this.getGunUpdates()
        setInterval(() => {
            this.connectionDetails()
        }, 2500)
        this.connectionDetails()
    },
    created: function(){
    }

}
</script>

<style scoped>
.timestamp {
    font-size: 0.666rem;
}
.chatmessages {
    text-align: left;
}
</style>
