(function () {
    window.WindowController = (function () {
        var visible_elements = [],
            invisible_elements = [],
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
                    i;
                for (i = 0; i < invisible_elements.length; i++) {
                    if (_is_visible(invisible_elements[i])) {
                        changes.push(invisible_elements[i]);
                    }
                };
                for (i = 0; i < changes.length; i++) {
                    result.push(changes[i].outerHTML);
                };
                return result;
            }
        };
    }());
}());
