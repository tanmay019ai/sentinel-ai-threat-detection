const clients = new Set();

function sendEvent(res, eventName, data) {
	res.write(`event: ${eventName}\n`);
	res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function broadcast(eventName, data) {
	for (const res of clients) {
		try {
			sendEvent(res, eventName, data);
		} catch {
			// ignore broken connections; close handler should remove
		}
	}
}

function addClient(res) {
	clients.add(res);
}

function removeClient(res) {
	clients.delete(res);
}

module.exports = {
	addClient,
	removeClient,
	broadcast,
	sendEvent,
	clientCount: () => clients.size,
};
