var page = require('webpage').create(),
    fs = require('fs'),
    args = require('system').args,
    data_features = [],
    widget_cache = [];
page.settings.userAgent = 'Mozilla/5.0 (X11; Linux x86_64; rv:49.0) Gecko/20100101 Firefox/49.0';
page.viewportSize = { width: 1200, height: 600 };

if (args.length < 2) {
    console.log('you should input an URL as well...');
    phantom.exit();
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
                        console.log('Command chain: running command ' + index);
                        commands[index].f.apply(commands[index].context, []);
                    }, total_time);
                }());
            };
        }
    };
};

page.open(args[1], function () {
    page.injectJs('visibility.js');
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
                }, this, 500);
                chain.add(function () {
                    page.render("data/" + index + ".first.png");
                    page.sendEvent('mousemove', (elements_position[index].left + (elements_position[index].width / 2)),
                                                (elements_position[index].top + (elements_position[index].height / 2)));
                }, this, 500);
                chain.add(function () {
                    var changes = page.evaluate(function () {
                            return window.WindowController.check_visibility_changes();
                        }),
                        mutations = page.evaluate(function () {
                            return window.WindowController.check_mutation_changes();
                        });
                    if (changes.length === 0 && mutations.length === 0) {
                        fs.remove("data/" + index + ".first.png");
                    } else {
                        var output = '',
                            i, row;
                        for (i = 0; i < changes.length; i++) {
                            if (widget_cache.indexOf(changes[i].html) === -1) {
                                output += changes[i].html + '**' + i + '\n';
                                row = changes[i];
                                row.activator = elements_position[index];
                                row.activatorId = index;
                                row.changeId = i;
                                data_features.push(row);
                                widget_cache.push(changes[i].html);
                            }
                        };
                        for (i = 0; i < mutations.length; i++) {
                            if (widget_cache.indexOf(mutations[i].html) === -1) {
                                output += mutations[i].html + '**' + (changes.length + i) + '-mut\n';
                                row = mutations[i];
                                row.activator = elements_position[index];
                                row.activatorId = index;
                                row.changeId = (changes.length + i) + '-mut';
                                data_features.push(row);
                                widget_cache.push(mutations[i].html);
                            }
                        };
                        if (output.length === 0) {
                            fs.remove('data/' + index + '.first.png');
                            return ;
                        }
                        fs.write('data/' + index + '.activator.txt', elements_position[index].html, 'w');
                        fs.write('data/' + index + '.widgets.txt', output, 'w');
                        page.render("data/" + index + ".second.png");
                    }
                }, this, 1000);
            }());
        }
    };
    chain.add(function () {
        var csv = 'activator-id,mutation-id,displayed,height,width,top,left,activatorTop,activatorLeft,distanceTop,distanceLeft,distance,numberElements,elements/size,numberWords,textNodes,Words/TextNodes,table,list,input,widgetName,date,img,proportionNumbers,links80percent,Result\n',
            row, serial, distanceTop, distanceLeft, distance;
        for (var i = 0; i < data_features.length; i++) {
            row = data_features[i];
            serial = [];
            serial.push(row.activatorId);
            serial.push(row.changeId);
            serial.push(row.visible);
            serial.push(row.height);
            serial.push(row.width);
            serial.push(row.top);
            serial.push(row.left);
            serial.push(row.activator.top);
            serial.push(row.activator.left);
            distanceTop = Math.abs(row.top - row.activator.top);
            serial.push(distanceTop);
            distanceLeft = Math.abs(row.left - row.activator.left);
            serial.push(distanceLeft);
            distance = Math.abs(distanceTop - distanceLeft) - Math.max(distanceTop, distanceLeft);
            serial.push(distance);
            serial.push(row.numberOfElements);
            serial.push(row.numberOfElements / (row.height * row.width));
            serial.push(row.numberOfWords);
            serial.push(row.numberTextNodes);
            if (row.numberTextNodes === 0)
                serial.push(0);
            else
                serial.push(row.numberOfWords / row.numberTextNodes);
            serial.push(row.presenceTable);
            serial.push(row.presenceUl);
            serial.push(row.presenceInput);
            serial.push(row.presenceWidgetName);
            serial.push(row.presenceDate);
            serial.push(row.presenceImg);
            serial.push(row.proportionNumberTextNodes);
            serial.push(row.percentLinks);
            csv += serial.join(',') + '\n';
        };
        fs.write('data/results.csv', csv, 'w');

        phantom.exit();
    }, this, 1);
    chain.run();
});
