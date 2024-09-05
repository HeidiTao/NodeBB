'use strict';

define('settings/object', function () {
	let helper = null;

	/**
	 Creates a new child-element of given property with given data and calls given callback with elements to add.
	 @param field Any wrapper that contains all properties of the object.
	 @param key The key of the object.
	 @param attributes The attributes to call {@link Settings.helper.createElementOfType} with or to add as
	 element-attributes.
	 @param value The value to call {@link Settings.helper.fillField} with.
	 @param separator The separator to use.
	 @param insertCb The callback to insert the elements.
	 */
	function addObjectPropertyElement(field, key, attributes, prop, value, separator, insertCb) {
		const prepend = attributes['data-prepend'];
		const append = attributes['data-append'];
		delete attributes['data-prepend'];
		delete attributes['data-append'];
		attributes = helper.deepClone(attributes);
		const type = attributes['data-type'] || attributes.type || 'text';
		const element = $(helper.createElementOfType(type, attributes.tagName, attributes));
		element.attr('data-parent', '_' + key);
		element.attr('data-prop', prop);
		delete attributes['data-type'];
		delete attributes.tagName;
		for (const name in attributes) {
			if (attributes.hasOwnProperty(name)) {
				const val = attributes[name];
				if (name.search('data-') === 0) {
					element.data(name.substring(5), val);
				} else if (name.search('prop-') === 0) {
					element.prop(name.substring(5), val);
				} else {
					element.attr(name, val);
				}
			}
		}
		helper.fillField(element, value);
		if ($('[data-parent="_' + key + '"]', field).length) {
			insertCb(separator);
		}
		if (prepend) {
			insertCb(prepend);
		}
		insertCb(element);
		if (append) {
			insertCb(append);
		}
	}

	const SettingsObject = {
		types: ['object'],
		use: function () {
			helper = this.helper;
		},
		create: function (ignored, tagName) {
			return helper.createElement(tagName || 'div');
		},

		helperF: function (element, value, separator, propertyIndex) {
			console.log('Heidi_Tao1');
			const properties = element.data('attributes') || element.data('properties');
			const key = element.data('key') || element.data('parent');
			let attributes;
			attributes = properties[propertyIndex];
			if (typeof attributes !== 'object') {
				attributes = {};
			}
			const propertyName = attributes['data-prop'] || attributes['data-property'] || propertyIndex;
			if (value[propertyName] === undefined && attributes['data-new'] !== undefined) {
				value[propertyName] = attributes['data-new'];
			}
			addObjectPropertyElement(
				element,
				key,
				attributes,
				propertyName,
				value[propertyName],
				separator.clone(),
				function (el) { element.append(el); }
			);
		},
		
		set: function (element, value) {
			console.log('Heidi_Tao2');
			const properties = element.data('attributes') || element.data('properties');
			let separator = element.data('split') || ', ';
			let propertyIndex;
			separator = (function () {
				try {
					return $(separator);
				} catch (_error) {
					return $(document.createTextNode(separator));
				}
			}());
			element.empty();
			if (typeof value !== 'object') {
				value = {};
			}
			if (Array.isArray(properties)) {
				for (propertyIndex in properties) {
					if (properties.hasOwnProperty(propertyIndex)) {
						helperF(element, value, separator, propertyIndex);
					}
				}
			}
		},
		get: function (element, trim, empty) {
			const key = element.data('key') || element.data('parent');
			const properties = $('[data-parent="_' + key + '"]', element);
			const value = {};
			properties.each(function (i, property) {
				property = $(property);
				const val = helper.readValue(property);
				const prop = property.data('prop');
				const empty = helper.isTrue(property.data('empty'));
				if (empty || (val !== undefined && (val == null || val.length !== 0))) {
					value[prop] = val;
					return val;
				}
			});
			if (empty || Object.keys(value).length) {
				return value;
			}
		},
	};

	console.log("Heidi_Tao3");
	return SettingsObject;
});
