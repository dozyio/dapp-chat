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

Vue.use(VueGun, {
    gun: new Gun(
        {peers: [
            'https://i.dozy.io:8765/gun',
        ]},
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
