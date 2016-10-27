var page = require('webpage').create();
page.settings.userAgent = 'Mozilla/5.0 (X11; Linux x86_64; rv:49.0) Gecko/20100101 Firefox/49.0';
page.viewportSize = { width: 1200, height: 600 };

var CommandChain = function (page) {
    var commands = [];
    return {
        add: function (f, context, time) {
            commands.push({
                f: f,
                context: context,
                time: time
            });
        },
        run: function () {
            var total_time = 0;
            for (var i = 0; i < commands.length; i++) {
                total_time += commands[i].time;
                (function () {
                    var index = i;
                    setTimeout(function () {
                        commands[index].f.apply(commands[index].context, []);
                    }, total_time);
                }());
            };
        }
    };
};

page.open('file:///home/willian/workspace/aria-check-menus/fixture/sanity_check01.html', function () {
    page.injectJs('vissense.js');
    page.injectJs('window-controller.js');

    var elements_position = page.evaluate(function () {
            return window.WindowController.get_visible_elements();
        }),
        chain = CommandChain(page);

    for (var i = 0; i < elements_position.length; i++) {
        if (elements_position[i].height < 100 && elements_position[i].width < 300) {
            (function () {
                var index = i;
                chain.add(function () {
                    page.sendEvent('mousemove', 0, 0);
                }, this, 0);
                chain.add(function () {
                    page.render("data/" + index + ".first.png");
                    page.sendEvent('mousemove', (elements_position[index].left + (elements_position[index].width / 2)),
                                                (elements_position[index].top + (elements_position[index].height / 2)));
                }, this, 300);
                chain.add(function () {
                    page.render("data/" + index + ".second.png");
                }, this, 500);
            }());
        }
    };
    chain.add(function () {
        phantom.exit();
    }, this, 1);
    chain.run();
});
