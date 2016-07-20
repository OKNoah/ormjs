// Generated by CoffeeScript 1.10.0
var ShadowStyle;

module.exports = ShadowStyle = (function() {
  var cache, cssBlockRegExp, partsRegExp;

  function ShadowStyle() {}

  cssBlockRegExp = /([\s\S]+?)\s*(\{[\s\S]*?})/img;

  partsRegExp = /([^,]+)/img;

  cache = {};

  ShadowStyle.compile = function(style) {
    var generator;
    if (typeof style === 'function') {
      return style;
    }
    style = style.toString();
    if (cache[style]) {
      return cache[style];
    }
    generator = this.createStyleGenerator(style);
    generator.style = style;
    cache[style] = generator;
    return generator;
  };

  ShadowStyle.replace = function(selector, id, components) {
    var componentTags, parts;
    if (components == null) {
      components = [];
    }
    componentTags = components.map((function(_this) {
      return function(component) {
        return component.selector;
      };
    })(this));
    parts = selector.split(/\s+|>/).map((function(_this) {
      return function(part, index, parts) {
        if (index === parts.length - 1 && !/:host/.test(part)) {
          part = part.replace(/^(.+?)(:.+)?$/, "$1[c" + id + "]$2");
        }
        part = part.replace(/:host/img, "[h" + id + "]");
        part = part.replace(/^[\w\-]+/, function(tag) {
          if (componentTags.indexOf(tag) !== -1) {
            return "ui-" + tag;
          }
          return tag;
        });
        return part;
      };
    })(this));
    return parts.join(' ');
  };

  ShadowStyle.createStyleGenerator = function(style) {
    var generatorArgs, generatorBody;
    style = style.replace(/\s*(\r|\n|\r\n)\s*/img, '');
    style = style.replace(/"/img, '\\"');
    style = style.replace(cssBlockRegExp, function(match, selector, rules) {
      selector = selector.replace(partsRegExp, '" + replace("$1", id, components) + "');
      return selector + rules;
    });
    generatorArgs = 'id, components';
    generatorBody = "var replace = " + this.replace + "; return \"" + style + "\"";
    return new Function(generatorArgs, generatorBody);
  };

  return ShadowStyle;

})();

//# sourceMappingURL=shadow-style.js.map
