<template>
    <el-dialog
        title="关于Editor"
        class="about__dialog"
        :visible="value"
        @close="$emit('input', false)"
        width="50%"
        center
    >
        <div style="text-align: center">
            <h3>简洁的 Markdown 转 Wechat 编辑器</h3>
        </div>
        <div style="text-align: center; margin-top: 10px">
            <p>扫码关注我的公众号，精选文章第一时间推送！</p>
            <img
                src="https://raw.githubusercontent.com/saucxs/full_stack_knowledge_list/master/image/songbao.png?raw=true"
                style="width: 80%; display: block; margin: 20px auto 10px"
            />
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button
                type="primary"
                @click="onRedirect('https://github.com/saucxs')"
                plain
                >GitHub</el-button
            >
        </span>
    </el-dialog>
</template>

<script>
export default {
    props: {
        value: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        onRedirect(url) {
            window.open(url);
        },
    },
};
</script>

<style lang="less" scoped>
/deep/ .el-dialog {
    min-width: 420px;
}
</style>
