<template>
    <div class="chat">
        <Chats />
    </div>
</template>

<script>
import Chats from '@/components/Chat.vue'
export default {
    components: {
        Chats
    },
    data: function() {
        return {
            //gun: null,
        }
    },
    methods: {
    },
    mounted: function(){
        //this.gun = new Gun({ peers: ['https://i.dozy.io:8765/gun', 'https://mvp-gun.herokuapp.com/gun', 'https://e2eec.herokuapp.com/gun']});
        //this.gun = new Gun({ peers: ['https://mvp-gun.herokuapp.com/gun', 'https://e2eec.herokuapp.com/gun']});
    }

}
</script>
