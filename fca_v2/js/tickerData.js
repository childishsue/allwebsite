var lastHeartbeat;
var subscriptions = {};
var pendingTimeouts = {};
var websocketReset = document.createEvent('Event');
websocketReset.initEvent('websocketReset', true, true);

var WebsocketChannels = {
	ticker: '1002',
	footer: '1003',
	heartbeat: '1010'
};

function noop() {}

function nowSeconds() {
	return Math.floor(Date.now() / 1000);
}

function heartbeatEvent () {
	lastHeartbeat = nowSeconds();
}

function checkHeartbeat() {
	if ((nowSeconds() - lastHeartbeat) > 10){
		openWebsocketConnection();
		window.dispatchEvent(websocketReset);
	}
}

function clearPendingTimeout(identifier) {
	if (pendingTimeouts.hasOwnProperty(identifier)) {
		clearTimeout(pendingTimeouts[identifier]);
		delete pendingTimeouts[identifier];
	}
}

function subscribe(feed, handler, subName) {
	var subID = subName || feed;
	var realSubID = WebsocketChannels.hasOwnProperty(subID) ? WebsocketChannels[subID] : subID;
	clearPendingTimeout(realSubID);
	if (subscriptions[realSubID]) {
		if (!subscriptions[realSubID].handlers) {
			var existingHandler = subscriptions[realSubID];
			delete subscriptions[realSubID];
			subscriptions[realSubID] = {
				handlers: [existingHandler, handler]
			};
		} else {
			subscriptions[realSubID].handlers.push(handler);
		}
	} else {
		subscriptions[realSubID] = handler;
	}

	if (window.connection && window.connection.readyState === 1) {
		window.connection.send(JSON.stringify({command: 'subscribe', channel: realSubID}));
	} else {
		pendingTimeouts[realSubID] = setTimeout(function() {
			subscribe(feed, handler, subName);
		}, 100);
	}
}

function unsubscribe(subName) {
	clearPendingTimeout(subName);
	subscriptions[subName] && delete subscriptions[subName];
}

function dispatch(subID) {
	function _tryCallHandler(handler) {
		try {
			if (handler) {
				var args = Array.prototype.slice.call(arguments, 1) || [];
				if (args != null && args.length > 0) {
					handler.apply(null, args);
				} else {
					handler();
				}
			}
		} catch (e) {}
	}

	if (subscriptions[subID]) {
		var data = Array.prototype.slice.call(arguments, 1) || [];
		if (subscriptions[subID].handlers) {
			subscriptions[subID].handlers.forEach(function(handler) {
				var applyData = [].concat([handler], data);
				_tryCallHandler.apply(this, applyData);
			});
		} else {
			var applyData = [].concat([subscriptions[subID]], data);
			_tryCallHandler.apply(this, applyData);
		}
	}
}

// Opens or resets the global websocket connection
function openWebsocketConnection() {
    $.getJSON('/public?command=returnConfig').always(function(config) {
        var wsuri = (config && config.websocketsHost) ? config.websocketsHost : 'wss://api2.poloniex.com';

		if (window.connection) {
			try {
				window.connection.close();
			} catch (e) {}
			window.connection = null;
		}

		try {
			window.connection = new WebSocket(wsuri);
		} catch (e) {
			return;
		}

		window.connection.onopen = function (e) {
			lastHeartbeat = nowSeconds();

			for (var subName in subscriptions) {
				var subObj = subscriptions[subName];
				delete subscriptions[subName];
				subscribe(subName, subObj || noop);
			}

			// We should always be subscribed to heartbeat
			if (!subscriptions.heartbeat) {
				subscribe('heartbeat', window.heartbeatEvent);
			}

			// Just in case an alert needs to be seen immediately
			if (!subscriptions.alerts) {
				subscribe('alerts', window.alertEvent);
			}

			// Subscribe to footer updates if footer was included
			if (window.footerEvent) {
				subscribe('footer', window.footerEvent);
			}
		};

		window.connection.onmessage = function (e) {
			var data;

			// `e.data` will begin as a string, try to parse as JSON before using fallback
			try {
				data = JSON.parse(e.data);
			} catch (e) {
				data = e.data;
			}

			if (Array.isArray(data)) {
				if (data.length <= 0) {
					return;
				} else if (data.length === 2 && data[1] === 1) {
					// Acknowledgement of subscription
					return;
				}
				dispatch.apply(window, data);
			} else if (typeof data === 'string') {
				dispatch(data, null);
			}
		};

		window.connection.onclose = function() {
			for (var subName in subscriptions) {
				unsubscribe(subName);
			}
		};
    });
}

$(document).ready(function() {
	openWebsocketConnection();
	setInterval(checkHeartbeat, 8000);
});