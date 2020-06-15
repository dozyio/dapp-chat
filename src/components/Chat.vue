<template>
    <div>
        <div class="container">
            <div class="connectionDetails">
                <div class="level is-mobile">
                    <StatBox heading="Connected" :content="peerCount" footer="Peer" v-on:click.native="toggleShowPeers" />
                    <StatBox heading="WebSocket" :content="webSocketPeerCount" footer="Super Peer" v-on:click.native="toggleShowPeers" />
                    <StatBox heading="WebRTC" :content="webRTCPeerCount" footer="Peer" v-on:click.native="toggleShowPeers" />
                    <StatBox heading="Message" :content="messageCount" footer="Count" notplural v-on:click.native="toggleShowPeers" />
                </div>
                <div v-if="peerCount">
                    <PeerList v-if="showPeers" :peers="peers" />
                </div>
                <div v-else class="notification is-danger">
                    Disconnected
                </div>
            </div>
        </div>
        <div class="container chat" id="chat">
            <div class="box messages-box">
                <div v-for="(msg, name) in messages" :key="msg.name">
                    <div class="box chatmessages" v-if="msg" :id="name">
                        <div class="columns">
                            <div v-if="msg.user" class="column is-narrow message-user" :style="{backgroundColor: stringToColor(msg.user)}">
                                {{ msg.user }}
                            </div>
                            <div class="column">
                                {{ msg.msg }}
                            </div>
                            <div class="column is-narrow timestamp-column">
                                <Timestamp class="timestamp" :forceUpdate="incrementor" :time="msg.when" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="container">
            <div class="form">
                <div class="columns is-gapless">
                    <div class="column is-narrow">
                        <input class="input is-medium username" v-model="user" :style="{backgroundColor: stringToColor(user)}" style="color: white">
                    </div>
                    <div class="column">
                        <input class="input is-medium" v-model="newMessage" placeholder="say hello..." v-on:keyup.enter="send" />
                    </div>
                    <div class="column is-narrow">
                        <div class="button is-success is-medium" :class="[{ 'is-loading': sending }]" v-on:click="send">{{ sendButtonText }}</div>
                    </div>
                </div>
            </div>
            <div v-if="error" class="notification is-warning sendingError"><span v-if="!error.includes('Error: ',0)">Error: </span>{{ error }}</div>
        </div>
        <div class="chatroom"><span class="chatroom-label-chat">Chat</span>room {{chatroom}}</div>
    </div>
</template>

<script>
import Timestamp from '@/components/Timestamp'
import PeerList from '@/components/PeerList'
import StatBox from '@/components/StatBox'
import Gun from 'gun/gun'
import {animals} from '@/misc/animals'
import {adjectives} from '@/misc/adjectives'

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
            devprod: process.env.NODE_ENV === 'development' ? 'dev' : 'p',
            chatroom: location.hash.slice(1) || 1,
            peers: {},
            user: '',
            showPeers: false,
            incrementor: 1
        }
    },
    computed: {
        rootNode: function(){
            return this.root+'/'+this.devprod+'/'+this.chatroom
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
            console.log('sending')
            if(this.newMessage.trim() == ''){
                console.log('empty trim send failed')
                return
            }
            let msgId = this.generateId(20)
            if(this.user == ''){
                this.user = this.generateUsername()
            }
            //this.$options.gun.get(msgId).put(this.newMessage)// XXX WORKING WITH WEBRTC XXX

            if(this.webSocketPeerCount){
                console.log('websocket send')
                this.$options.gun.get(msgId).put(JSON.stringify({user: this.user, msg: this.newMessage, when: Gun.state()}), this.sendCallback)
                this.sending = true
            } else {
                console.log('webrtc send')
                //no callback if no websocket connection
                this.$options.gun.get(msgId).put(JSON.stringify({user: this.user, msg: this.newMessage, when: Gun.state()}))
                this.newMessage = ""
            }
        },
        sendCallback(ack){
            console.log(ack)
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
            //todo
            console.log(peer)
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
        //processGunUpdate(value, key, x, y){
        processGunUpdate(value, key){
            console.log('got update', value, key)
            if(value){
                this.$set(this.messages, key, JSON.parse(value))
                this.scrollToMessage(key)
            }
        },
        getSoul(data){
            if(Gun.node.is(data)){
                return(Gun.node.soul(data))
            }
            return false
        },
        getTimestamp(json){
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
        toggleShowPeers(){
            this.showPeers = this.showPeers ? false : true
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
        scrollToMessage(id){
            this.$nextTick(() => {
                let element = document.getElementById(id)
                if(element){
                    element.scrollIntoView({behavious: "smooth", block: "end", inline: "nearest"})
                }
            })
        },
        generateUsername(){
            let animal = animals[Math.floor(Math.random() * animals.length)]
            animal = animal.charAt(0).toUpperCase() + animal.slice(1)
            let adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
            adjective = adjective.charAt(0).toUpperCase() + adjective.slice(1)
            return adjective+" "+animal
        }
    },
    mounted: function(){
        this.$options.gun = this.$gun.get(this.rootNode)
        console.log(this.$options.gun)
        this.$gun.on('hi', (peer) => {
            console.log('hi', peer)
            this.connectionDetails()
        })
        this.$gun.on('bye', (peer) => {
            console.log('bye', peer)
            this.connectionDetails()
        })

        if(localStorage.user){
            this.user = localStorage.user
        } else {
            this.user = this.generateUsername()
        }
        this.getGunUpdates()
        this.connectionDetails()
        setInterval(() => {
            this.connectionDetails()
        }, 2500)
        setInterval(() => {
            this.incrementor += 1
        }, 30000)
    },
    created: function(){
    },
    watch: {
        user(newName){
            localStorage.user = newName
        },
    }

}
</script>

<style scoped>
.timestamp {
    font-size: 0.666rem;
}
.chatmessages {
    text-align: left;
    margin-bottom: 2px;
}
.chat {
    max-height: 70vh;
    overflow-y: overlay;
    margin: 1.25rem auto;
}
@media screen and (max-width: 768px){
    .chat {
        max-height: 45vh;
        overflow-y: scroll;
        margin: 1.25rem auto;
    }
}
.messages-box {
    background-color: transparent;
    padding: 0 1.25rem 0 0;
}
.input {
    border-color: transparent;
    border-radius: 0;
}
.username {
    border-radius: 4px 0 0 4px;
    text-align: center;
    padding-left: 0.75em;
    padding-right: 0.75em;
}
@media screen and (max-width: 768px){
    .username {
        width: 100%;
        border-radius: 4px 4px 0 0 ;
    }
}
.button {
    border-radius: 0 4px 4px 0;
}
@media screen and (max-width: 768px){
    .button {
        border-radius: 0 0 4px 4px;
        padding-left: 2em;
        padding-right: 2em;
        width: 100%;
    }
}
@media screen and (max-width: 768px){
    .input {
        text-align: center;
    }
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
.sending-error {
    margin-top: 2px;
}
.message-user {
    min-width: 6em;
    text-align: center;
    color: #fff;
}
@media screen and (max-width: 768px){
    .message-user {
        text-align: left;
        padding: 0 0.75rem;
    }
}
.timestamp-column {
    border-left: 1px dashed lightgrey;
}
@media screen and (max-width: 768px){
    .timestamp-column {
        border-left: none;
        border-top: 1px dashed lightgrey;
        text-align: right;
        padding: 0 0.75rem;
    }
}
.chatroom {
    position: fixed;
    top: 0;
    right: 0;
    border-left: 1px dashed lightgrey;
    border-bottom: 1px dashed lightgrey;
    color: #fff;
    padding: 0.5rem;
}
@media screen and (max-width: 768px){
    .chatroom {
        padding:0 0.15rem;
        text-transform:capitalize;
    }
    .chatroom-label-chat {
        display: none;
    }
}
</style>
