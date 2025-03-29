const { fetchVehiclePositions, filterBuses } = require('../controllers/track.controller');

const initializeSocket = (io) => {
    const clients = new Map();
    let fetchInterval = null;
    const FETCH_INTERVAL_MS = 3000;
    const updateVehicleData = async () => {
        const vehicleData = await fetchVehiclePositions();
        if (vehicleData.length > 0) {
            clients.forEach((coords, clientId) => {
                const socket = io.sockets.sockets.get(clientId);
                if (socket) {
                    const nearbyBuses = filterBuses(coords.latitude, coords.longitude);
                    socket.emit('nearbyBuses', nearbyBuses);
                }
            });
        }
    };
    const startFetching = () => {
        if (!fetchInterval) {
            updateVehicleData();
            fetchInterval = setInterval(updateVehicleData, FETCH_INTERVAL_MS);
        }
    };

    const stopFetching = () => {
        if (fetchInterval) {
            clearInterval(fetchInterval);
            fetchInterval = null;
        }
    };

    io.on('connection', (socket) => {

        socket.on('userLocation', (userCoords) => {
            const { latitude, longitude } = userCoords;
            clients.set(socket.id, { latitude, longitude });
            if (clients.size === 1) {
                startFetching();
            }
            const nearbyBuses = filterBuses(latitude, longitude);
            socket.emit('nearbyBuses', nearbyBuses);
        });

        socket.on('disconnect', () => {
            clients.delete(socket.id);
            if (clients.size === 0) {
                stopFetching();
            }
        });
    });
};

module.exports = { initializeSocket };