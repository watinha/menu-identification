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
            return (VisSense(element)).isVisible();
        }

        all_elements = document.querySelectorAll('*');
        for (var i = 0; i < all_elements.length; i++) {
            if (_is_visible(all_elements[i])) {
                visible_elements.push(_position(all_elements[i]));
            }
        };

        return {
            get_visible_elements: function () {
                return visible_elements;
            }
        };
    }());
}());
