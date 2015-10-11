'use strict';

function ACP(container) {
    this.opts = {
        top: '10%',
        OC: 'acp-overlay',
        OSC: 'acp-overlay-show',
        PC: 'acp-model',
        PSC: 'acp-model-show',
        alert: '<div class="acp-panel"><i class="{icon}"></i><div><b>{title}</b><p>{content}</p></div></div><p class="acp-button-group"><button>{ok}</button></p>',
        confirm: '<div class="acp-panel"><i class="{icon}"></i><div><b>{title}</b><p>{content}</p></div></div><p class="acp-button-group"><button>{ok}</button><button>{cancel}</button></p>',
        prompt: '<div class="acp-panel"><i class="{icon}"></i><div><b>{title}</b><p>{content}</p><p><input value="{value}" size="18" type="text"/></p></div></div><p class="acp-button-group"><button>{ok}</button><button>{cancel}</button></p>',
        waiting: '<div class="acp-panel"><i class="{icon}"></i><div><p>{content}</p></div></div><p class="acp-button-group"><button>{cancel}</button></p>',
        load: '<em class="acp-close fa fa-times-circle"></em><div>{content}</div>'
    };

    this.container = document.getElementById(container);
    var overlay = document.createElement("div");
    var panel = document.createElement("div");

    var panelPos = 'fixed';
    if (this.container) {
        this.container.style.position = 'relative';
        panelPos = 'absolute';
    }

    overlay.className = this.opts.OC;
    overlay.style.position = panelPos;
    panel.className = this.opts.PC;
    panel.style.position = panelPos;

    this.container = this.container || document.getElementsByTagName('body')[0];
    this.container.appendChild(overlay);
    this.container.appendChild(panel);

    this.overlay = overlay;
    this.panel = panel;
}

ACP.prototype.resize = function() {
    var pd = getEleWidth(this.container);
    var width = this.panel.offsetWidth;
    var left = (pd / 2 - (width / 2));
    if (left < 0) {
        left = 0;
    }
    this.panel.style.top = this.opts.top;
    this.panel.style.left = left + 'px';
};

ACP.prototype.bindResize = function() {
    var self = this;

    function resize() {
        self.resize();
    }
    if (window.attachEvent) {
        window.attachEvent("onresize", resize);
    } else if (window.addEventListener) {
        window.addEventListener("resize", resize, false);
    }
};

ACP.prototype.unbindResize = function() {
    var self = this;

    function resize() {
        self.resize();
    }
    if (window.detachEvent) {
        window.detachEvent("onresize", resize);
    } else if (window.removeEventListener) {
        window.removeEventListener("resize", resize, false);
    }
};

ACP.prototype.show = function(html, done) {
    this.panel.innerHTML = html;
    this.bindResize();
    this.resize();
    addClass(this.overlay, this.opts.OSC);
    addClass(this.panel, this.opts.PSC);
    done(this.panel);
};

ACP.prototype.hide = function() {
    this.unbindResize();
    removeClass(this.panel, this.opts.PSC);
    removeClass(this.overlay, this.opts.OSC);
};


ACP.prototype.alert = function(title, msg, callback) {
    var self = this;
    self.show(nano(this.opts.alert, {
        'icon': 'fa fa-info-circle fa-2x',
        'title': title,
        'content': msg,
        'ok': 'OK'
    }), function(panel) {
        var btn = panel.getElementsByTagName('button')[0];
        btn.onclick = function() {
            self.hide();
            callback && callback();
        };
        btn.focus();
    });
};

ACP.prototype.confirm = function(title, msg, callback) {
    var self = this;

    function action(res) {
        self.hide();
        callback(res);
    }
    self.show(nano(this.opts.confirm, {
        'icon': 'fa fa-warning fa-2x',
        'title': title,
        'content': msg,
        'cancel': 'Cancel',
        'ok': 'OK'
    }), function(panel) {
        var buttons = panel.getElementsByTagName('button');
        buttons[0].onclick = function() {
            action(true);
        };
        buttons[1].onclick = function() {
            action(false);
        };
        buttons[0].focus();
    });
};

ACP.prototype.prompt = function(title, msg, value, callback) {
    var self = this;
    if (typeof value === 'function') {
        callback = value;
        value = '';
    }

    function action(res) {
        self.hide();
        callback(res);
    }
    self.show(nano(this.opts.prompt, {
        'icon': 'fa fa-question-circle fa-2x',
        'title': title,
        'content': msg,
        'value': value,
        'cancel': 'Cancel',
        'ok': 'OK'
    }), function(panel) {
        var input = panel.getElementsByTagName('input')[0];
        var buttons = panel.getElementsByTagName('button');
        input.focus();
        input.select();
        input.onkeyup = function(event) {
            if (event.keyCode === 13) {
                action(input.value);
            }
        };
        buttons[0].onclick = function() {
            action(input.value);
        };
        buttons[1].onclick = function() {
            action();
        };
    });
};

ACP.prototype.waiting = function(msg, callback, onClose) {
    var self = this;
    if (typeof msg === 'function') {
        callback = msg;
        msg = null;
        onClose = callback;
    }
    msg = msg || 'loading...';

    self.show(nano(this.opts.waiting, {
        'icon': 'fa fa-spinner fa-spin fa-2x',
        'content': msg,
        'cancel': 'Cancel'
    }), function(panel) {
        var btn = panel.getElementsByTagName('button')[0];
        btn.onclick = function() {
            if (onClose) {
                onClose();
            }
            self.hide();
        };
        callback(function() {
            self.hide();
        });
    });
};

ACP.prototype.load = function(html, closable, callback) {

    var self = this;

    if (typeof closable === 'function') {
        callback = closable;
        closable = true;
    }

    self.show(nano(this.opts.load, {
        'content': html
    }), function(_panel) {

        var icon = _panel.children[0];
        var _hide = function() {
            self.hide();
        };

        if (!closable) {
            _panel.removeChild(icon);
        } else {
            icon.onclick = _hide;
        }

        callback(_panel, _hide);
    });
};

/* Nano Templates (Tomasz Mazur, Jacek Becela) */
function nano(template, data) {
    return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
        var keys = key.split("."),
            v = data[keys.shift()];
        for (var i = 0, l = keys.length; i < l; i++) {
            v = v[keys[i]];
        }
        return (typeof v !== "undefined" && v !== null) ? v : "";
    });
}

function hasClass(ele, clazz) {
    return ele.className.match(new RegExp('(\\s|^)' + clazz + '(\\s|$)'));
}

function addClass(ele, clazz) {
    if (!hasClass(ele, clazz)) {
        ele.className += " " + clazz;
    }
}

function removeClass(ele, clazz) {
    if (hasClass(ele, clazz)) {
        var reg = new RegExp('(\\s|^)' + clazz + '(\\s|$)');
        ele.className = ele.className.replace(reg, ' ');
    }
}

function getPageWidth() {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight || e.clientHeight || g.clientHeight;
    return x;
}

function getEleWidth(ele) {
    return ele ? ele.offsetWidth : getPageWidth();
}