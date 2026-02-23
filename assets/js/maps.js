/**
 * Maps Module for Circassian DNA Heritage
 * Handles all map visualizations using Leaflet.js
 */

class HeritageMaps {
    constructor() {
        this.maps = {};
        this.markers = {};
        this.data = null;
        this.initialized = false;
    }

    /**
     * Initialize maps module
     * @param {Array} heritageData - The heritage data from main app
     */
    async init(heritageData) {
        console.log('🗺️ Initializing Heritage Maps...');
        this.data = heritageData;
        this.allData = heritageData; // Store original full dataset
        this.setupTabSwitching();
        this.setupMapTabSwitching();
        this.initialized = true;
    }

    /**
     * Update maps with filtered data from feed
     * @param {Array} filteredData - Filtered heritage data
     */
    updateWithFilteredData(filteredData) {
        console.log(`🔄 Updating maps with ${filteredData.length} filtered families`);
        this.data = filteredData;
        
        // Refresh active maps
        if (this.maps.village) {
            this.refreshVillageMap();
        }
        if (this.maps.migration) {
            this.refreshMigrationMap();
        }
    }

    /**
     * Refresh village map with current data
     */
    refreshVillageMap() {
        // Clear existing markers
        this.maps.village.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                this.maps.village.removeLayer(layer);
            }
        });
        
        // Re-add markers with filtered data
        this.addVillageMarkers();
        this.updateVillageLegend();
    }

    /**
     * Refresh migration map with current data
     */
    refreshMigrationMap() {
        // Clear existing layers except base tile
        this.maps.migration.eachLayer(layer => {
            if (!(layer instanceof L.TileLayer)) {
                this.maps.migration.removeLayer(layer);
            }
        });
        
        // Re-add migration paths with filtered data
        this.addMigrationPaths();
        
        // Update legend
        const legend = document.getElementById('migrationLegend');
        if (legend) {
            const pathCount = this.countMigrationPaths();
            legend.innerHTML = `
                <strong>Migration Paths</strong><br>
                <div style="margin-top: 8px;">
                    <span style="display: inline-block; width: 30px; height: 3px; background: var(--male-color); vertical-align: middle;"></span>
                    <span style="margin-left: 4px; font-size: 0.85rem;">Pre → Main</span>
                </div>
                <div style="margin-top: 8px; font-size: 0.85rem; color: var(--text-secondary);">
                    ${pathCount} ${pathCount === 1 ? 'path' : 'paths'} shown
                </div>
            `;
        }
    }

    /**
     * Setup main tab switching between Feed, Maps, Statistics, About
     */
    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;

                // Update button states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update content visibility
                tabContents.forEach(content => {
                    if (content.dataset.content === targetTab) {
                        content.classList.add('active');
                        // Initialize map when Maps tab is opened
                        if (targetTab === 'maps' && !this.maps.village) {
                            this.initializeVillageMap();
                        }
                    } else {
                        content.classList.remove('active');
                    }
                });
            });
        });
    }

    /**
     * Setup map type switching within Maps tab
     */
    setupMapTabSwitching() {
        const mapTabButtons = document.querySelectorAll('.map-tab-btn');
        const mapContainers = document.querySelectorAll('.map-container');

        mapTabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetMap = button.dataset.map;

                // Update button states
                mapTabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update map container visibility
                mapContainers.forEach(container => {
                    if (container.dataset.mapContent === targetMap) {
                        container.classList.add('active');
                        // Initialize specific map type
                        this.initializeMapType(targetMap);
                    } else {
                        container.classList.remove('active');
                    }
                });
            });
        });
    }

    /**
     * Initialize specific map type
     * @param {string} mapType - Type of map to initialize
     */
    initializeMapType(mapType) {
        switch (mapType) {
            case 'village':
                if (!this.maps.village) this.initializeVillageMap();
                break;
            case 'migration':
                if (!this.maps.migration) this.initializeMigrationMap();
                break;
            case 'ydna':
                if (!this.maps.ydna) this.initializeYDNAMap();
                break;
            case 'mtdna':
                if (!this.maps.mtdna) this.initializeMtDNAMap();
                break;
            case 'territories':
                if (!this.maps.territories) this.initializeTerritoriesMap();
                break;
        }
    }

    /**
     * Initialize Village/Region Map
     */
    initializeVillageMap() {
        console.log('🏘️ Initializing Village Map...');

        // Create map centered on Caucasus region
        this.maps.village = L.map('villageMap').setView([43.5, 43.0], 7);

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(this.maps.village);

        // Process village data and add markers
        this.addVillageMarkers();

        // Update legend
        this.updateVillageLegend();
    }

    /**
     * Add markers for each village with family data
     */
    addVillageMarkers() {
        if (!this.data || this.data.length === 0) {
            console.log('⚠️ No data available for village markers');
            return;
        }

        // Group families by village
        const villageGroups = {};

        this.data.forEach(family => {
            const village = this.getVillageName(family);
            const coordinates = this.getVillageCoordinates(family);

            if (!village || !coordinates) return;

            const key = `${coordinates.lat},${coordinates.lng}`;
            
            if (!villageGroups[key]) {
                villageGroups[key] = {
                    village: village,
                    coordinates: coordinates,
                    families: []
                };
            }
            
            villageGroups[key].families.push(family);
        });

        // Create markers for each village
        Object.values(villageGroups).forEach(group => {
            const familyCount = group.families.length;
            
            // Create custom icon based on family count
            const icon = L.divIcon({
                className: 'village-marker',
                html: `
                    <div class="marker-content" style="
                        background: var(--male-color);
                        color: white;
                        border-radius: 50%;
                        width: ${30 + Math.min(familyCount * 2, 40)}px;
                        height: ${30 + Math.min(familyCount * 2, 40)}px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: ${12 + Math.min(familyCount, 8)}px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        border: 3px solid white;
                    ">
                        ${familyCount}
                    </div>
                `,
                iconSize: [30 + Math.min(familyCount * 2, 40), 30 + Math.min(familyCount * 2, 40)],
                iconAnchor: [15 + Math.min(familyCount, 20), 15 + Math.min(familyCount, 20)]
            });

            // Create marker
            const marker = L.marker([group.coordinates.lat, group.coordinates.lng], { icon })
                .addTo(this.maps.village);

            // Create popup content
            const popupContent = this.createVillagePopup(group);
            marker.bindPopup(popupContent, { maxWidth: 300 });
        });

        console.log(`✅ Added ${Object.keys(villageGroups).length} village markers`);
    }

    /**
     * Get village name from family data
     * @param {Object} family - Family data object
     * @returns {string} Village name
     */
    getVillageName(family) {
        if (!family.location?.village?.main) return null;
        
        const village = family.location.village.main;
        return village.english || village.native || village.russian || 'Unknown';
    }

    /**
     * Get village coordinates from family data
     * @param {Object} family - Family data object
     * @returns {Object} Coordinates {lat, lng}
     */
    getVillageCoordinates(family) {
        const coords = family.location?.coordinates?.main;
        
        if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
            return null;
        }

        return {
            lat: coords.latitude,
            lng: coords.longitude
        };
    }
    /**
     * Get pre-migration coordinates from family data
     * @param {Object} family - Family data object
     * @returns {Object} Coordinates {lat, lng} or null
     */
    getPreMigrationCoordinates(family) {
        const coords = family.location?.coordinates?.pre;
        
        if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
            return null;
        }

        return {
            lat: coords.latitude,
            lng: coords.longitude
        };
    }
    /**
     * Create popup content for village marker
     * @param {Object} group - Village group data
     * @returns {string} HTML content for popup
     */
    createVillagePopup(group) {
        const families = group.families;
        const familyCount = families.length;
        
        // Get state name
        const stateName = families[0]?.location?.state?.main?.english || 
                         families[0]?.location?.state?.main?.native || 
                         families[0]?.location?.state?.main?.russian || '';

        // Count haplogroups
        const yDnaGroups = {};
        const mtDnaGroups = {};
        
        families.forEach(family => {
            const yDna = family.dna?.yDnaHaplogroup;
            const mtDna = family.dna?.mtDnaHaplogroup;
            
            if (yDna && yDna !== 'N/A') {
                yDnaGroups[yDna] = (yDnaGroups[yDna] || 0) + 1;
            }
            if (mtDna && mtDna !== 'N/A') {
                mtDnaGroups[mtDna] = (mtDnaGroups[mtDna] || 0) + 1;
            }
        });

        // Build popup HTML
        let html = `
            <div class="village-popup">
                <h3 style="margin: 0 0 8px 0; color: var(--male-color);">${group.village}</h3>
                ${stateName ? `<p style="margin: 0 0 12px 0; color: var(--text-secondary); font-size: 0.85rem;">${stateName}</p>` : ''}
                <p style="margin: 0 0 8px 0;"><strong>${familyCount}</strong> ${familyCount === 1 ? 'family' : 'families'}</p>
        `;

        // Add Y-DNA haplogroups
        if (Object.keys(yDnaGroups).length > 0) {
            html += `<div style="margin-top: 12px;">
                <strong style="color: var(--male-color);">Y-DNA:</strong><br>
            `;
            Object.entries(yDnaGroups)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .forEach(([haplogroup, count]) => {
                    html += `<span style="font-size: 0.85rem;">${haplogroup} (${count})</span><br>`;
                });
            html += `</div>`;
        }

        // Add mtDNA haplogroups
        if (Object.keys(mtDnaGroups).length > 0) {
            html += `<div style="margin-top: 8px;">
                <strong style="color: var(--female-color);">mtDNA:</strong><br>
            `;
            Object.entries(mtDnaGroups)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .forEach(([haplogroup, count]) => {
                    html += `<span style="font-size: 0.85rem;">${haplogroup} (${count})</span><br>`;
                });
            html += `</div>`;
        }

        html += `</div>`;
        return html;
    }

    /**
     * Update village map legend
     */
    updateVillageLegend() {
        const legend = document.getElementById('villageLegend');
        if (!legend) return;

        legend.innerHTML = `
            <strong>Family Count</strong><br>
            <div style="margin-top: 8px;">
                <span style="display: inline-block; width: 30px; height: 30px; background: var(--male-color); border-radius: 50%; text-align: center; line-height: 30px; color: white; font-size: 0.75rem; vertical-align: middle;">1-5</span>
                <span style="margin-left: 4px; font-size: 0.85rem;">Few</span>
            </div>
            <div style="margin-top: 4px;">
                <span style="display: inline-block; width: 40px; height: 40px; background: var(--male-color); border-radius: 50%; text-align: center; line-height: 40px; color: white; font-size: 0.85rem; vertical-align: middle;">6-10</span>
                <span style="margin-left: 4px; font-size: 0.85rem;">Many</span>
            </div>
            <div style="margin-top: 4px;">
                <span style="display: inline-block; width: 50px; height: 50px; background: var(--male-color); border-radius: 50%; text-align: center; line-height: 50px; color: white; font-size: 0.95rem; vertical-align: middle;">10+</span>
                <span style="margin-left: 4px; font-size: 0.85rem;">Most</span>
            </div>
        `;
    }

    /**
     * Initialize Migration Paths Map
     */
    initializeMigrationMap() {
        console.log('🛤️ Initializing Migration Map...');

        this.maps.migration = L.map('migrationMap').setView([43.5, 43.0], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(this.maps.migration);

        // Add migration paths
        this.addMigrationPaths();

        // Update legend
        const legend = document.getElementById('migrationLegend');
        if (legend) {
            const pathCount = this.countMigrationPaths();
            legend.innerHTML = `
                <strong>Migration Paths</strong><br>
                <div style="margin-top: 8px;">
                    <span style="display: inline-block; width: 30px; height: 3px; background: var(--male-color); vertical-align: middle;"></span>
                    <span style="margin-left: 4px; font-size: 0.85rem;">Pre → Main</span>
                </div>
                <div style="margin-top: 8px; font-size: 0.85rem; color: var(--text-secondary);">
                    ${pathCount} ${pathCount === 1 ? 'path' : 'paths'} shown
                </div>
            `;
        }
    }

    /**
     * Count families with migration paths
     */
    countMigrationPaths() {
        if (!this.data) return 0;
        return this.data.filter(family => {
            const mainCoords = this.getVillageCoordinates(family);
            const preCoords = this.getPreMigrationCoordinates(family);
            return mainCoords && preCoords;
        }).length;
    }

    /**
     * Add migration path lines and markers
     */
    addMigrationPaths() {
        if (!this.data || this.data.length === 0) {
            console.log('⚠️ No data available for migration paths');
            return;
        }

        const migrations = [];
        
        this.data.forEach(family => {
            const mainCoords = this.getVillageCoordinates(family);
            const preCoords = this.getPreMigrationCoordinates(family);
            
            if (!mainCoords || !preCoords) return;
            
            // Check if coordinates are different (actual migration)
            if (mainCoords.lat === preCoords.lat && mainCoords.lng === preCoords.lng) {
                return;
            }
            
            migrations.push({
                family: family,
                from: preCoords,
                to: mainCoords,
                preVillage: family.location?.village?.pre?.english || 
                           family.location?.village?.pre?.native || 
                           family.location?.village?.pre?.russian || 'Unknown',
                mainVillage: this.getVillageName(family)
            });
        });

        console.log(`Found ${migrations.length} migration paths`);

        // Group migrations by path for better visualization
        const pathGroups = {};
        migrations.forEach(mig => {
            const key = `${mig.from.lat},${mig.from.lng}-${mig.to.lat},${mig.to.lng}`;
            if (!pathGroups[key]) {
                pathGroups[key] = {
                    from: mig.from,
                    to: mig.to,
                    preVillage: mig.preVillage,
                    mainVillage: mig.mainVillage,
                    families: []
                };
            }
            pathGroups[key].families.push(mig.family);
        });

        // Draw migration paths
        Object.values(pathGroups).forEach(group => {
            const familyCount = group.families.length;
            
            // Draw curved line (polyline with offset)
            const latlngs = [
                [group.from.lat, group.from.lng],
                [group.to.lat, group.to.lng]
            ];
            
            const line = L.polyline(latlngs, {
                color: 'var(--male-color)',
                weight: Math.min(2 + familyCount, 8),
                opacity: 0.6,
                dashArray: '10, 5'
            }).addTo(this.maps.migration);
            
            // Add arrow decorator
            const midPoint = [
                (group.from.lat + group.to.lat) / 2,
                (group.from.lng + group.to.lng) / 2
            ];
            
            // Bind popup to line
            line.bindPopup(`
                <div>
                    <strong>Migration Path</strong><br>
                    <span style="font-size: 0.85rem;">
                        From: ${group.preVillage}<br>
                        To: ${group.mainVillage}<br>
                        Families: ${familyCount}
                    </span>
                </div>
            `);
            
            // Add markers at start and end
            L.circleMarker([group.from.lat, group.from.lng], {
                radius: 5,
                fillColor: '#ffc107',
                color: 'white',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(this.maps.migration)
              .bindPopup(`<strong>${group.preVillage}</strong><br>Origin`);
            
            L.circleMarker([group.to.lat, group.to.lng], {
                radius: 6,
                fillColor: 'var(--male-color)',
                color: 'white',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.9
            }).addTo(this.maps.migration)
              .bindPopup(`<strong>${group.mainVillage}</strong><br>Current location`);
        });

        console.log(`✅ Added ${Object.keys(pathGroups).length} migration path groups`);
    }

    /**
     * Initialize Y-DNA Distribution Map
     */
    initializeYDNAMap() {
        console.log('🧬 Initializing Y-DNA Distribution Map...');

        this.maps.ydna = L.map('ydnaMap').setView([43.5, 43.0], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(this.maps.ydna);

        // Display Y-DNA data
        this.updateDNADistribution('ydna', this.maps.ydna, 'ydnaLegend');
    }

    /**
     * Initialize mtDNA Distribution Map
     */
    initializeMtDNAMap() {
        console.log('🧬 Initializing mtDNA Distribution Map...');

        this.maps.mtdna = L.map('mtdnaMap').setView([43.5, 43.0], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(this.maps.mtdna);

        // mtDNA data will be incorporated later
        const legend = document.getElementById('mtdnaLegend');
        if (legend) {
            legend.innerHTML = `
                <strong>mtDNA Distribution</strong><br>
                <span style="font-size: 0.85rem; color: var(--text-secondary);">Data coming soon...</span>
            `;
        }
    }

    /**
     * Update DNA distribution display
     * @param {string} dnaType - 'ydna' or 'mtdna'
     * @param {Object} map - Leaflet map instance
     * @param {string} legendId - Legend element ID
     */
    updateDNADistribution(dnaType, map, legendId) {
        console.log(`Updating DNA distribution for ${dnaType}`);
        
        // Clear existing markers
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Group families by subclade
        const subclades = {};
        const fieldName = dnaType === 'ydna' ? 'yDnaHaplogroup' : 'mtDnaHaplogroup';
        let familyIndex = 0;

        this.allData.forEach(family => {
            const haplogroup = family[fieldName];
            if (!haplogroup || !haplogroup.root) return;

            const coords = family.location?.coordinates?.main;
            if (!coords || !coords.latitude || !coords.longitude) return;

            const subclade = haplogroup.subclade || haplogroup.clade || haplogroup.root;

            if (!subclades[subclade]) {
                subclades[subclade] = {
                    count: 0,
                    color: HaplotypeConfig.getYSubcladeColor(subclade, familyIndex),
                    families: []
                };
                familyIndex++;
            }

            subclades[subclade].count++;
            subclades[subclade].families.push({
                family,
                coords,
                subclade
            });
        });

        // Calculate dynamic circle radius based on number of families
        // Base radius of 8, scales down as more families are added
        const totalFamilies = Object.values(subclades).reduce((sum, g) => sum + g.count, 0);
        const baseRadius = 8;
        const radius = totalFamilies < 50 ? baseRadius : 
                      totalFamilies < 200 ? baseRadius * 0.8 : 
                      totalFamilies < 500 ? baseRadius * 0.6 : 
                      baseRadius * 0.5;

        // Add circle markers for each family
        Object.entries(subclades).forEach(([subclade, data]) => {
            data.families.forEach(({ family, coords }) => {
                // Create circle marker with subclade color
                const marker = L.circleMarker([coords.latitude, coords.longitude], {
                    radius: radius,
                    fillColor: data.color,
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map);

                // Create popup content
                const familyName = family.familyName.main.english || family.familyName.main.russian || family.familyName.main.native;
                
                // Build location string with Native | Russian | English
                const locationParts = [];
                const village = family.location.village?.main;
                const region = family.location.region?.main;
                const state = family.location.state?.main;
                
                // Get the best available location (village > region > state)
                const locationObj = village || region || state;
                
                if (locationObj) {
                    if (locationObj.native) locationParts.push(locationObj.native);
                    if (locationObj.russian) locationParts.push(locationObj.russian);
                    if (locationObj.english) locationParts.push(locationObj.english);
                }
                
                const location = locationParts.length > 0 ? locationParts.join(' | ') : 'Unknown';
                
                marker.bindPopup(`
                    <div style="min-width: 200px;">
                        <strong>${familyName}</strong><br>
                        <span style="color: ${data.color}; font-weight: bold;">${subclade}</span><br>
                        <small>${location}</small><br>
                        <small style="color: var(--text-secondary);">${family.gender === 'male' ? '♂' : '♀'} ${family.date}</small>
                    </div>
                `);
            });
        });

        // Update legend
        const legend = document.getElementById(legendId);
        if (legend) {
            const totalFamilies = Object.values(subclades).reduce((sum, g) => sum + g.count, 0);
            
            let legendHTML = `<strong>${dnaType === 'ydna' ? 'Y-DNA' : 'mtDNA'} Distribution</strong><br>`;
            legendHTML += `<div style="font-size: 0.85rem; color: var(--text-secondary); margin: 8px 0;">${totalFamilies} ${totalFamilies === 1 ? 'family' : 'families'}</div>`;
            
            // Sort by count descending
            const sorted = Object.entries(subclades).sort((a, b) => b[1].count - a[1].count);
            
            sorted.forEach(([subclade, data]) => {
                legendHTML += `
                    <div style="margin-top: 6px; display: flex; align-items: center; font-size: 0.9rem;">
                        <span style="display: inline-block; width: 12px; height: 12px; background: ${data.color}; border-radius: 50%; margin-right: 8px; border: 2px solid #fff;"></span>
                        <span><strong>${subclade}</strong> (${data.count})</span>
                    </div>
                `;
            });

            legend.innerHTML = legendHTML;
        }
    }

    /**
     * Initialize Historical Territories Map
     */
    initializeTerritoriesMap() {
        console.log('🏛️ Initializing Historical Territories Map...');

        this.maps.territories = L.map('territoriesMap').setView([43.5, 43.0], 7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(this.maps.territories);

        const legend = document.getElementById('territoriesLegend');
        if (legend) {
            legend.innerHTML = `
                <strong>Historical Territories</strong><br>
                <span style="font-size: 0.85rem; color: var(--text-secondary);">Overlays coming soon...</span>
            `;
        }
    }
}

// Initialize maps when DOM is ready
window.heritageMaps = new HeritageMaps();
