
block('root').replace()(function() {
    var ret = { block: 'page' };
    if (typeof this.ctx.page.map === 'function') {
        ret.content = this.ctx.page.map(user => {
            return {
                block: 'user',
                data: user
            }
        })
    } else {
        ret.content = {
            block: 'user',
            data: this.ctx.page
        }
    }
    return ret;
})

block('user').content()(function() {
    return [
        {
            elem: 'name',
            content: this.ctx.data.user
        },
        {
            elem: 'age',
            content: this.ctx.data.age
        },
        {
            elem: 'money',
            content: this.ctx.data.money
        },
        {
            block: 'hr'
        }
    ]
})
