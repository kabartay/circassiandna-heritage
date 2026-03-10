/**
 * Data Loader - FIXED: No duplicate data
 * Only loads from JSON file - single source of truth
 */

/** Single source of truth for the config/YAML cache version. Bump on every release. */
const CONFIG_VERSION = '4.0.0';

class DataLoader {
    constructor() {
        this.heritageData = null;
        this.config = null;
        this.ethnicityMapping = null;
        this.villageMapping = null;
        this.locationMapping = null;
        this.villageIndex = null;   // flat: russianVillageName → {names, coordinates}
        this.stateIndex   = null;   // flat: russianStateName             → {names}
        this.regionIndex  = null;   // composite: "state::region" (Russian) → {names}
        this.basePath = this.getBasePath();
        this.configVersion = CONFIG_VERSION;  // Stable: bump CONFIG_VERSION with releases to invalidate YAML/config cache
        this.dataVersion   = Date.now(); // Dynamic: always fresh for heritage-data.json

        console.log('📁 DataLoader initialized with base path:', this.basePath);
    }

    /**
     * Get base path for different environments
     */
    getBasePath() {
        const hostname = window.location.hostname;
        
        if (hostname.endsWith('.github.io')) {
            // Dynamically get repo name from URL path
            const pathParts = window.location.pathname.split('/').filter(Boolean);
            return pathParts.length > 0 ? `/${pathParts[0]}/` : '/';
        } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return './';
        } else {
            return './';
        }
    }

    /**
     * Load heritage data - ONLY from JSON file
     */
    async loadHeritageData() {
        if (this.heritageData) {
            return this.heritageData;
        }

        try {
            console.log('🔄 Loading data from:', `${this.basePath}data/heritage-data.json`);
            
            // Load all mappings first
            await Promise.all([
                this.loadEthnicityMapping(),
                this.loadVillageMapping(),
                this.loadLocationMapping()
            ]);
            
            // Use timestamp for cache busting
            const response = await fetch(`${this.basePath}data/heritage-data.json?v=${this.dataVersion}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Normalize to array regardless of JSON structure
            const families = Array.isArray(data.families) ? data.families
                           : Array.isArray(data)          ? data
                           : [];

            // Enrich each family with ethnicity translations and location data
            this.heritageData = families.map(family => this.enrichFamilyData(family));
            
            console.log(`✅ Loaded ${this.heritageData.length} heritage records from JSON`);
            return this.heritageData;
            
        } catch (error) {
            console.error('❌ Failed to load data:', error.message);
            
            // Show error state in UI
            this.heritageData = [];
            this.showDataLoadError();
            
            return this.heritageData;
        }
    }

    /**
     * Load configuration
     */
    async loadConfig() {
        if (this.config) {
            return this.config;
        }

        try {
            const url = `${this.basePath}config/app-config.json?v=${this.configVersion}`;
            console.log('🔄 Loading config from:', url);

            const response = await fetch(url);

            if (response.ok) {
                this.config = await response.json();
                console.log('✅ Configuration loaded');
                return this.config;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.warn('⚠️ Config not found, using defaults');
            this.config = this.getDefaultConfig();
            return this.config;
        }
    }

    /**
     * Load ethnicity mapping from YAML
     */
    async loadEthnicityMapping() {
        if (this.ethnicityMapping) {
            return this.ethnicityMapping;
        }

        try {
            const url = `${this.basePath}config/mapping-ethnicities.yaml?v=${this.configVersion}`;
            console.log('🔄 Loading ethnicity mapping from:', url);

            const response = await fetch(url);

            if (response.ok) {
                const yamlText = await response.text();
                this.ethnicityMapping = jsyaml.load(yamlText);
                console.log('✅ Ethnicity mapping loaded');
                return this.ethnicityMapping;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Failed to load ethnicity mapping:', error);
            this.ethnicityMapping = { main_ethnicities: {}, sub_ethnicities: {} };
            return this.ethnicityMapping;
        }
    }

    /**
     * Load village mapping from YAML
     */
    async loadVillageMapping() {
        if (this.villageMapping) {
            return this.villageMapping;
        }

        try {
            const url = `${this.basePath}config/mapping-villages.yaml?v=${this.configVersion}`;
            console.log('🔄 Loading village mapping from:', url);

            const response = await fetch(url);

            if (response.ok) {
                const yamlText = await response.text();
                this.villageMapping = jsyaml.load(yamlText);
                this.buildVillageIndex();
                console.log('✅ Village mapping loaded');
                return this.villageMapping;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Failed to load village mapping:', error);
            this.villageMapping = { states: {} };
            return this.villageMapping;
        }
    }

    /**
     * Load location mapping from YAML (states → regions with per-ethnicity names)
     */
    async loadLocationMapping() {
        if (this.locationMapping) {
            return this.locationMapping;
        }

        try {
            const url = `${this.basePath}config/mapping-locations.yaml?v=${this.configVersion}`;
            console.log('🔄 Loading location mapping from:', url);

            const response = await fetch(url);

            if (response.ok) {
                const yamlText = await response.text();
                this.locationMapping = jsyaml.load(yamlText);
                this.buildLocationIndex();
                console.log('✅ Location mapping loaded');
                return this.locationMapping;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Failed to load location mapping:', error);
            this.locationMapping = { states: {} };
            return this.locationMapping;
        }
    }

    /**
     * Build a flat village index from the hierarchical mapping-villages.yaml.
     * Key: Russian village name  →  { names: {English, Circassian, ...}, coordinates: {Latitude, Longitude} }
     */
    buildVillageIndex() {
        this.villageIndex = {};
        const states = this.villageMapping?.states;
        if (!states) return;

        for (const stateData of Object.values(states)) {
            for (const regionData of Object.values(stateData.regions || {})) {
                for (const [villageName, villageData] of Object.entries(regionData.villages || {})) {
                    if (!villageData) continue; // skip incomplete YAML entries
                    // villageName is the Russian key
                    this.villageIndex[villageName] = {
                        names:       villageData.name        || {},
                        coordinates: villageData.coordinates || {}
                    };
                }
            }
        }
        console.log(`📍 Village index built: ${Object.keys(this.villageIndex).length} entries`);
    }

    /**
     * Build flat state and region indexes from mapping-locations.yaml.
     * stateIndex  key: Russian state name              → { names }
     * regionIndex key: "state::region" (Russian names) → { names }
     *   Composite key avoids collisions where two states share a region name
     *   (e.g. 'Ногайский район' exists in both KCR and Dagestan).
     */
    buildLocationIndex() {
        this.stateIndex  = {};
        this.regionIndex = {};
        const states = this.locationMapping?.states;
        if (!states) return;

        for (const [stateName, stateData] of Object.entries(states)) {
            this.stateIndex[stateName] = { names: stateData.name || {} };
            for (const [regionName, regionData] of Object.entries(stateData.regions || {})) {
                const compositeKey = `${stateName}::${regionName}`;
                this.regionIndex[compositeKey] = { names: regionData.name || {} };
            }
        }
        console.log(`🗺️ Location index built: ${Object.keys(this.stateIndex).length} states, ${Object.keys(this.regionIndex).length} regions`);
    }

    /**
     * Get village information from the flat villageIndex.
     * @param {string} russianVillageName - Russian village name (JSON key)
     * @param {string} ethnicity - Main English ethnicity (e.g. 'Circassian') for native name
     * @returns {{ russian, native, english, latitude, longitude }}
     */
    getVillageInfo(russianVillageName, ethnicity = null) {
        const empty = { russian: null, native: null, english: null, latitude: null, longitude: null };
        if (!russianVillageName) return empty;

        const entry = this.villageIndex?.[russianVillageName];
        if (!entry) return { ...empty, russian: russianVillageName };

        return {
            russian:   entry.names.Russian   || russianVillageName,
            native:    ethnicity ? (entry.names[ethnicity] || null) : null,
            english:   entry.names.English   || null,
            latitude:  entry.coordinates.Latitude  ?? null,
            longitude: entry.coordinates.Longitude ?? null
        };
    }

    /**
     * Get ethnicity translations from mapping
     * @param {string} mainEthnicity - Main ethnicity English name
     * @param {string} subGroup - Sub-group English name (optional)
     * @param {string} gender - 'male' or 'female' (for gender-specific Russian)
     * @returns {object} - Object with russian and native translations
     */
    getEthnicityTranslation(mainEthnicity, subGroup = null, gender = 'male') {
        if (!this.ethnicityMapping) {
            return { russian: null, native: null };
        }

        if (subGroup) {
            // Get sub-group translation
            const subGroups = this.ethnicityMapping.sub_ethnicities?.[mainEthnicity];
            if (subGroups && subGroups[subGroup]) {
                const translation = subGroups[subGroup];
                return {
                    russian: gender === 'female' && translation.russian_female ? translation.russian_female : translation.russian,
                    native: translation.native
                };
            }
        } else {
            // Get main ethnicity translation
            const mainEth = this.ethnicityMapping.main_ethnicities?.[mainEthnicity];
            if (mainEth) {
                return {
                    russian: gender === 'female' && mainEth.russian_female ? mainEth.russian_female : mainEth.russian,
                    native: mainEth.native
                };
            }
        }

        return { russian: null, native: null };
    }

    /**
     * Enrich family data with ethnicity and location translations
     * @param {object} family - Family object with English-only ethnicity and Russian-only location strings (expanded at runtime)
     * @returns {object} - Family object with enriched translations (including locations) and coordinates
     */
    enrichFamilyData(family) {
        // Enrich ethnicity
        if (family.ethnicity) {
            // Enrich main ethnicity
            if (family.ethnicity.main) {
                const mainEng = family.ethnicity.main.english;
                if (mainEng) {
                    const translation = this.getEthnicityTranslation(mainEng, null, family.gender);
                    family.ethnicity.main.russian = translation.russian;
                    family.ethnicity.main.native = translation.native;

                    // Enrich main sub-group
                    if (family.ethnicity.main.sub && family.ethnicity.main.sub.english) {
                        const subEng = family.ethnicity.main.sub.english;
                        const subTranslation = this.getEthnicityTranslation(mainEng, subEng, family.gender);
                        family.ethnicity.main.sub.russian = subTranslation.russian;
                        family.ethnicity.main.sub.native = subTranslation.native;
                    }
                }
            }

            // Enrich pre ethnicity
            if (family.ethnicity.pre) {
                const preEng = family.ethnicity.pre.english;
                if (preEng) {
                    const translation = this.getEthnicityTranslation(preEng, null, family.gender);
                    family.ethnicity.pre.russian = translation.russian;
                    family.ethnicity.pre.native = translation.native;

                    // Enrich pre sub-group
                    if (family.ethnicity.pre.sub && family.ethnicity.pre.sub.english) {
                        const subEng = family.ethnicity.pre.sub.english;
                        const subTranslation = this.getEthnicityTranslation(preEng, subEng, family.gender);
                        family.ethnicity.pre.sub.russian = subTranslation.russian;
                        family.ethnicity.pre.sub.native = subTranslation.native;
                    }
                }
            }
        }

        // Enrich location from YAML indexes.
        // JSON now stores plain Russian strings; we expand them into {russian, native, english} objects
        // and add a coordinates block derived from the village mapping.
        if (family.location) {
            const ethnicity = family.ethnicity?.main?.english || null;

            // Helper: extract plain Russian string from a simple-format or already-enriched field
            const toRussian = (val) => {
                if (!val) return null;
                if (typeof val === 'string') return val || null;
                return val.russian || null;
            };

            // Helper: look up state/region names by Russian key
            const enrichState = (russianName) => {
                if (!russianName) return { russian: null, native: null, english: null };
                const entry = this.stateIndex?.[russianName];
                if (!entry) return { russian: russianName, native: null, english: null };
                return {
                    russian: entry.names.Russian || russianName,
                    native:  ethnicity ? (entry.names[ethnicity] || null) : null,
                    english: entry.names.English  || null
                };
            };

            const enrichRegion = (russianName, russianState) => {
                if (!russianName) return { russian: null, native: null, english: null };
                // Look up by composite "state::region" key to avoid collisions
                // (e.g. 'Ногайский район' appears in both KCR and Dagestan).
                const compositeKey = russianState ? `${russianState}::${russianName}` : null;
                const entry = compositeKey ? this.regionIndex?.[compositeKey] : null;
                if (!entry) return { russian: russianName, native: null, english: null };
                return {
                    russian: entry.names.Russian || russianName,
                    native:  ethnicity ? (entry.names[ethnicity] || null) : null,
                    english: entry.names.English  || null
                };
            };

            const mainVillage = toRussian(family.location.village?.main);
            const preVillage  = toRussian(family.location.village?.pre);
            const mainRegion  = toRussian(family.location.region?.main);
            const preRegion   = toRussian(family.location.region?.pre);
            const mainState   = toRussian(family.location.state?.main);
            const preState    = toRussian(family.location.state?.pre);

            // Expand villages (get native/english/coords from index)
            const mainVillageInfo = this.getVillageInfo(mainVillage, ethnicity);
            const preVillageInfo  = this.getVillageInfo(preVillage,  ethnicity);

            family.location.village = {
                main: { russian: mainVillageInfo.russian, native: mainVillageInfo.native, english: mainVillageInfo.english },
                pre:  { russian: preVillageInfo.russian,  native: preVillageInfo.native,  english: preVillageInfo.english  }
            };

            family.location.region = {
                main: enrichRegion(mainRegion, mainState),
                pre:  enrichRegion(preRegion,  preState)
            };

            family.location.state = {
                main: enrichState(mainState),
                pre:  enrichState(preState)
            };

            family.location.coordinates = {
                main: { latitude: mainVillageInfo.latitude, longitude: mainVillageInfo.longitude },
                pre:  { latitude: preVillageInfo.latitude,  longitude: preVillageInfo.longitude  }
            };
        }

        return family;
    }

    /**
     * Show data loading error to user
     */
    showDataLoadError() {
        const feedContent = document.getElementById('feedContent');
        if (feedContent && feedContent.children.length === 0) {
            feedContent.innerHTML = `
                <div style="text-align: center; padding: 60px; background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; margin: 20px;">
                    <h3>📊 Unable to Load Heritage Data</h3>
                    <p>The heritage data could not be loaded. This might be because:</p>
                    <ul style="text-align: left; display: inline-block; margin: 20px 0;">
                        <li>The data file is missing or moved</li>
                        <li>You're viewing the file locally without a server</li>
                        <li>Network issues preventing data loading</li>
                    </ul>
                    <p><strong>To fix this:</strong></p>
                    <p>1. Ensure <code>data/heritage-data.json</code> exists</p>
                    <p>2. For local testing, use: <code>python -m http.server 8000</code></p>
                    <p>3. Check the browser console for specific errors</p>
                    <button id="retryDataLoadBtn" class="retry-btn">
                        🔄 Retry
                    </button>
                </div>
            `;

            // Attach event listener programmatically
            const retryBtn = document.getElementById('retryDataLoadBtn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    window.location.reload();
                });
            }

        }
    }

    /**
     * OPTIONAL: Minimal demo data for development ONLY
     * Only 1-2 items, NOT the entire dataset!
     */
    getMinimalDemoData() {
        console.warn('⚠️ Using minimal demo data - for development only!');
        return [
            {
                id: "DEMO-001",
                date: "2020-01-01",
                gender: "male",
                familyName: {
                    native: "DEMO Фамилия",
                    english: "DEMO Family",
                    russian: "DEMO Фамилия"
                },
                ethnicity: {
                    main: {
                        native: "Адыгэ",
                        english: "Circassian",
                        russian: "Черкес",
                        sub: {
                            native: "Абдзах",
                            english: "Abdzakh",
                            russian: "Абадзехи"
                        }
                    },
                    pre: {
                        native: null,
                        english: null,
                        russian: null,
                        sub: { native: null, english: null, russian: null }
                    }
                },
                location: {
                    coordinates: {
                        main: { latitude: null, longitude: null },
                        pre: { latitude: null, longitude: null }
                    },
                    village: {
                        main: { native: "DEMO Village", russian: null, english: null },
                        pre: { native: null, russian: null, english: null }
                    },
                    region: {
                        main: { native: null, russian: null, english: null },
                        pre: { native: null, russian: null, english: null }
                    },
                    state: {
                        main: { native: null, russian: null, english: null },
                        pre: { native: null, russian: null, english: null }
                    }
                },
                yDnaHaplogroup: {
                    root: "R",
                    clade: "DEMO",
                    subclade: "DEMO",
                    terminalSnp: "DEMO",
                    SnpList: null
                },
                mtDnaHaplogroup: {
                    root: null,
                    clade: "DEMO",
                    subclade: "DEMO",
                    terminalSnp: "DEMO",
                    SnpList: null
                },
                urls: {
                    yDnaClassicTree: null,
                    yDnaTimeTree: null,
                    yDnaGroupTree: null,
                    mtDnaClassicTree: null,
                    mtDnaTimeTree: null,
                    mtDnaGroupTree: null,
                    fullReport: null,
                    relations: null
                },
                metadata: {
                    lab: "FamilyTreeDNA"
                }
            }
        ];
    }

    /**
     * Default configuration
     */
    getDefaultConfig() {
        return {
            app: {
                title: "Circassian DNA",
                subtitle: "Genetic lineage and ancestral connections",
                version: CONFIG_VERSION
            },
            filters: {
                ethnicities: [
                    { key: "all", label: "All Families", active: true },
                    { key: "abdzakh", label: "Abdzakh", active: false },
                    { key: "abkhazian", label: "Abkhazian", active: false },
                    { key: "kabardian", label: "Kabardian", active: false },
                    { key: "shapsough", label: "Shapsough", active: false },
                    { key: "ubykh", label: "Ubykh", active: false }
                ]
            },
            sorting: {
                options: [
                    { value: "date-desc", label: "Date (Newest First)", default: true },
                    { value: "date-asc", label: "Date (Oldest First)", default: false },
                    { value: "name-asc", label: "Family Name (A-Z)", default: false },
                    { value: "name-desc", label: "Family Name (Z-A)", default: false }
                ]
            },
            pagination: {
                resultsPerPage: 4
            }
        };
    }

    /**
     * Get filtered data
     */
    getFilteredData(ethnicity = 'all') {
        if (!this.heritageData) {
            return [];
        }

        if (ethnicity === 'all') {
            return [...this.heritageData];
        }

        return this.heritageData.filter(family => {
            // Check both main ethnicity and sub-ethnicity
            const mainEthnicity = family.ethnicity?.main?.english;
            const subEthnicity = family.ethnicity?.main?.sub?.english;
            const oldEthnicity = family.ethnicity_sub; // backward compatibility
            
            const filterEth = ethnicity.toLowerCase();
            
            // Check main ethnicity (e.g., "Abkhazian")
            if (mainEthnicity && mainEthnicity.toLowerCase() === filterEth) {
                return true;
            }
            
            // Check sub-ethnicity (e.g., "Kabardian", "Shapsough")
            if (subEthnicity && subEthnicity.toLowerCase() === filterEth) {
                return true;
            }
            
            // Check old format for backward compatibility
            if (oldEthnicity && oldEthnicity.toLowerCase() === filterEth) {
                return true;
            }
            
            return false;
        });
    }
    
    /**
     * Multi-filter data by ethnicity, village, state, and clade (supports arrays + legacy single values)
     */
    getMultiFilteredData(filters = {}) {
        if (!this.heritageData) {
            return [];
        }
        
        return this.heritageData.filter(family => {
            // Ethnicity filter (hierarchical, supports arrays for multi-select)
            if (filters.ethnicities && filters.ethnicities.length > 0 && !filters.ethnicities.includes('all')) {
                const mainEthnicity = family.ethnicity?.main?.english;
                const subEthnicity = family.ethnicity?.main?.sub?.english;
                
                // Check if any selected ethnicity matches
                const hasMatch = filters.ethnicities.some(filterEth => {
                    const filterEthLower = filterEth.toLowerCase();
                    const mainMatch = mainEthnicity && mainEthnicity.toLowerCase() === filterEthLower;
                    const subMatch = subEthnicity && subEthnicity.toLowerCase() === filterEthLower;
                    return mainMatch || subMatch;
                });
                
                if (!hasMatch) {
                    return false;
                }
            }
            
            // Legacy single ethnicity filter (backward compatibility)
            if (filters.ethnicity && filters.ethnicity !== 'all') {
                const mainEthnicity = family.ethnicity?.main?.english;
                const subEthnicity = family.ethnicity?.main?.sub?.english;
                const filterEth = filters.ethnicity.toLowerCase();
                
                const mainMatch = mainEthnicity && mainEthnicity.toLowerCase() === filterEth;
                const subMatch = subEthnicity && subEthnicity.toLowerCase() === filterEth;
                
                if (!mainMatch && !subMatch) {
                    return false;
                }
            }
            
            // Village filter (supports arrays for multi-select)
            if (filters.villages && filters.villages.length > 0 && !filters.villages.includes('all')) {
                const villageNative = family.location?.village?.main?.native;
                const villageRussian = family.location?.village?.main?.russian;
                const villageEnglish = family.location?.village?.main?.english;
                
                const villageMatch = 
                    filters.villages.includes(villageNative) ||
                    filters.villages.includes(villageRussian) ||
                    filters.villages.includes(villageEnglish);
                
                if (!villageMatch) return false;
            }
            
            // State filter (supports arrays for multi-select)
            if (filters.states && filters.states.length > 0 && !filters.states.includes('all')) {
                const stateNative = family.location?.state?.main?.native;
                const stateRussian = family.location?.state?.main?.russian;
                const stateEnglish = family.location?.state?.main?.english;
                
                const stateMatch = 
                    filters.states.includes(stateNative) ||
                    filters.states.includes(stateRussian) ||
                    filters.states.includes(stateEnglish);
                
                if (!stateMatch) return false;
            }
            
            // Legacy single village filter (backward compatibility)
            if (filters.village && filters.village !== 'all') {
                const villageNative = family.location?.village?.main?.native;
                const villageRussian = family.location?.village?.main?.russian;
                const villageEnglish = family.location?.village?.main?.english;
                
                const villageMatch = 
                    villageNative === filters.village ||
                    villageRussian === filters.village ||
                    villageEnglish === filters.village;
                
                if (!villageMatch) return false;
            }
            
            // Legacy single state filter (backward compatibility)
            if (filters.state && filters.state !== 'all') {
                const stateNative = family.location?.state?.main?.native;
                const stateRussian = family.location?.state?.main?.russian;
                const stateEnglish = family.location?.state?.main?.english;
                
                const stateMatch = 
                    stateNative === filters.state ||
                    stateRussian === filters.state ||
                    stateEnglish === filters.state;
                
                if (!stateMatch) return false;
            }
            
            // Legacy Clade filter (backward compatibility)
            if (filters.clade && filters.clade !== 'all') {
                const hg = family.yDnaHaplogroup;
                const clade = typeof hg === 'object' ? hg.clade : hg;
                
                if (clade !== filters.clade) return false;
            }
            
            // Y-DNA Clade filter
            if (filters.yClade && filters.yClade !== 'all') {
                const yHg = family.yDnaHaplogroup;
                const yClade = typeof yHg === 'object' ? yHg.clade : yHg;
                
                if (yClade !== filters.yClade) return false;
            }
            
            // mtDNA Clade filter
            if (filters.mtClade && filters.mtClade !== 'all') {
                const mtHg = family.mtDnaHaplogroup;
                const mtClade = typeof mtHg === 'object' ? mtHg.clade : mtHg;
                
                if (mtClade !== filters.mtClade) return false;
            }
            
            return true;
        });
    }
    /**
     * Sort data with protection against invalid or future dates
     */
    sortData(data, sortType = 'date-desc') {
        if (!Array.isArray(data)) return [];

        const today = new Date();

        // Helper to safely parse date
        const parseDate = (d) => {
            const date = new Date(d);
            return isNaN(date) ? new Date('1970-01-01') : date;
        };

        const sortedData = [...data];

        switch (sortType) {
            case 'date-desc':
                return sortedData.sort((a, b) => {
                    const today = new Date();
                    const da = new Date(a.date || '1970-01-01');
                    const db = new Date(b.date || '1970-01-01');

                    // 🧠 Warn about future dates
                    if (da > today) console.warn(`⚠️ Future date detected: ${a.date} (ID: ${a.id || 'unknown'})`);
                    if (db > today) console.warn(`⚠️ Future date detected: ${b.date} (ID: ${b.id || 'unknown'})`);

                    // Treat future dates as today
                    return (db > today ? today : db) - (da > today ? today : da);
                });

            case 'date-asc':
                return sortedData.sort((a, b) => {
                    const today = new Date();
                    const da = new Date(a.date || '1970-01-01');
                    const db = new Date(b.date || '1970-01-01');

                    if (da > today) console.warn(`⚠️ Future date detected: ${a.date} (ID: ${a.id || 'unknown'})`);
                    if (db > today) console.warn(`⚠️ Future date detected: ${b.date} (ID: ${b.id || 'unknown'})`);

                    return (da > today ? today : da) - (db > today ? today : db);
                });

            case 'name-asc':
                return sortedData.sort((a, b) => {
                    const nameA = a.familyName?.main?.english || a.familyName?.english || a.familyNameEnglish || '';
                    const nameB = b.familyName?.main?.english || b.familyName?.english || b.familyNameEnglish || '';
                    return nameA.localeCompare(nameB);
                });

            case 'name-desc':
                return sortedData.sort((a, b) => {
                    const nameA = a.familyName?.main?.english || a.familyName?.english || a.familyNameEnglish || '';
                    const nameB = b.familyName?.main?.english || b.familyName?.english || b.familyNameEnglish || '';
                    return nameB.localeCompare(nameA);
                });

            default:
                return sortedData;
        }
    }

    /**
     * Get processed (filtered + sorted) data
     * @param {Object|string} filters - Filter object {ethnicity, village, state, clade} or legacy ethnicity string
     * @param {string} sortType - Sort type
     */
    getProcessedData(filters = 'all', sortType = 'date-desc') {
        // Handle legacy single ethnicity filter
        if (typeof filters === 'string') {
            filters = { ethnicity: filters };
        }
        
        const filtered = this.getMultiFilteredData(filters);
        return this.sortData(filtered, sortType);
    }

    /**
     * Get family by ID
     */
    getFamilyById(id) {
        if (!this.heritageData || !id) {
            return null;
        }
        return this.heritageData.find(family => family.id === id) || null;
    }
    
    /**
     * Get unique filter options from data
     */
    getFilterOptions() {
        if (!this.heritageData) {
            return { ethnicities: [], villages: [], states: [], yClades: [], mtClades: [] };
        }
        
        const ethnicityMap = new Map(); // main -> Set of subs
        const villages = new Set();
        const states = new Set();
        const yClades = new Set();
        const mtClades = new Set();
        
        this.heritageData.forEach(family => {
            // Ethnicity - build hierarchy
            const mainEth = family.ethnicity?.main?.english;
            const subEth = family.ethnicity?.main?.sub?.english;
            
            if (mainEth) {
                if (!ethnicityMap.has(mainEth)) {
                    ethnicityMap.set(mainEth, new Set());
                }
                if (subEth) {
                    ethnicityMap.get(mainEth).add(subEth);
                }
            }
            
            // Village (prefer native, fallback to russian, then english)
            const village = family.location?.village?.main?.native || 
                          family.location?.village?.main?.russian || 
                          family.location?.village?.main?.english;
            if (village) villages.add(village);
            
            // State (prefer english, fallback to russian, then native)
            const state = family.location?.state?.main?.english || 
                        family.location?.state?.main?.russian || 
                        family.location?.state?.main?.native;
            if (state) states.add(state);
            
            // Y-DNA Clade
            const yHg = family.yDnaHaplogroup;
            const yClade = typeof yHg === 'object' ? yHg.clade : yHg;
            if (yClade) yClades.add(yClade);
            
            // mtDNA Clade
            const mtHg = family.mtDnaHaplogroup;
            const mtClade = typeof mtHg === 'object' ? mtHg.clade : mtHg;
            if (mtClade) mtClades.add(mtClade);
        });
        
        // Build flat list with hierarchy info
        const ethnicities = [];
        const sortedMains = Array.from(ethnicityMap.keys()).sort();
        
        // Map ethnicity names to flag files
        const flagMap = {
            'abazin': 'abazin-flag.png',
            'abkhazian': 'abkhazian-flag.png',
            'balkar': 'balkaria-flag.png',
            'circassian': 'circassian-flag.png',
            'karachay': 'karachay-flag.jpg',
            'kumyk': 'kumyk-flag.png',
            'nogai': 'nogai-flag.png',
            'ossetian': 'ossetia-flag.png'
        };
        
        sortedMains.forEach(main => {
            // Add main ethnicity with flag file
            const flagFile = flagMap[main.toLowerCase()] || null;
            ethnicities.push({ 
                value: main.toLowerCase(), 
                label: main, 
                isMain: true,
                flag: flagFile
            });
            
            // Add sub-ethnicities
            const subs = Array.from(ethnicityMap.get(main)).sort();
            subs.forEach(sub => {
                ethnicities.push({ 
                    value: sub.toLowerCase(), 
                    label: sub,
                    isMain: false,
                    parent: main.toLowerCase()
                });
            });
        });
        
        return {
            ethnicities: ethnicities,
            villages: Array.from(villages).sort(),
            states: Array.from(states).sort(),
            yClades: Array.from(yClades).sort(),
            mtClades: Array.from(mtClades).sort()
        };
    }

    /**
     * Calculate statistics
     */
    calculateStatistics() {
        if (!this.heritageData || this.heritageData.length === 0) {
            return { totalProfiles: 0, yDnaHaplogroups: 0, villages: 0, ethnicities: 0 };
        }

        const yDnaHaplogroups = [...new Set(
            this.heritageData.map(f => {
                const hg = f.yDnaHaplogroup;
                if (typeof hg === 'string') return hg;
                if (typeof hg === 'object' && hg) return hg.clade || null;
                return null;
            }).filter(Boolean)
        )].length;
        
        const villages = [...new Set(
            this.heritageData.map(f => f.location?.village?.main?.native || f.village).filter(Boolean)
        )].length;
        
        const mtDnaHaplogroups = [...new Set(
            this.heritageData.map(f => {
                const hg = f.mtDnaHaplogroup;
                if (typeof hg === 'string') return hg;
                if (typeof hg === 'object' && hg) return hg.clade || null;
                return null;
            }).filter(Boolean)
        )].length;
        
        const ethnicities = [...new Set(
            this.heritageData.map(f => f.ethnicity?.main?.sub?.english || f.ethnicity_sub).filter(Boolean)
        )].length;

        return {
            totalProfiles: this.heritageData.length,
            yDnaHaplogroups,
            mtDnaHaplogroups,
            villages,
            ethnicities
        };
    }

    /**
     * Search families
     */
    searchFamilies(query) {
        if (!this.heritageData || !query) {
            return this.heritageData || [];
        }

        const lowerQuery = query.toLowerCase().trim();
        
        return this.heritageData.filter(family => {
            const searchFields = [
                // Family name (all languages)
                family.familyName?.main?.english,
                family.familyName?.main?.russian,
                family.familyName?.main?.native,
                family.familyName?.english,
                family.familyName?.russian,
                family.familyName?.native,
                family.familyNameEnglish,
                family.familyNameRussian,
                family.familyNameNative,
                // ID
                family.id,
                // Village (all languages)
                family.location?.village?.main?.native,
                family.location?.village?.main?.russian,
                family.location?.village?.main?.english,
                family.village,
                // State (all languages)
                family.location?.state?.main?.native,
                family.location?.state?.main?.russian,
                family.location?.state?.main?.english,
                // Region (all languages)
                family.location?.region?.main?.native,
                family.location?.region?.main?.russian,
                family.location?.region?.main?.english,
                // Ethnicity (all languages)
                family.ethnicity?.main?.english,
                family.ethnicity?.main?.russian,
                family.ethnicity?.main?.native,
                family.ethnicity?.main?.sub?.english,
                family.ethnicity?.main?.sub?.russian,
                family.ethnicity?.main?.sub?.native,
                family.ethnicity
            ];

            return searchFields.some(field => 
                field && field.toString().toLowerCase().includes(lowerQuery)
            );
        });
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.heritageData = null;
        this.config = null;
        console.log('🗑️ Cache cleared');
    }

    /**
     * Reload data
     */
    async reloadData() {
        this.clearCache();
        const [heritageData, config] = await Promise.all([
            this.loadHeritageData(),
            this.loadConfig()
        ]);
        return { heritageData, config };
    }
}

// Make DataLoader available globally
if (typeof window !== 'undefined') {
    window.DataLoader = DataLoader;
    console.log('✅ DataLoader class registered globally');
}