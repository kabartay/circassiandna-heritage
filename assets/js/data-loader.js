/**
 * Data Loader - FIXED: No duplicate data
 * Only loads from JSON file - single source of truth
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
            
            const response = await fetch(`${this.basePath}data/heritage-data.json?v=${Date.now()}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Handle different JSON structures
            this.heritageData = data.families || data || [];
            
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
            const url = `${this.basePath}data/config.json?v=${Date.now()}`;
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
                    <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #ffc107; border: none; border-radius: 5px; cursor: pointer;">
                        🔄 Retry
                    </button>
                </div>
            `;
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
                familyNameEnglish: "DEMO Family",
                familyNameNative: "DEMO Фамилия",
                familyNameRussian: "DEMO Фамилия",
                village: "DEMO Village",
                ethnicity_sub: "Abdzakh",
                yDnaHaplogroup: "DEMO",
                yDnaSubclade: "DEMO",
                yDnaTerminalSnp: "DEMO",
                mtDnaHaplogroup: "DEMO",
                mtDnaSubclade: "DEMO",
                mtDnaTerminalSnp: "DEMO"
            }
            // That's it! No more data here!
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
                version: "1.3.0"
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
            if (!family.ethnicity_sub) return false;
            const familyEth = family.ethnicity_sub.toLowerCase();
            const filterEth = ethnicity.toLowerCase();
            // Match if ethnicity starts with the filter key
            return familyEth === filterEth || familyEth.startsWith(filterEth);
        });
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
        const ethnicities = [...new Set(this.heritageData.map(f => f.ethnicity_sub).filter(Boolean))].length;

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
                family.familyNameRussian,
                family.familyNameNative,
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

// Make DataLoader available globally
if (typeof window !== 'undefined') {
    window.DataLoader = DataLoader;
    console.log('✅ DataLoader class registered globally');
}