block('main').tag()('some_tag');
block('user')(
    tag()('div'),
    attrs()({'data-user': this.data}),
    elem('name')(
        tag()('h2')
    ),
    elem('money')(
        tag()('span'),
        content()(()=>'Money: ' + applyNext())
    ),
    elem('age')(
        tag()('span'),
        content()(()=>'Age: ' + applyNext() + ' ')
    )
)
block('hr').tag()('hr')
