(function () {
    window.WindowController = (function () {
        var visible_elements = [],
            invisible_elements = [],
            added_elements = [],
            all_elements = null;

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
                    visible_positions[i] = _position(visible_elements[i]);
                };
                return visible_positions;
            },
            check_visibility_changes: function () {
                var changes = [],
                    result = [],
                    i, widget;
                for (i = 0; i < invisible_elements.length; i++) {
                    if (_is_visible(invisible_elements[i])) {
                        changes.push(invisible_elements[i]);
                    }
                };
                for (i = 0; i < changes.length; i++) {
                    widget = _position(changes[i]);
                    widget.html = changes[i].outerHTML;
                    result.push(widget);
                };
                return result;
            },
            check_mutation_changes: function () {
                var result = [], widget;
                for (var i = 0; i < added_elements.length; i++) {
                    widget = _position(added_elements[i]);
                    widget.html = added_elements[i].outerHTML;
                    result.push(widget);
                };
                added_elements = [];
                return result;
            }
        };
    }());
}());
