<template>
    <div class="level-item has-text-centered">
        <div class="box">
            <div class="heading">{{heading}}</div>
            <div class="title">{{content}}</div>
            <div class="heading">{{footer}}<span v-if="content != 1 && !notplural">s</span></div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        heading: String,
        content: [String, Number],
        footer: String,
        notplural: {
            type: Boolean,
            default: false
        }
    },
    components: {
    },
    name: 'StatBox',
    data: function() {
        return {
        }
    },
    computed: {
    },
    mounted: function(){
    },
    created: function(){
    }

}
</script>

<style scoped>
.level-item .box {
    width: 8em;
}
@media screen and (max-width: 768px){
    .level-item .box {
        padding: 0.25rem;
        width: auto;
        min-width: 5em;
    }
}
</style>
