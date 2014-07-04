function acp(container) {
	opts = {
		top: '10%'
	};
	opts.OC = 'acp-overlay';
	opts.OSC = 'acp-overlay-show';
	opts.PC = 'acp-model';
	opts.PSC = 'acp-model-show';
	opts.alert = '<div class="acp-panel"><i class="{icon}"></i><div><b>{title}</b><p>{content}</p></div></div><p class="acp-button-group"><button>{ok}</button></p>';
	opts.confirm = '<div class="acp-panel"><i class="{icon}"></i><div><b>{title}</b><p>{content}</p></div></div><p class="acp-button-group"><button>{ok}</button><button>{cancel}</button></p>';
	opts.prompt = '<div class="acp-panel"><i class="{icon}"></i><div><b>{title}</b><p>{content}</p><p><input value="{value}" size="18" type="text"/></p></div></div><p class="acp-button-group"><button>{ok}</button><button>{cancel}</button></p>';
	opts.waiting = '<div class="acp-panel"><i class="{icon}"></i><div><p>{content}</p></div></div><p class="acp-button-group"><button>{cancel}</button></p>';
	opts.load = '<em class="acp-close fa fa-times-circle"></em><div>{content}</div>';
	
	this.container = container;
	
	tmp = createChildren(this.container);
	this.overlay = tmp[0];
	this.panel = tmp[1];
};

acp.prototype.resize = function() {
	var pd = getEleWidth(this.container);
	var width = this.panel.offsetWidth;
    var left = (pd / 2 - (width / 2)) + 0;
    if (left < 0) {
        left = 0;
    }
    this.panel.style.top = opts.top;
    this.panel.style.left = left + 'px';
};

acp.prototype.bindResize = function () {
	var self = this;
	function resize(){
		self.resize();
	};
	if (window.attachEvent) {
		window.attachEvent("resize", resize);
	} else if (window.addEventListener) {
		window.addEventListener("resize", resize, false);
	}
};

acp.prototype.unbindResize = function () {
	if (window.detachEvent) {
		window.detachEvent("resize", this.resize);
	} else if (window.removeEventListener) {
		window.removeEventListener("resize", this.resize, false);
	}
};
	
acp.prototype.show = function(html, done) {
	this.panel.innerHTML = html;
	this.bindResize();
	this.resize();	
	addClass(this.overlay, opts.OSC);
	addClass(this.panel, opts.PSC);
	done(this.panel);
};
	
acp.prototype.hide = function () {
	this.unbindResize();
	removeClass(this.panel, opts.PSC);
	removeClass(this.overlay, opts.OSC);
};


acp.prototype.alert = function(title, msg, callback) {
	var self = this;
	self.show(nano(opts.alert, {'icon': 'fa fa-info-circle fa-2x', 'title': title, 'content': msg, 'ok':'OK'}), function(panel) {			
		var btn = panel.getElementsByTagName('button')[0];
		btn.onclick = function() {
			self.hide();
			callback();
		};
		btn.focus();
	});
};
	
acp.prototype.confirm = function(title, msg, callback) {
	var self = this;
	function action(res) {
		self.hide();
		callback(res);
	};
	self.show(nano(opts.confirm, {'icon': 'fa fa-warning fa-2x', 'title': title, 'content': msg, 'cancel':'Cancel', 'ok':'OK'}), function(panel) {
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
	
acp.prototype.prompt = function(title, msg, value, callback) {
	var self = this;
	if(typeof value == 'function') {
		callback = value;
		value = '';
	}
	function action(res) {
		self.hide();
		callback(res);
	};
	self.show(nano(opts.prompt, {'icon': 'fa fa-question-circle fa-2x', 'title': title, 'content': msg, 'value': value, 'cancel':'Cancel', 'ok':'OK'}), function(panel) {
		var input = panel.getElementsByTagName('input')[0];
		var buttons = panel.getElementsByTagName('button');
		input.focus();
		input.select();
		input.onkeyup = function(event){
			if(event.keyCode == 13){
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
	
acp.prototype.waiting = function(msg, callback, cancel) {
	var self = this;
	if(typeof msg == 'function') {
		callback = msg;
		msg = null;
		cancel = callback;
	}
	var msg = msg || 'loading...';
	
	self.show(nano(opts.waiting, {'icon': 'fa fa-spinner fa-spin fa-2x', 'content': msg, 'cancel':'Cancel'}), function(panel) {
		var btn = panel.getElementsByTagName('button')[0];
		btn.onclick = function() {
			if(cancel) {cancel();}
			self.hide();
		};
		callback(self.hide);
	});
};
	
acp.prototype.load = function(elementId, closeIcon, callback) {

	if(typeof closeIcon === 'function') {
		callback = closeIcon;
		closeIcon = true;
	}

	var self = this;
	var elementId = elementId && (elementId[0] === '#') && elementId.substring(1);
	var panel = elementId && document.getElementById(elementId);
	if(!panel) {
		alert('Could not found element');
		return;
	}
	self.show(nano(opts.load, {'content': panel.innerHTML}), function(_panel) {
	
		var icon = _panel.children[0];		
		var _hide = function(){
			self.hide();
		};
		
		if(!closeIcon) {
			_panel.removeChild(icon);
		} else {
			icon.onclick = _hide;
		}

		callback(panel, _hide);
	});
};

function createChildren(container) {
			
	var overlay = document.createElement("div");
	var panel = document.createElement("div");

	var panelPos = 'fixed';
	if(container) {
		container.style.position = 'relative';
		panelPos = 'absolute';
	}

	overlay.className = opts.OC;
	overlay.style.position = panelPos;
	panel.className = opts.PC;
	panel.style.position = panelPos;
	
	var container = container || document.getElementsByTagName('body')[0];
	container.appendChild(overlay);
	container.appendChild(panel);
	
	return [overlay, panel];
};


/* Nano Templates (Tomasz Mazur, Jacek Becela) */
function nano(template, data) {
  return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
    var keys = key.split("."), v = data[keys.shift()];
    for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
    return (typeof v !== "undefined" && v !== null) ? v : "";
  });
};
function hasClass(ele, cls) {
	return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
};
function addClass(ele, cls) {
    if (!this.hasClass(ele, cls)) ele.className += " " + cls;
};
function removeClass(ele, cls) {
    if (hasClass(ele, cls)) {
		var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
		ele.className = ele.className.replace(reg, ' ');
    }
};
function getPageWidth() {
  var w=window,d=document,e=d.documentElement,g=d.getElementsByTagName('body')[0],x=w.innerWidth||e.clientWidth||g.clientWidth,y=w.innerHeight||e.clientHeight||g.clientHeight;
  return x;
};
function getEleWidth(ele) {
	return ele ? ele.offsetWidth : getPageWidth();
};
