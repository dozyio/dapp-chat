<template>
    <div>
        <div class="container">
            <div class="connectionDetails">
                <div class="level is-mobile">
                    <StatBox heading="Connected" :content="peerCount" footer="Peer" />
                    <StatBox heading="WebSocket" :content="webSocketPeerCount" footer="Gun Server" />
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
        <div class="container chat" id="chat" style="max-height: 50vh; overflow-y: overlay; margin: 1.25rem auto; ">
            <div class="box" style="background-color: transparent; padding: 0 1.25rem 0 0">
                <div v-for="msg in messages" :key="msg.key">
                    {{ msg }}
                    <div class="box chatmessages" v-if="msg.msg" style="margin-bottom: 2px;" :id="getSoulNoSlash(msg)">
                        <div class="columns">
                            <div v-if="msg.user" class="column is-narrow" :style="{backgroundColor: stringToColor(msg.user)}">
                                <span style="color: white">{{ msg.user }}</span>
                            </div>
                            <div class="column">
                                {{ msg }}
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
                        <div class="button is-success is-medium" :class="[{ 'is-loading': sending }]" v-on:click="send">{{ sendButtonText }}</div>
                    </div>
                </div>
            </div>
            <div v-if="error" class="notification is-warning">Error: {{ error }}</div>
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
    gun: new Object,
    data: function() {
        return {
            //gun: null,
            messages: {},
            mesh: null,
            newMessage: "",
            sendButtonText: "Send",
            sending: false,
            error: "",
            root: 'dchat',
            chatroom: 2,
            peers: {},
            user: '',
        }
    },
    computed: {
        rootNode: function(){
            return this.root+'/'+this.chatroom
        },
        sortedMessages: function(){
            //todo
            return '';
        },
        messageCount: function(){
            return Object.keys(this.messages).length
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
            let msgId = this.generateId(20)
            //this.$options.gun.get(msgId).put({user: this.user, msg: this.newMessage})//, this.sendCallback)
            this.$options.gun.get(msgId).put(this.newMessage)//, this.sendCallback)
            //this.sending = true
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
        connectionDetails(){
            this.peers = Object.assign({}, this.$gun.back('opt.peers'))
        },
        getGunUpdates(){
            this.$options.gun.map().on(this.processGunUpdate, true)
        },
        processGunUpdate(msg, id){
            console.log('got update',id,msg)
            if(msg){
                this.$set(this.messages, id, msg)
            }
            this.scrollToMessage(this.getSoulNoSlash(msg))
        },
        getSoul(data){
            if(Gun.node.is(data)){
                return(Gun.node.soul(data))
            }
            return false
        },
        getSoulNoSlash(data){
            if(Gun.node.is(data)){
                return(Gun.node.soul(data).replace(/\//g,''))
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
        generateId(len){
            let arr = new Uint8Array((len || 40) / 2)
            window.crypto.getRandomValues(arr)
            return Array.from(arr, this.dec2hex).join('')
        },
        dec2hex(dec){
            return(dec.toString(16).padStart(2, '0'))
        },
        usernameWidth(){
            if(this.user.length < 4){
                return '5em'
            }
            return this.user.length+'em'
        },
        scrollToMessage(id){
            this.$nextTick(() => {
                let element = document.getElementById(id)
                if(element){
                    element.scrollIntoView({behavious: "smooth", block: "end", inline: "nearest"})
                }
            })
        },
    },
    mounted: function(){
        //mesh
        //this.mesh = this.$gun.back('opt.mesh')
        /*this.$gun.on('hear', function(msg, peer = null){
            console.log('hear msg', msg)
            console.log('hear msg peer', peer)
        })*/
        this.getGunUpdates()
        this.connectionDetails()
        setInterval(() => {
            this.connectionDetails()
        }, 2500)
    },
    created: function(){
        this.$options.gun = this.$gun.get(this.rootNode); //.once(this.processGunUpdate)
        console.log("options gun",this.$options.gun)
        console.log(this.$options.gun.constructor.name)
        console.log(JSON.stringify(this.$options.gun))

        this.$gun.on('hi', (peer) => {
            console.log('hi', peer)
            this.connectionDetails()
        })
        this.$gun.on('bye', (peer) => {
            console.log('bye', peer)
            this.connectionDetails()
        })
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
