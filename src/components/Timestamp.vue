<template>
    <time v-if="timestamp">{{ timestamp }}</time>
</template>

<script>
import moment from 'moment';

export default {
    props: {
        time: {
            type: Number,
            default() {
                return {};
            }
        }
    },
    computed: {
        timestamp(){
            if(this.time) {
                //return moment.utc(this.time).fromNow()
                return moment.utc(this.time).format('MMMM Do YYYY, h:mm:ss a')
            } else {
                return ''
            }
        }
    }
}
</script>
