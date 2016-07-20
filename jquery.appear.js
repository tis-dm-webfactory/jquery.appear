/*
 * jQuery appear plugin
 *
 * Copyright (c) 2012 Andrey Sidorov
 * licensed under MIT license.
 *
 * https://github.com/morr/jquery.appear/
 *
 * Version: 0.3.7
 */
(function ($) {
	var selectors = [];
	var check_binded = [];
	var check_lock = false;
	var defaults = {
		interval: 250,
		force_process: false,
		/**
		 * @type {Object} to which the scroll-event is bound, default 'window'
		 */
		scroll_selector: window
	};

	var $prior_appeared = [];

	function process() {
		check_lock = false;
		for (var index = 0, selectorsLength = selectors.length; index < selectorsLength; index++) {
			var $appeared = $(selectors[index]).filter(function () {
				return $(this).is(':appeared');
			});

			$appeared.trigger('appear', [$appeared]);

			if ($prior_appeared[index]) {
				var $disappeared = $prior_appeared[index].not($appeared);
				$disappeared.trigger('disappear', [$disappeared]);
			}
			$prior_appeared[index] = $appeared;
		}
	}

	function add_selector(selector) {
		selectors.push(selector);
		$prior_appeared.push();
	}

	// "appeared" custom filter
	$.expr[':']['appeared'] = function (element) {
		var $element = $(element);
		if (!$element.is(':visible')) {
			return false;
		}

		/**
		 * @type {jQuery} scrollable container
		 */
		var $scroll_selector = $element.data('scroll_selector');

		var window_left = $scroll_selector.scrollLeft();
		var window_top = $scroll_selector.scrollTop();
		var offset = $element.offset();
		var left = offset.left;
		var top = offset.top;

		if (top + $element.height() >= window_top &&
			top - ($element.data('appear-top-offset') || 0) <= window_top + $scroll_selector.height() &&
			left + $element.width() >= window_left &&
			left - ($element.data('appear-left-offset') || 0) <= window_left + $scroll_selector.width()) {
			return true;
		} else {
			return false;
		}
	};

	$.fn.extend({
		// watching for element's appearance in browser viewport
		appear: function (options) {
			var opts = $.extend({}, defaults, options || {});
			/**
			 * @type {jQuery} scrollable container
			 */
			var $scrollSelector = $(opts.scroll_selector);
			var scrollSelectorName = $scrollSelector.selector || 'default';

			// add the scroll selector to each element, so it is accessable in the :appeared check
			this.each(function () {
				$(this).data('scroll_selector', $scrollSelector);
			});

			var selector = this.selector || this;
			// no binding on it yet
			if ($.inArray(scrollSelectorName, check_binded) == -1) {
				var on_check = function () {
					if (check_lock) {
						return;
					}
					check_lock = true;

					setTimeout(process, opts.interval);
				};

				$scrollSelector.on('scroll', on_check);

				// no resize-binding on window yet
				if (check_binded.length == 0) {
					$(window).on('resize', on_check);
				}

				// mark it as bound
				check_binded.push(scrollSelectorName);
			}

			if (opts.force_process) {
				setTimeout(process, opts.interval);
			}
			add_selector(selector);
			return $(selector);
		}
	});

	$.extend({
		// force elements's appearance check
		force_appear: function () {
			if (check_binded.length > 0) {
				process();
				return true;
			}
			return false;
		}
	});
})(function () {
	if (typeof module !== 'undefined') {
		// Node
		return require('jquery');
	} else {
		return jQuery;
	}
}());