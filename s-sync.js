"use strict";

function SSync(config) {
    config = config || {};
    this.data = config.data || {};
    this.methods = config.methods || {};
    this.computed = config.computed || {};
    this._listen = {};
    this._values = {};
    this.compileComputed();
}

SSync.bootstrap = function () {

};

SSync.component = function (name, def) {

};

var p = SSync.prototype;

//p.makeGetter = function (exp) {
//    return (new Function('return this.' + exp)).bind(this);
//};
//
//p.makeSetter = function (exp) {
//    return (new Function('val', 'this.' + exp + '=val')).bind(this);
//};

p.compileComputed = function () {
    for (var key in this.computed) if (this.computed.hasOwnProperty(key)) {
        var getter = this.computed[key];
        var match = getter.toString().match(/this\.[$_a-zA-Z][$_a-zA-Z1-9]/g);
        if (match != null) for (var i = 0, maxi = match.length; i < maxi; i++) {
            var exp = match[i];
            if (!this._listen.hasOwnProperty(exp)) {
                this._listen[exp] = [];
            }
            this._listen[exp].push(function (exp, getter) {
                this._values[exp] = getter.call(this);
            }.bind(this, exp, getter));
            Object.defineProperty(this, key, {
                configurable: true,
                enumerable: true,
                get: function (exp) {
                    return this._values[exp];
                }.bind(this, exp)
            });
            this[exp] = this.data[exp]; // first set
        }
    }
};

p.makeBinding = function (exp, fn) {
    if (!this._listen.hasOwnProperty(exp)) {
        this._listen[exp] = [];
    }
    this._listen[exp].push(fn);
    Object.defineProperty(this, exp, {
        configurable: true,
        enumerable: true,
        get: function () {
            return this._values[exp];
        }.bind(this),
        set: function (val) {
            this._values[exp] = val;
            var listeners = this._listen[exp];
            for (var i = 0, maxi = listeners.length; i < maxi; i++) {
                listeners[i](val);
            }
        }.bind(this)
    });
    this[exp] = this.data[exp]; // first set
};

p.setValue = function (exp, val) {
    this._values[exp] = val;
};

p.compile = function (selector) {

    var root = document.querySelector(selector);
    if (root) {
        this.inspect(root);
    }

};

p.inspect = function (el) {
    var i, maxi, attr, conf, attrs = el.attributes, children = el.children;

    if (attrs) for (i = 0, maxi = attrs.length; i < maxi; i++) {
        attr = attrs[i];
        if (attr.name[0] === 's' && attr.name[1] === '-') {
            switch (attr.name) {
                case 's-for':
                    conf = attr.value.split(':');
                    if (conf.length === 2) {
                        console.log(this.data[conf[0]], this.data[conf[1]]);
                    }
                    break;
                case 's-text':
                    this.makeBinding(attr.value, function (el, val) {
                        el.innerText = val;
                    }.bind(this, el));
                    break;
                case 's-html':
                    this.makeBinding(attr.value, function (el, val) {
                        el.innerHTML = val;
                    }.bind(this, el));
                    break;
                case 's-show':
                    this.makeBinding(attr.value, function (el, val) {
                        el.classList[val ? 'remove' : 'add']('s-hide');
                    }.bind(this, el));
                    break;
                case 's-hide':
                    this.makeBinding(attr.value, function (el, val) {
                        el.classList[!val ? 'remove' : 'add']('s-hide');
                    }.bind(this, el));
                    break;
                case 's-model':
                    el.addEventListener('input', function (exp, el) {
                        this.setValue(exp, el.value);
                    }.bind(this, attr.value, el));
                    this.makeBinding(attr.value, function (el, val) {
                        el.value = val;
                    }.bind(this, el));
                    break;
                case 's-options':
                    conf = attr.value.split(':');
                    if (conf.length === 3) {
                        var track = conf[1];
                        var text = conf[2];
                        this.makeBinding(conf[0], function (el, val) {
                            el.innerHTML = '';
                            var option = document.createElement('option');
                            option.innerText = '-';
                            option.value = '';
                            el.appendChild(option);
                            for (var j = 0, maxj = val.length; j < maxj; j++) {
                                option = document.createElement('option');
                                var o = val[j];
                                option.innerText = o[text];
                                option.value = o[track];
                                el.appendChild(option);
                            }
                        }.bind(this, el));
                    } else {
                        this.makeBinding(attr.value, function (el, val) {
                            el.innerHTML = '';
                            var option = document.createElement('option');
                            option.innerText = '-';
                            option.value = '';
                            el.appendChild(option);
                            for (var j = 0, maxj = val.length; j < maxj; j++) {
                                option = document.createElement('option');
                                var o = val[j];
                                option.innerText = o;
                                option.value = o;
                                el.appendChild(option);
                            }
                        }.bind(this, el));
                    }
                    break;
                default:
                    if (attr.name.indexOf('s-on.') === 0) {
                        var cb = this.methods[attr.value];
                        if (typeof cb === 'function') {
                            el.addEventListener(attr.name.slice(5), cb.bind(this));
                        }
                    } else if (attr.name.indexOf('s-attr.') === 0) {
                        var attrName = attr.name.slice(7);
                        this.makeBinding(attr.value, function (el, oldAttr, attr, val) {
                            el.setAttribute(attr, val ? oldAttr + ' ' + val : oldAttr);
                        }.bind(this, el, el.getAttribute(attrName), attrName));
                    }
                    break;
            }
        }
    }

    if (children) for (i = 0, maxi = children.length; i < maxi; i++) {
        this.inspect(children[i]);
    }
};