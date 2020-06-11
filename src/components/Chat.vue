<template>
    <div>
        <div class="container">
            {{ mesh }}
            <div class="connectionDetails">
                <div v-if="peers.length">
                    <div v-for="peer in peers" :key="peer.key" class="notification is-success">
                        Connected to {{ peer.url }} ({{ peer.type }}) <div class="button is-small" v-on:click="closeConnection(peer)" v-if="peers.length > 1 && peer.type == 'WebSocket'">Close WebSocket</div>
                        <div>{{ JSON.parse(JSON.stringify(peer.details)) }}</div>
                    </div>
                </div>
                <div v-else class="notification is-danger">
                    Disconnected
                </div>
            </div>
        </div>
        <div class="container chats">
            <div v-for="msg in chats" :key="getSoul(msg)">
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
                <!-- <div class="field has-addons has-addons-fullwidth">
                    <div class="control">
                        <input class="input is-medium" v-model="peerMessage" placeholder="hello..." v-on:keyup.enter="peerSend" />
                    </div>
                    <div class="button is-primary is-medium" :class="[{ 'is-loading': peerSending }]" v-on:click="peerSend">{{ peerSendButtonText }}</div>
                </div> -->
            </div>
            <div v-if="error">Error: {{ error }}</div>
        </footer>
    </div>
</template>

<script>
import Timestamp from '@/components/Timestamp'
import Gun from 'gun/gun'
//import VueGun from 'vue-gun';
//import Webrtc from 'gun/lib/webrtc'
// eslint-disable-next-line no-unused-vars
//import Webrtc from 'gun/lib/webrtc'

//this.use(VueGun, {
//    gun: new Gun() // your gun instance
//});
//console.log(Webrtc)

export default {
    components: {
        Timestamp
    },
    name: 'Chats',
    data: function() {
        return {
            gun: null,
            chats: {},
            mesh: null,
            newMessage: "",
            peerMessage: "",
            sendButtonText: "Send",
            peerSendButtonText: "Send To Peers",
            sending: false,
            peerSending: false,
            error: "",
            chatroom: 1,
            peers: []
        }
    },
    computed: {
        peerCount(){
            return this.peers.length
        }
    },
    methods: {
        send(){
            this.$gun.get('chatrooms').get(this.chatroom).get('chats').set({msg: this.newMessage}, this.sendCallback)
            this.sending = true
            this.newMessage = ""
            this.getGunUpdates()
        },
        peerSend(){
            //console.log(this.mesh)
            //console.log(this.mesh.send())
            //this.mesh.say({msg: this.peerMessage}, this.sendCallback)
            this.$gun.get('chatrooms').get(this.chatroom).get('chats').set({msg: this.newMessage}, this.sendCallback)
            this.peerSending = true
            this.peerMessage = ""
            //this.getGunUpdates()
        },
        closeConnection(peer){
            console.log(peer)
            this.$gun.back('opt.peers')[peer.url].wire.close()
        },
        sendCallback(ack){
            if(ack.ok == 1){
                this.newMessage = ""
                this.sending = false
            }
            if(!ack.ok){
                console.log("failed ack")
                console.log(ack)
                if(ack.err == undefined){
                    this.error = "Couldn't send message"
                } else {
                    this.error = ack.err
                }
                this.sending = true
            }
        },
        connectionDetails(){
            let connections = new Set()
            // eslint-disable-next-line no-unused-vars
            for(const [key, value] of Object.entries(this.$gun.back('opt.peers'))){
                if(value.wire !== undefined){
                    connections.add({url: value.url, type: value.wire.constructor.name, details: value})
                }
                else {
                    connections.add({url: value.url, type: 'unknown type, unknown status', details: value})
                }
            }
            this.peers = [...connections]
        },
        getGunUpdates(){
            this.$gun.get('chatrooms').get(this.chatroom).get('chats').on(this.processGunUpdate, { change: true })
        },
        processGunUpdate(){
            let unsorted = []
            this.$gun.get('chatrooms').get(this.chatroom).get('chats').map().on((node, key) => {
                //this.$set(this.chats, key, node)
                unsorted[key] = node;
            })
            unsorted.sort(function(a, b){
                a = this.getTimestamp(a)
                b = this.getTimestamp(b)
                if(a > b) {
                    return 1
                } else if(a < b){
                    return -1
                }
                return 0
            })
            for(const key in unsorted){
                this.$set(this.chats, key, unsorted[key])
            }
        },
        getSoul(data){
            if(Gun.node.is(data)){
                return(Gun.node.soul(data))
            }
            return false
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
        //this.mesh = this.$gun.back('opt.mesh')
        this.$gun.on('hi', (peer) => {
            console.log('hi', peer)
            this.connectionDetails()
        })
        this.$gun.on('bye', (peer) => {
            console.log('bye', peer)
            this.connectionDetails()
        })
        this.$gun.on('hear', function(msg, peer){
            console.log('msg', msg)
            console.log('msg peer', peer)
        })
        this.$gun.get('chatrooms').get(this.chatroom).get('chats').once(this.processGunUpdate)
        this.getGunUpdates()
        /*setInterval(() => {
            this.connectionDetails()
        }, 2500)*/
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
