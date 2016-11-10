(function () {
    window.WindowController = (function () {
        var visible_elements = [],
            invisible_elements = [],
            added_elements = [],
            all_elements = null;

        function _meta_data(element) {
            var result = _position(element);
            result.html = element.outerHTML;
            result.visible = _is_visible(element);
            result.numberOfElements = _number_of_elements(element);
            result.numberOfWords = _number_of_words(element);

            /* Related work */
            result.presenceTable = _presence_of_element(element, 'table');
            result.presenceUl = _presence_of_element(element, 'ul');
            result.presenceInput = _presence_of_element(element, 'input');
            result.presenceWidgetName = _menu_name(element);
            result.presenceDate = _date(element);
            result.presenceImg = _presence_of_element(element, 'img');
            result.numberTextNodes = _number_of_textnodes(element);
            result.proportionNumberTextNodes = _proportion_number_in_textnodes(element);
            result.percentLinks = _80_percent_links(element);
            return result;
        }
        function _number_of_words (element) {
            var target = element,
                aux = null, elements = [],
                number_of_words = 0;

            elements.push(target);
            while (elements.length != 0) {
                aux = elements.pop();
                for (var i = 0; i < aux.childNodes.length; i++) {
                    if (aux.childNodes[i].nodeType === 3) {
                        number_of_words += aux.childNodes[i].nodeValue.split(" ").length;
                    }
                    if (aux.childNodes[i].nodeType === 1)
                        elements.push(aux.childNodes[i]);
                }
            }
            return number_of_words;
        }
        function _number_of_elements (element) {
            return element.querySelectorAll('*').length;
        }
        function _80_percent_links (element) {
            var target = element,
                table = target.querySelector("table"),
                ul = target.querySelector("ul"),
                childs, childs2;

            if (table) {
                childs = table.querySelectorAll("*").length;
                childs2 = table.querySelectorAll("a").length;
                if ((childs2/childs) > 0.8)
                    return 1;
                else
                    return 0;
            }
            if (ul) {
                childs = ul.querySelectorAll("*").length;
                childs2 = ul.querySelectorAll("a").length;
                if ((childs2/childs) > 0.8)
                    return 1;
                else
                    return 0;
            }
            return 0;
        }
        function _proportion_number_in_textnodes (element) {
            var target = element,
                aux = null, elements = [],
                number_of_numbers = 0;

            elements.push(target);
            while (elements.length != 0) {
                aux = elements.pop();
                for (var i = 0; i < aux.childNodes.length; i++) {
                    if (aux.childNodes[i].nodeType === 3) {
                        if (!isNaN(parseInt(aux.childNodes[i].nodeValue)))
                            number_of_numbers++;
                    }
                    if (aux.childNodes[i].nodeType === 1)
                        elements.push(aux.childNodes[i]);

                }
            }
            return number_of_numbers;
        }
        function _number_of_textnodes (element) {
            var target = element,
                aux = null, elements = [],
                number_of_child_nodes = 0;

            elements.push(target);
            while (elements.length != 0) {
                aux = elements.pop();
                for (var i = 0; i < aux.childNodes.length; i++) {
                    if (aux.childNodes[i].nodeType === 3)
                        number_of_child_nodes++;
                    if (aux.childNodes[i].nodeType === 1)
                        elements.push(aux.childNodes[i]);
                }
            }
            return number_of_child_nodes;
        }
        function _date (element) {
            var aux = (element.type) ? element.type : '',
                childs = element.querySelectorAll("*");
            for (var i = 0; i < childs.length; i++) {
                aux += ' ' + childs[i].type;
            };
            return (aux.search('date') >= 0);
        }
        function _menu_name (element) {
            var aux = (element.className) ? element.className : '',
                childs = element.querySelectorAll("*");
            for (var i = 0; i < childs.length; i++) {
                aux += ' ' + childs[i].className;
            };
            return (aux.search('menu') >= 0 ||
                    aux.search('dropdown') >= 0 ||
                    aux.search('drop-down') >= 0);
        }
        function _presence_of_element (element, tagName) {
            return (element.querySelectorAll(tagName).length !== 0);
        }
        function _position(element) {
            if (element.parentElement == null)
                return { left: element.offsetLeft, top: element.offsetTop };
            var parent_element = _position(element.parentElement);
            return {
                left: (element.offsetLeft + parent_element.left),
                top: (element.offsetTop + parent_element.top),
                width: element.offsetWidth,
                height: element.offsetHeight
            };
        }
        function _is_visible (element) {
            return element.isVisible();
        }
        function _contains (target, element) {
            if (target === null)
                return false;
            var childs = target.querySelectorAll('*');
            for (var i = 0; i < childs.length; i++) {
                if (childs[i] === element)
                    return true;
            };
            return false;
        }

        window.observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0 &&
                    mutation.addedNodes[0].nodeType === 1) {
                    for (var j = 0; j < mutation.addedNodes.length; j++) {
                        added_elements.push(mutation.addedNodes[j]);
                    }
                }
            });
        });
        window.observer.observe(document.body, {childList: true, subtree: true});

        all_elements = document.querySelectorAll('*');
        for (var i = 0; i < all_elements.length; i++) {
            if (_is_visible(all_elements[i])) {
                visible_elements.push(all_elements[i]);
            } else {
                invisible_elements.push(all_elements[i]);
            }
        };

        return {
            get_visible_elements: function () {
                var visible_positions = [];
                for (var i = 0; i < visible_elements.length; i++) {
                    visible_positions[i] = _meta_data(visible_elements[i]);
                };
                return visible_positions;
            },
            check_visibility_changes: function () {
                var changes = [],
                    result = [],
                    i, last = null;
                for (i = 0; i < invisible_elements.length; i++) {
                    if (_is_visible(invisible_elements[i])) {
                        if (!_contains(last, invisible_elements[i])) {
                            changes.push(invisible_elements[i]);
                            last = invisible_elements[i];
                        }
                        //invisible_elements.splice(i, 1);
                    }
                };
                for (i = 0; i < changes.length; i++) {
                    result.push(_meta_data(changes[i]));
                };
                return result;
            },
            check_mutation_changes: function () {
                var result = [];
                for (var i = 0; i < added_elements.length; i++) {
                    result.push(_meta_data(added_elements[i]));
                };
                added_elements = [];
                return result;
            }
        };
    }());
}());
