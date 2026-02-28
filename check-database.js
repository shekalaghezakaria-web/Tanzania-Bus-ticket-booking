async function checkDatabaseContent() {
    try {
        console.log('🧪 Checking database content...');
        
        // Check routes
        const routesResponse = await fetch('http://localhost:5000/api/routes');
        const routesResult = await routesResponse.json();
        
        console.log('📋 Routes in database:');
        console.log('Status:', routesResponse.status);
        console.log('Data:', JSON.stringify(routesResult, null, 2));
        
        // Check buses for first route
        if (routesResult.routes) {
            let routesArray = routesResult.routes;
            if (!Array.isArray(routesArray)) {
                routesArray = [routesArray];
            }
            
            if (routesArray.length > 0) {
                const firstRoute = routesArray[0];
                console.log('\n🚌 Checking buses for route:', firstRoute.id);
                
                const busesResponse = await fetch(`http://localhost:5000/api/routes/${firstRoute.id}/buses`);
                const busesResult = await busesResponse.json();
                
                console.log('Buses response:', JSON.stringify(busesResult, null, 2));
                
                // Check seats for first bus
                if (busesResult.buses) {
                    let busesArray = busesResult.buses;
                    if (!Array.isArray(busesArray)) {
                        busesArray = [busesArray];
                    }
                    
                    if (busesArray.length > 0) {
                        const firstBus = busesArray[0];
                        console.log('\n💺 Checking seats for bus:', firstBus.id);
                        
                        const seatsResponse = await fetch(`http://localhost:5000/api/routes/buses/${firstBus.id}/seats`);
                        const seatsResult = await seatsResponse.json();
                        
                        console.log('Seats response:', JSON.stringify(seatsResult, null, 2));
                        
                        if (seatsResult.seats) {
                            let seatsArray = seatsResult.seats;
                            if (!Array.isArray(seatsArray)) {
                                seatsArray = [seatsArray];
                            }
                            console.log(`\n📊 Total seats found: ${seatsArray.length}`);
                        }
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('🚨 Database check failed:', error.message);
    }
}

checkDatabaseContent();
