import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import './../node_modules/bulma/css/bulma.min.css';
import VueGun from 'vue-gun'
//import SEA from 'gun/sea'

Vue.config.productionTip = false

Vue.use(VueGun, {
    //peers: ['https://i.dozy.io:8765/gun']
    /*peers: [
        'https://i.dozy.io:8765/gun',
        'https://mvp-gun.herokuapp.com/gun',
        'https://e2eec.herokuapp.com/gun'
    ]*/
})

new Vue({
    router,
    store,
    VueGun,
    render: h => h(App)
}).$mount('#app')
