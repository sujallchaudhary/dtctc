const axios = require('axios');
const protobuf = require('protobufjs');
const Quadtree = require('quadtree-lib');
const dotenv = require('dotenv');
dotenv.config();

const protoFile = 'gtfs-realtime.proto';
const root = protobuf.loadSync(protoFile);
const FeedMessage = root.lookupType('transit_realtime.FeedMessage');
const mainRadius= Number(process.env.RADIUS) || 6;

const url = `https://otd.delhi.gov.in/api/realtime/VehiclePositions.pb?key=${process.env.API_KEY}`;

const qt = new Quadtree({ width: 360, height: 180 });
let vehicles = [];

const fetchVehiclePositions = async () => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = response.data;
        const message = FeedMessage.decode(new Uint8Array(buffer));
        const data = FeedMessage.toObject(message, {
            longs: String,
            enums: String,
            bytes: String,
        });
        const vehicleData = data.entity
            .filter(entity => entity.vehicle && entity.vehicle.position)
            .map(entity => ({
                id: entity.vehicle.vehicle.id || 'unknown',
                latitude: entity.vehicle.position.latitude,
                longitude: entity.vehicle.position.longitude,
                routeId: entity.vehicle.trip.routeId || 'unknown',
                tripId: entity.vehicle.trip.tripId || 'unknown',
                startTime: entity.vehicle.trip.startTime || 'unknown',
            }));

        qt.clear();
        vehicleData.forEach(vehicle => {
            qt.push({ x: vehicle.longitude + 180, y: vehicle.latitude + 90, data: vehicle });
        });
        vehicles = vehicleData;
        console.log(`Updated ${vehicles.length} vehicles in Quadtree`);
        return vehicleData;
    } catch (error) {
        console.error('Error fetching or parsing data:', error.message);
        return [];
    }
};

function approxDistance(lat1, lon1, lat2, lon2) {
    const latDiff = lat2 - lat1;
    const lonDiff = (lon2 - lon1) * Math.cos(lat1 * Math.PI / 180);
    return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111; // km
}


function filterBuses(userLat, userLon) {
    const radius = mainRadius / 111;
    const nearby = qt.colliding({
        x: userLon + 180,
        y: userLat + 90,
        width: radius * 2,
        height: radius * 2,
    });

    return nearby.map(item => item.data).filter(bus =>
        approxDistance(userLat, userLon, bus.latitude, bus.longitude) <= mainRadius
    );
}

module.exports = {
    fetchVehiclePositions,
    filterBuses
};