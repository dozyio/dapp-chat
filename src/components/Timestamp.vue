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
        },
        forceUpdate: {
            type: Number,
            default() {
                return 0;
            }
        },
    },
    computed: {
        timestamp(){
            if(this.time) {
                //return moment.utc(this.time).local().format('MMMM Do YYYY, h:mm:ss a')
                //increase the milliseconds to force refresh
                return moment.utc(parseInt(this.time+this.forceUpdate)).local().fromNow()
            } else {
                return ''
            }
        }
    }
}
</script>
