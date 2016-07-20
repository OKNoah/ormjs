// Generated by CoffeeScript 1.10.0
var Event, Exp, Tree,
  slice = [].slice,
  hasProp = {}.hasOwnProperty;

Exp = require('ui-js/data-bind/exp');

Event = require('ui-js/dom/core/event');

module.exports = Tree = (function() {
  var classRegExp, directiveRegExp, eventRegExp, linkRegExp, propRegExp;

  eventRegExp = /^\((\()?(!?)(.+?)\)?\)$/;

  directiveRegExp = /^\*(\S+)$/;

  propRegExp = /^\[(\S+)]$/;

  linkRegExp = /^#(\S+)$/;

  classRegExp = /^\.(\S+)$/;

  function Tree(template1, Component) {
    var hasTerminal;
    this.template = template1;
    this.Component = Component;
    if (this.template.nodeType === 'text') {
      this.isTextNode = true;
      this.hasTextExp = Exp.test(this.template.value);
      return;
    }
    this.classes = {};
    this.events = {};
    this.props = {};
    this.links = [];
    this.directives = [];
    this.childTrees = [];
    this.expAttributes = {};
    hasTerminal = this.compileDirectives();
    if (hasTerminal) {
      return;
    }
    this.SubComponent = this.Component.getSubComponent(this.template);
    this.compileAttributes();
    this.compileChildTrees();
    return;
  }

  Tree.prototype.create = function(template) {
    return new Tree(template, this.Component);
  };

  Tree.prototype.replace = function(node) {
    this.template.replace(node);
    this.template = node;
  };

  Tree.prototype.compileDirectives = function() {
    var directives, hasTerminal;
    if (this.template.nodeType !== 'element') {
      return;
    }
    directives = this.getDirectives();
    directives = this.sortDirectives(directives);
    directives = this.filterDirectives(directives);
    hasTerminal = this.directivesHasTerminal(directives);
    this.directives = directives.map((function(_this) {
      return function(directive) {
        var returns;
        returns = typeof directive.compile === "function" ? directive.compile(_this.template, _this) : void 0;
        return function(node, component, locals) {
          if (returns == null) {
            returns = [];
          }
          return (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return Object(result) === result ? result : child;
          })(directive, [node, component, locals].concat(slice.call(returns)), function(){});
        };
      };
    })(this));
    return hasTerminal;
  };

  Tree.prototype.getDirectives = function() {
    var directives;
    directives = [];
    this.template.eachAttrs((function(_this) {
      return function(name, value) {
        var Directive, directive;
        if (directiveRegExp.test(name)) {
          directive = name.match(directiveRegExp)[1];
          Directive = _this.Component.getDirective(directive);
          if (Directive) {
            return directives.push(Directive);
          }
        }
      };
    })(this));
    return directives;
  };

  Tree.prototype.sortDirectives = function(directives) {
    directives.sort(function(a, b) {
      return a.priority < b.priority;
    });
    return directives;
  };

  Tree.prototype.filterDirectives = function(directives) {
    var directive, filtered, i, len;
    filtered = [];
    for (i = 0, len = directives.length; i < len; i++) {
      directive = directives[i];
      filtered.push(directive);
      if (directive.terminal) {
        break;
      }
    }
    return filtered;
  };

  Tree.prototype.directivesHasTerminal = function(directives) {
    return directives.some(function(directive) {
      return directive.terminal;
    });
  };

  Tree.prototype.compileAttributes = function() {
    if (this.template.nodeType !== 'element') {
      return;
    }
    this.template.eachAttrs((function(_this) {
      return function(name, value) {
        var className, event, link, matches, prop;
        if (eventRegExp.test(name)) {
          matches = name.match(eventRegExp);
          event = matches[3];
          return _this.events[event] = {
            own: !!matches[1],
            prevent: !!matches[2],
            exp: value
          };
        } else if (classRegExp.test(name)) {
          className = name.match(classRegExp)[1];
          return _this.classes[className] = value;
        } else if (propRegExp.test(name)) {
          prop = name.match(propRegExp)[1];
          return _this.props[prop] = value;
        } else if (linkRegExp.test(name)) {
          link = name.match(linkRegExp)[1];
          return _this.links.push(link);
        } else if (Exp.test(value)) {
          return _this.expAttributes[name] = value;
        }
      };
    })(this));
  };

  Tree.prototype.compileChildTrees = function() {
    var child, i, len, ref;
    ref = this.template.children;
    for (i = 0, len = ref.length; i < len; i++) {
      child = ref[i];
      this.childTrees.push(new Tree(child, this.Component));
    }
  };

  Tree.prototype.init = function(node, component, locals) {
    var subComponent;
    if (locals == null) {
      locals = {};
    }
    if (this.isTextNode) {
      if (this.hasTextExp) {
        this.initTextExp(node, component, locals);
      }
      return component;
    }
    if (this.SubComponent) {
      subComponent = this.SubComponent.init(node, component.app);
      this.initLinks(subComponent, locals);
      this.initProps(subComponent, component, locals);
    } else {
      this.initLinks(node, locals);
      this.initProps(node, component, locals);
    }
    this.initClasses(node, component, locals);
    this.initExpAttributes(node, component, locals);
    this.initEvents(node, component, locals, subComponent);
    this.initChildren(node, component, locals);
    this.initDirectives(node, component, locals);
    return component;
  };

  Tree.prototype.initChildren = function(node, component, locals) {
    var child, childNode, childNodes, i, index, len, ref;
    childNodes = node.children.slice();
    ref = this.childTrees;
    for (index = i = 0, len = ref.length; i < len; index = ++i) {
      child = ref[index];
      childNode = childNodes[index];
      child.init(childNode, component, locals);
    }
  };

  Tree.prototype.initDirectives = function(node, component, locals) {
    var directive, directives;
    directives = (function() {
      var i, len, ref, results;
      ref = this.directives;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        directive = ref[i];
        results.push(directive(node, component, locals));
      }
      return results;
    }).call(this);
    node.on('destroy', function() {
      var i, len;
      for (i = 0, len = directives.length; i < len; i++) {
        directive = directives[i];
        if (typeof directive.destructor === "function") {
          directive.destructor();
        }
      }
    });
  };

  Tree.prototype.initLinks = function(target, locals) {
    var i, len, link, ref;
    ref = this.links;
    for (i = 0, len = ref.length; i < len; i++) {
      link = ref[i];
      locals[link] = target;
    }
  };

  Tree.prototype.initEvents = function(node, component, locals, subComponent) {
    var eventData, eventName, fn, ref;
    ref = this.events;
    fn = (function(_this) {
      return function(eventData) {
        return node.on(eventName, function(event) {
          if (event instanceof Event) {
            if (eventData.prevent) {
              event.prevent();
            }
            if (eventData.own && !event.own) {
              return;
            }
          }
          if (eventData.exp) {
            locals['$event'] = event;
            locals['this'] = subComponent || node;
            ui["eval"](component, eventData.exp, locals);
            delete locals['$event'];
            delete locals['this'];
          }
        });
      };
    })(this);
    for (eventName in ref) {
      if (!hasProp.call(ref, eventName)) continue;
      eventData = ref[eventName];
      fn(eventData);
    }
  };

  Tree.prototype.initClasses = function(node, component, locals) {
    var className, exp, ref;
    ref = this.classes;
    for (className in ref) {
      if (!hasProp.call(ref, className)) continue;
      exp = ref[className];
      node.bindClass(className, exp, component, locals);
    }
  };

  Tree.prototype.initProps = function(target, component, locals) {
    var exp, fn, prop, ref;
    ref = this.props;
    fn = (function(_this) {
      return function(prop, exp) {
        var dataBind;
        dataBind = ui.bind(target, prop, component, exp, locals);
        return target.on('destroy', function() {
          return dataBind.destroy();
        });
      };
    })(this);
    for (prop in ref) {
      if (!hasProp.call(ref, prop)) continue;
      exp = ref[prop];
      fn(prop, exp);
    }
  };

  Tree.prototype.initTextExp = function(node, component, locals) {
    var exp;
    exp = node.value;
    ui.watch(component, exp, (function(_this) {
      return function(value) {
        return node.value = value;
      };
    })(this), locals);
  };

  Tree.prototype.initExpAttributes = function(node, component, locals) {
    var exp, fn, name, ref;
    ref = this.expAttributes;
    fn = function(name) {
      return ui.watch(component, exp, function(value) {
        return node.attr(name, value);
      }, locals);
    };
    for (name in ref) {
      if (!hasProp.call(ref, name)) continue;
      exp = ref[name];
      fn(name);
    }
  };

  return Tree;

})();

//# sourceMappingURL=tree.js.map
