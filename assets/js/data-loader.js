/**
 * Data Loader - Fixed for Repository Structure
 * Always works with embedded fallback data
 */

class DataLoader {
    constructor() {
        this.heritageData = null;
        this.config = null;
        this.basePath = this.getBasePath();
        
        console.log('📁 DataLoader initialized with base path:', this.basePath);
    }

    /**
     * Get base path for different environments
     */
    getBasePath() {
        const hostname = window.location.hostname;
        
        if (hostname.includes('github.io')) {
            return '/circassiandna-heritage/';
        } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return './';
        } else {
            return './';
        }
    }

    /**
     * Load heritage data with guaranteed fallback
     */
    async loadHeritageData() {
        if (this.heritageData) {
            return this.heritageData;
        }

        // Try to load from external JSON first
        try {
            console.log('🔄 Attempting to load data from:', `${this.basePath}data/heritage-data.json`);
            
            const response = await fetch(`${this.basePath}data/heritage-data.json`);
            
            if (response.ok) {
                const data = await response.json();
                this.heritageData = data.families || data || [];
                console.log(`✅ Loaded ${this.heritageData.length} heritage records from JSON file`);
                return this.heritageData;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.warn('⚠️ Failed to load external data:', error.message);
            console.log('🔄 Using embedded fallback data...');
            
            // Always fall back to embedded data
            this.heritageData = this.getEmbeddedData();
            console.log(`✅ Loaded ${this.heritageData.length} heritage records from embedded data`);
            return this.heritageData;
        }
    }

    /**
     * Load configuration with fallback
     */
    async loadConfig() {
        if (this.config) {
            return this.config;
        }

        try {
            const response = await fetch(`${this.basePath}data/config.json`);
            
            if (response.ok) {
                this.config = await response.json();
                console.log('✅ Configuration loaded from JSON file');
                return this.config;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
            
        } catch (error) {
            console.warn('⚠️ Failed to load config:', error.message);
            this.config = this.getDefaultConfig();
            console.log('✅ Using default configuration');
            return this.config;
        }
    }

    /**
     * Embedded heritage data (always works)
     */
    getEmbeddedData() {
        return [
            {
                id: "CRC-2024-001",
                date: "2024-09-08",
                familyNameEnglish: "Shogenov",
                familyNameCircassian: "Шъогъэныкъо",
                village: "Nalchik",
                ethnicity: "Kabardian",
                yDnaHaplogroup: "G2a",
                yDnaSubclade: "G2a1a1b1a1a1c1a1a1a1a1",
                yDnaTerminalSnp: "FGC7535",
                mtDnaHaplogroup: "H1",
                mtDnaSubclade: "H1c3a",
                mtDnaTerminalSnp: "T16311C"
            },
            {
                id: "CRC-2024-002",
                date: "2024-09-07",
                familyNameEnglish: "Hatkov",
                familyNameCircassian: "Хьэтыкъо",
                village: "Maykop",
                ethnicity: "Adyghe",
                yDnaHaplogroup: "J2a",
                yDnaSubclade: "J2a1a1a2b2a1a1",
                yDnaTerminalSnp: "BY15058",
                mtDnaHaplogroup: "T2b",
                mtDnaSubclade: "T2b4h",
                mtDnaTerminalSnp: "A12308G"
            },
            {
                id: "CRC-2024-003",
                date: "2024-09-06",
                familyNameEnglish: "Pshekov",
                familyNameCircassian: "Пщэкъо",
                village: "Psebay",
                ethnicity: "Adyghe",
                yDnaHaplogroup: "I2a",
                yDnaSubclade: "I2a1a2b1a2a1a1a",
                yDnaTerminalSnp: "S17250",
                mtDnaHaplogroup: "K1a",
                mtDnaSubclade: "K1a4a1",
                mtDnaTerminalSnp: "T16224C"
            },
            {
                id: "CRC-2024-004",
                date: "2024-09-05",
                familyNameEnglish: "Berzegov",
                familyNameCircassian: "Бэрзэгъо",
                village: "Kislovodsk",
                ethnicity: "Kabardian",
                yDnaHaplogroup: "R1a",
                yDnaSubclade: "R1a1a1b1a2a3c1",
                yDnaTerminalSnp: "Y4459",
                mtDnaHaplogroup: "U5a",
                mtDnaSubclade: "U5a1b1",
                mtDnaTerminalSnp: "G13708A"
            },
            {
                id: "CRC-2024-005",
                date: "2024-09-04",
                familyNameEnglish: "Temirgoyev",
                familyNameCircassian: "Темыргъуей",
                village: "Afipsky",
                ethnicity: "Cherkess",
                yDnaHaplogroup: "G2a",
                yDnaSubclade: "G2a2b2a1a1c1a1a1a",
                yDnaTerminalSnp: "FGC7556",
                mtDnaHaplogroup: "J1c",
                mtDnaSubclade: "J1c5a",
                mtDnaTerminalSnp: "T16069C"
            },
            {
                id: "CRC-2024-006",
                date: "2024-09-03",
                familyNameEnglish: "Nasukhov",
                familyNameCircassian: "Насыхъо",
                village: "Chegem",
                ethnicity: "Kabardian",
                yDnaHaplogroup: "J1",
                yDnaSubclade: "J1a2a1a2d2a2b2",
                yDnaTerminalSnp: "BY139003",
                mtDnaHaplogroup: "H3",
                mtDnaSubclade: "H3g1",
                mtDnaTerminalSnp: "T16129A"
            },
            {
                id: "CRC-2024-007",
                date: "2024-09-02",
                familyNameEnglish: "Kardanov",
                familyNameCircassian: "Къэрдэн",
                village: "Tyrnyauz",
                ethnicity: "Kabardian",
                yDnaHaplogroup: "G2a",
                yDnaSubclade: "G2a2b2a1a1a1c1a1",
                yDnaTerminalSnp: "FGC1042",
                mtDnaHaplogroup: "W3",
                mtDnaSubclade: "W3a1",
                mtDnaTerminalSnp: "T16292C"
            },
            {
                id: "CRC-2024-008",
                date: "2024-09-01",
                familyNameEnglish: "Mizov",
                familyNameCircassian: "Мызо",
                village: "Teuchezhsky",
                ethnicity: "Adyghe",
                yDnaHaplogroup: "R1b",
                yDnaSubclade: "R1b1a1a2a1a2a1",
                yDnaTerminalSnp: "L21",
                mtDnaHaplogroup: "T1a",
                mtDnaSubclade: "T1a1a1",
                mtDnaTerminalSnp: "A4917G"
            }
        ];
    }

    /**
     * Default configuration
     */
    getDefaultConfig() {
        return {
            app: {
                title: "Circassian DNA Heritage Feed",
                subtitle: "Genetic lineage and ancestral connections",
                version: "1.0.0"
            },
            filters: {
                ethnicities: [
                    { key: "all", label: "All Families", active: true },
                    { key: "adyghe", label: "Adyghe", active: false },
                    { key: "kabardian", label: "Kabardian", active: false },
                    { key: "cherkess", label: "Cherkess", active: false }
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

        return this.heritageData.filter(family => 
            family.ethnicity && family.ethnicity.toLowerCase() === ethnicity.toLowerCase()
        );
    }

    /**
     * Sort data
     */
    sortData(data, sortType = 'date-desc') {
        if (!Array.isArray(data)) {
            return [];
        }

        const sortedData = [...data];

        switch (sortType) {
            case 'date-desc':
                return sortedData.sort((a, b) => new Date(b.date || '1970-01-01') - new Date(a.date || '1970-01-01'));
            case 'date-asc':
                return sortedData.sort((a, b) => new Date(a.date || '1970-01-01') - new Date(b.date || '1970-01-01'));
            case 'name-asc':
                return sortedData.sort((a, b) => (a.familyNameEnglish || '').localeCompare(b.familyNameEnglish || ''));
            case 'name-desc':
                return sortedData.sort((a, b) => (b.familyNameEnglish || '').localeCompare(a.familyNameEnglish || ''));
            default:
                return sortedData;
        }
    }

    /**
     * Get processed data with filtering and sorting
     */
    getProcessedData(ethnicity = 'all', sortType = 'date-desc') {
        const filtered = this.getFilteredData(ethnicity);
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
     * Calculate statistics
     */
    calculateStatistics() {
        if (!this.heritageData || this.heritageData.length === 0) {
            return { totalProfiles: 0, yDnaHaplogroups: 0, villages: 0, ethnicities: 0 };
        }

        const yDnaHaplogroups = [...new Set(this.heritageData.map(f => f.yDnaHaplogroup).filter(Boolean))].length;
        const villages = [...new Set(this.heritageData.map(f => f.village).filter(Boolean))].length;
        const ethnicities = [...new Set(this.heritageData.map(f => f.ethnicity).filter(Boolean))].length;

        return {
            totalProfiles: this.heritageData.length,
            yDnaHaplogroups,
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
                family.familyNameEnglish,
                family.familyNameCircassian,
                family.id,
                family.village,
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

// Make sure DataLoader is available globally
if (typeof window !== 'undefined') {
    window.DataLoader = DataLoader;
    console.log('✅ DataLoader class registered globally');
}