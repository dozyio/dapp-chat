import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import './../node_modules/bulma/css/bulma.min.css';
import VueGun from 'vue-gun'
import Gun from 'gun/gun'

// eslint-disable-next-line no-unused-vars
//import nts from 'gun/nts'
// eslint-disable-next-line no-unused-vars
import Webrtc from 'gun/lib/webrtc'
// eslint-disable-next-line no-unused-vars
//import SEA from 'gun/sea'

Vue.config.productionTip = false

let peers = process.env.NODE_ENV === 'development' ? ['https://i.dozy.io:8765/gun'] : ['https://mvp-gun.herokuapp.com/gun', 'https://e2eec.herokuapp.com/gun']

Vue.use(VueGun, {
    gun: new Gun(
        {peers: peers},
        /*{rtc: 
            {'iceServers': [
                {urls: 'stun:stun.l.google.com:19302'},
                {urls: "stun:stun.sipgate.net:3478"},
                {urls: 'stun:stun.services.mozilla.com'}
            ]}
        }*/
    )
});

new Vue({
    router,
    store,
    VueGun,
    Gun,
    render: h => h(App)
}).$mount('#app')
