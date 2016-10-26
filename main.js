var page = require('webpage').create();

WidgetIdentification = {
    findAll: function () {
        function position(element) {
            if (element.parentElement == null)
                return { left: element.offsetLeft, top: element.offsetTop };
            var parent_element = position(element.parentElement);
            return {
                left: (element.offsetLeft + parent_element.left),
                top: (element.offsetTop + parent_element.top)
            };
        }

        var all_elements = document.querySelectorAll('*'),
            result = [];
        for (var i = 0; i < all_elements.length; i++) {
            result[i] = position(all_elements[i]);
        };
        return result;
    }
};

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
    var elements_position = page.evaluate(WidgetIdentification.findAll),
        chain = CommandChain(page),
        previous_hovered = null;

    for (var i = (elements_position.length - 1); i >= 0; i--) {
        if (previous_hovered === null ||
                (previous_hovered.top !== elements_position[i].top &&
                 previous_hovered.left !== elements_position[i].left)) {
            previous_hovered = elements_position[i];
            (function () {
                var index = i;
                chain.add(function () {
                    page.render("data/" + index + ".first.png");
                    page.sendEvent('mousemove', elements_position[index].left + 1, elements_position[index].top + 1);
                }, this, 1);
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
