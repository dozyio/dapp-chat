<template>
    <div>
        <div class="container">
            <div class="connectionDetails">
                <div class="level is-mobile">
                    <StatBox heading="Connected" :content="peerCount" footer="Peer" />
                    <StatBox heading="WebSocket" :content="webSocketPeerCount" footer="Server" />
                    <StatBox heading="WebRTC" :content="webRTCPeerCount" footer="Peer" />
                    <StatBox heading="Message" :content="messageCount" footer="Count" notplural />
                </div>
                <div v-if="peerCount">
                    <PeerList :peers="peers" />
                </div>
                <div v-else class="notification is-danger">
                    Disconnected
                </div>
            </div>
        </div>
        <div class="container chats" id="chats" style="max-height: 70vh; overflow-y: overlay; margin: 1.25rem auto; ">
            <div class="box" style="background-color: transparent; padding: 0 1.25rem 0 0">
                <div v-for="msg in chats" :key="msg.key">
                    <div class="box chatmessages" v-if="msg.msg" style="margin-bottom: 2px;">
                        <div class="columns">
                            <div v-if="msg.user" class="column is-narrow" :style="{backgroundColor: stringToColor(msg.user)}">
                                <span style="color: white">{{ msg.user }}</span>
                            </div>
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
        </div>
        <footer class="container">
            <div class="form">
                <div class="columns is-gapless">
                    <div class="column is-narrow">
                        <input class="input is-medium username" v-model="user" :style="{backgroundColor: stringToColor(user), width: usernameWidth()}" style="color: white">
                    </div>
                    <div class="column">
                        <input class="input is-medium" v-model="newMessage" placeholder="hello..." v-on:keyup.enter="send" />
                    </div>
                    <div class="column is-narrow">
                        <div class="button is-primary is-medium" :class="[{ 'is-loading': sending }]" v-on:click="send">{{ sendButtonText }}</div>
                    </div>
                </div>
            </div>
            <div v-if="error">Error: {{ error }}</div>
        </footer>
    </div>
</template>

<script>
import Timestamp from '@/components/Timestamp'
import PeerList from '@/components/PeerList'
import StatBox from '@/components/StatBox'
import Gun from 'gun/gun'

export default {
    components: {
        Timestamp,
        PeerList,
        StatBox
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
            root: 'dchat',
            chatroom: 1,
            peers: {},
            user: '',
        }
    },
    computed: {
        messageCount: function(){
            return Object.keys(this.chats).length
        },
        peerCount: function(){
            return Object.keys(this.peers).length
        },
        webSocketPeerCount: function() {
            let c = 0;
            // eslint-disable-next-line no-unused-vars
            for(const[key,value] of Object.entries(this.peers)){
                if(value.wire !== undefined && value.wire !== null){
                    if(value.wire.constructor.name == "WebSocket"){
                        c++
                    }
                }
            }
            return c
        },
        webRTCPeerCount: function() {
            let c = 0;
            // eslint-disable-next-line no-unused-vars
            for(const[key,value] of Object.entries(this.peers)){
                if(value.wire !== undefined && value.wire !== null){
                    if(value.wire.constructor.name == "RTCDataChannel"){
                        c++
                    }
                }
            }
            return c
        }
    },
    methods: {
        send(){
            let msgId = this.generateId()
            this.$gun.get(this.root+'/'+this.chatroom).get(msgId).put({user: this.user, msg: this.newMessage}, this.sendCallback)
            this.sending = true
            this.newMessage = ""
        },
        closeConnection(peer){
            console.log(peer)
            //this.$gun.on('bye', peer)
            //this.$gun.opt({peers: []})
            //Gun({peers: []})
            //return

            let newPeerList = []
            let connections = new Set()
            let peers = []
            // eslint-disable-next-line no-unused-vars
            for(const[key,value] of Object.entries(this.$gun.back('opt.peers'))){
                console.log(key)
                console.log(value)
                connections.add(value)

            }
            peers = [...connections]
            for(let i = 0; i < peers.length; i++){
                if(peers[i].url != peer.url){
                    newPeerList.push(peers[i])
                }
            }
            console.log("closing peer",peer)
            console.log("peers", peers)
            console.log("newpeers", newPeerList)
            this.$gun.back('opt.peers')[peer.url].wire.close()
            //this.$gun.on('bye', peer)
            this.$gun.opt({peers: []})
            this.$gun.opt({peers: newPeerList})
            //this.peers = newPeerList
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
            /*
            let connections = new Set()
            // eslint-disable-next-line no-unused-vars
            for(const [key, value] of Object.entries(this.$gun.back('opt.peers'))){
                //console.log(value)
                let json = JSON.parse(JSON.stringify(value))
                if(value.wire !== undefined){
                    connections.add({url: value.url, type: value.wire.constructor.name, details: json})
                }
                else {
                    connections.add({url: value.url, type: 'unknown type, unknown status', details: json})
                }
            }*/
            this.peers = Object.assign({}, this.$gun.back('opt.peers'))
            //this.peers = this.$gun.back('opt.peers')//[...connections]
            //console.log(this.peers)
        },
        getGunUpdates(){
            this.$gun.get(this.root+'/'+this.chatroom).on(this.processGunUpdate, { change: true })
        },
        processGunUpdate(){
            let unsorted = []
            this.$gun.get(this.root+'/'+this.chatroom).map().on((node, key) => {
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
            this.scrollBottom()
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
        },
        stringToColor(str){
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            let colour = '#';
            for (let i = 0; i < 3; i++) {
                let value = (hash >> (i * 8)) & 0xFF;
                colour += ('00' + value.toString(16)).substr(-2);
            }
            return colour;
        },
        usernameWidth(){
            if(this.user.length < 4){
                return '5em'
            }
            return this.user.length+'em'
        },
        generateId(len){
            let arr = new Uint8Array((len || 40) / 2)
            window.crypto.getRandomValues(arr)
            return Array.from(arr, this.dec2hex).join('')
        },
        dec2hex(dec){
            return(dec.toString(16).padStart(2, '0'))
        },
        scrollBottom(){
            let chatDiv = document.getElementById("chats");
            if(chatDiv){
                chatDiv.scrollTop = chatDiv.scrollHeight;
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
        this.$gun.on('hear', function(msg, peer = null){
            console.log('hear msg', msg)
            console.log('hear msg peer', peer)
        })
        this.$gun.get(this.root+'/'+this.chatroom).once(this.processGunUpdate)
        this.getGunUpdates()
        this.connectionDetails()
        setInterval(() => {
            this.connectionDetails()
        }, 2500)
        this.scrollBottom()
    },
    created: function(){
        this.user = 'user'+Math.floor(1000 + Math.random() * 9000);
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
.input {
    border-color: transparent;
    border-radius: 0;
}
.username {
    border-radius: 4px 0 0 4px;
}
.button {
    border-radius: 0 4px 4px 0;
}
.level .level-item .box {
    width: 8em;
}
@media screen and (max-width: 768px){
    .level .level-item .box {
        padding: 0.25rem;
        width: auto;
        min-width: 5em;
    }

}
</style>
