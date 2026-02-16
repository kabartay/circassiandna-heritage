/**
 * Statistics Module for Circassian DNA Heritage
 * Handles all data visualization using Chart.js
 */

/** FamilyTreeDNA color scheme
'r1c01': #795548;
'r1c02': #D50A12;
'r1c03': #FF631D;
'r1c04': #FFD22C;
'r1c05': #4DD92E;
'r1c06': #808000;
'r1c07': #1E8E00;
'r1c08': #2DBE60;
'r1c09': #33A6B8;
'r1c10': #1F63B5;
'r1c11': #8E24AA;
'r1c12': #C2185B;
'r1c13': #757575;



'r2c01': #A1887f;
'r2c02': #FF1744;
'r2c03': #FB8C00;
'r2c04': #FFEA00;
'r2c05': #64DD17;
'r2c06': #C0CA33;
'r2c07': #66BB6A;
'r2c08': #2ECC71;
'r2c09': #3DD5D8;
'r2c10': #2962FF;
'r2c11': #D500F9;
'r2c12': #F50057;
'r2c13': #CFCFCF;


'r3c01': #EDE8E6;
'r3c02': #E6A8AD;
'r3c03': #F2D19C;
'r3c04': #F6E7A8;
'r3c05': #C8F29D;
'r3c06': #D6E6A8;
'r3c07': #A5D6A7;
'r3c08': #B1C6B1;
'r3c09': #B2EBF2;
'r3c10': #BBDEFB;
'r3c11': #E1BEE7;
'r3c12': #F8BBD0;
'r3c13': #EEEEEE;
 */

class HeritageStatistics {
    constructor() {
        this.charts = {};
        this.data = null;
        this.initialized = false;
        
        // Predefined ethnicity color schema
        this.ethnicityColors = {
            'Circassian': '#24690a',
            'Abkhazian': '#c92d25',
            'Abazin': '#c92d25',
            'Balkar': '#009aff',
            'Karachay': '#009aff',
            'Noghay': '#32ccfe',
            'Kumyk': '#009fe3',
            'Crimean Tatar': '#00a4de',
            'Azerbaijan': '#00b5e2',
            'Ossetian': '#ffd800',
            'Ingush': '#4700b1',
            'Chechen': '#4700b1',
            'Dagestan': '#720088',
            'Georgian': '#063970',
            'Armenian': '#f2a800',
            'paleoDNA': '#8a6240'
        };

        // Predefined clade color schema (for Y-DNA), based on FamilyTreeDNA groups
        this.yDnaColors = {
            'C1a1': '#EDE8E6',
            'C1a2': '#EDE8E6',
            'C1b1': '#EDE8E6',
            'C1b2': '#EDE8E6',
            'C2a1': '#EDE8E6',
            'C2a2': '#EDE8E6',
            'C2b1': '#EDE8E6',
            'C2b2': '#EDE8E6',

            'E1a1': '#757575',
            'E1a2': '#757575',
            'E1b1': '#757575',
            'E1b2': '#757575',

            'G1a1': '#C0CA33',
            'G1a2': '#C0CA33',
            'G1b1': '#C8F29D',
            'G1b2': '#C8F29D',
            'G2a1': '#64DD17',
            'G2a2': '#2ECC71',
            'G2b1': '#A5D6A7',
            'G2b2': '#A5D6A7',

            'H1a1': '#808000',
            'H1a2': '#808000',
            'H1b1': '#808000',
            'H1b2': '#808000',
            'H2a1': '#808000',
            'H2a2': '#808000',
            'H2b1': '#808000',
            'H2b2': '#808000',

            'I1a1': '#FF631D',
            'I1a2': '#FF631D',
            'I1a3': '#FF631D',
            'I2a1': '#FB8C00',
            'I2b1': '#FB8C00',
            'I2b2': '#FB8C00',
            'I2a2': '#FFD22C',
            'I2c': '#FFD22C',

            'J1a1': '#B2EBF2',
            'J1a2': '#B2EBF2',
            'J1b1': '#B2EBF2',
            'J1b2': '#B2EBF2',
            'J2a1': '#33A6B8',
            'J2a2': '#2962FF',
            'J2b1': '#1F63B5',
            'J2b2': '#1F63B5',

            'L1a1': '#A1887f',
            'L1a2': '#A1887f',
            'L1b1': '#A1887f',
            'L1b2': '#A1887f',
            'L2': '#A1887f',
            'L2a1': '#A1887f',
            'L2a2': '#A1887f',

            'N1a1': '#F6E7A8',
            'N1a2': '#F6E7A8',
            'N1b1': '#F6E7A8',
            'N1b2': '#F6E7A8',
            
            'O1a1': '#FFD22C',
            'O1a2': '#FFD22C',
            'O1b1': '#FFD22C',
            'O1b2': '#FFD22C',
            'O2a1': '#FFD22C',
            'O2a2': '#FFD22C',
            'O2b1': '#FFD22C',
            'O2b2': '#FFD22C',
            'O3a1': '#FFD22C',
            'O3a2': '#FFD22C',
            'O3b1': '#FFD22C',
            'O3b2': '#FFD22C',

            'Q1a1': '#D500F9',
            'Q1a2': '#D500F9',
            'Q1b1': '#D500F9',
            'Q1b2': '#D500F9',
            'Q2a1': '#D500F9',
            'Q2a2': '#D500F9',
            'Q2b1': '#D500F9',
            'Q2b2': '#D500F9',

            'R1a1': '#E6A8AD',
            'R1a2': '#E6A8AD',
            'R1b1': '#E1BEE7',
            'R1b2': '#E1BEE7',
            'R2a1': '#D500F9',
            'R2a2': '#D500F9',
            'R2b1': '#D500F9',
            'R2b2': '#D500F9',

            'T1a1': '#795548',
            'T1a2': '#795548',
            'T1b1': '#795548',
            'T1b2': '#795548',
            
        };

        // Predefined subclade color schema (for Y-DNA), based on FamilyTreeDNA groups
        this.ySubcladeColors = {
            'C-M216': '#EDE8E6',
            'C-M217': '#EDE8E6',
            'C-M48': '#EDE8E6',
            'C-M86': '#EDE8E6',
            'C-F1918': '#EDE8E6',
            'C-F3830': '#EDE8E6',
            'C-F9992': '#EDE8E6',
            'C-F1067': '#EDE8E6',
            'C-V20': '#EDE8E6',
            'C-B477': '#EDE8E6',

            'E-M2': '#757575',
            'E-M35': '#757575',
            'E-M123': '#757575',
            'E-V13': '#757575',
            'E-V22': '#757575',
            
            'G-GG313': '#C0CA33',
            'G-GG349': '#C0CA33',
            'G-BY1124': '#C0CA33',
            'G-Z3353': '#C0CA33',

            'G-Z17774': '#C8F29D',
            'G-BY116538': '#C8F29D',

            'G-Z6553': '#64DD17',
            'G-Z6554': '#64DD17',
            'G-Z6638': '#64DD17',
            'G-Z6700': '#64DD17',
            'G-Z6702': '#64DD17',
            'G-Z7940': '#64DD17',
            'G-Z7941': '#64DD17',
            'G-Z7943': '#64DD17',
            'G-Z31459': '#64DD17',
            'G-Z31461': '#64DD17',
            'G-Z31463': '#64DD17',
            'G-Z45052': '#64DD17',
            'G-FGC672': '#64DD17',
            'G-FGC693': '#64DD17',
            'G-FGC713': '#64DD17',
            'G-FGC715': '#64DD17',
            'G-FGC719': '#64DD17',
            'G-FGC750': '#64DD17',
            'G-FGC1053': '#64DD17',
            'G-FGC1160': '#64DD17',
            'G-FGC3764': '#64DD17',
            'G-FGC3780': '#64DD17',
            'G-GG330': '#64DD17',
            'G-FT23146': '#64DD17',
            'G-FT19842': '#64DD17',

            'G-FGC5089': '#1E8E00',
            'G-FGC6662': '#1E8E00',
            'G-FGC6669': '#1E8E00',
            'G-M406': '#1E8E00',

            'G-CTS342': '#A5D6A7',
            'G-S10654': '#A5D6A7',
            'G-Z3440': '#A5D6A7',
            'G-FT8419': '#A5D6A7',

            'G-PH1780': '#66BB6A',
            'G-PH311': '#66BB6A',
            'G-FT32900': '#66BB6A',

            'G-FT55754': '#2DBE60',

            'G-L1264': '#2ECC71',
            'G-FGC21495': '#2ECC71',
            'G-S9409': '#2ECC71',
            'G-Y142068': '#2ECC71',
            'G-Z44145': '#2ECC71',
            'G-Z30715': '#2ECC71',
            'G-Z44151': '#2ECC71',
            'G-FTC88737': '#2ECC71',
            'G-Y142023': '#2ECC71',
            'G-FTB56229': '#2ECC71',
            'G-FT12999': '#2ECC71',
            'G-V7991': '#2ECC71',
            'G-Y112447': '#2ECC71',
            'G-MF104773': '#2ECC71',
            'G-FT9681': '#2ECC71',
            'G-Y32923': '#2ECC71',
            'G-FT49803': '#2ECC71',
            'G-Y32599': '#2ECC71',
            'G-FTA35887': '#2ECC71',
            'G-L654': '#2ECC71',

            'G-L13': '#B1C6B1',

            'G-PF3369': '#1E8E00',
            'G-PF3355': '#1E8E00',

            'H-M52': '#808000',
            'H-M69': '#808000',
            'H-M82': '#808000',

            'I-Z63': '#FF631D',
            'I-BY151': '#FF631D',
            'I-S2078': '#FF631D',
            'I-L1237': '#FF631D',

            'I-P37': '#FB8C00',
            'I-P214': '#FB8C00',
            'I-M223': '#FB8C00',
            'I-L621': '#FB8C00',
            'I-A427': '#FB8C00',
            'I-Y5382': '#FB8C00',
            'I-L1294': '#FB8C00',
            'I-S20602': '#FB8C00',
            'I-Y4460': '#FB8C00',
            'I-Y3106': '#FB8C00',
            'I-Z17855': '#FB8C00',
            'I-FT8688': '#FB8C00',
            'I-Y3548': '#FB8C00',

            'I-L596': '#FFD22C',
            'I-BY420': '#FFD22C',
            'I-A1143': '#FFD22C',
            'I-SK1270': '#FFD22C',

            'J-P58': '#3DD5D8',
            'J-Z1853': '#3DD5D8',
            'J-FGC11': '#3DD5D8',
            'J-YSC0000234': '#3DD5D8',
            'J-Z18292': '#3DD5D8',
            'J-L862': '#3DD5D8',

            'J-Z1828': '#B2EBF2',
            'J-Z1842': '#B2EBF2',
            'J-CTS1460': '#B2EBF2',
            'J-ZS3084': '#B2EBF2',
            'J-ZS3089': '#B2EBF2',
            'J-ZS3042': '#B2EBF2',
            'J-Z18436': '#B2EBF2',

            'J-L24': '#33A6B8',
            'J-L25': '#33A6B8',
            'J-L26': '#33A6B8',
            'J-L70': '#33A6B8',
            'J-Z387': '#33A6B8',
            'J-Z438': '#33A6B8',
            'J-Z7706': '#33A6B8',
            'J-PF5366': '#33A6B8',
            'J-FGC9883': '#33A6B8',
            'J-Z2227': '#33A6B8',
            'J-M67': '#33A6B8',
            'J-M92': '#33A6B8',
            'J-Z7671': '#33A6B8',
            'J-Z7675': '#33A6B8',
            'J-Y11200': '#33A6B8',
            'J-Y30812': '#33A6B8',
            'J-Y3612': '#33A6B8',
            'J-Y7702': '#33A6B8',
            'J-BY1147': '#33A6B8',
            'J-S12459': '#33A6B8',
            'J-CTS900': '#33A6B8',
            'J-Z500': '#33A6B8',
            'J-Z515': '#33A6B8',
            'J-M319': '#33A6B8',
            'J-P81': '#33A6B8',
            'J-Z6065': '#33A6B8',
            'J-Z7314': '#33A6B8',

            'J-SK1313': '#BBDEFB',
            'J-SK1317': '#BBDEFB',
            'J-SK1320': '#BBDEFB',
            'J-Z35834': '#BBDEFB',

            'J-L581': '#2962FF',
            'J-PF5016': '#2962FF',
            'J-PH1795': '#2962FF',
            'J-BY114993': '#2962FF',
            
            'J-Z1827': '#1F63B5',
            'J-M241': '#1F63B5',
            'J-M205': '#1F63B5',
            'J-L283': '#1F63B5',
            'J-Z1296': '#1F63B5',
            'J-Z2453': '#1F63B5',

            'L-M20': '#A1887f',
            'L-M22': '#A1887f',
            'L-M27': '#A1887f',
            'L-M317': '#A1887f',
            'L-M319': '#A1887f',
            'L-M357': '#A1887f',
            'L-SK1412': '#A1887f',
            'L-PH8': '#A1887f',
            'L-L595': '#A1887f',

            'N-TAT': '#F6E7A8',
            'N-M231': '#F6E7A8',
            'N-F2905': '#F6E7A8',
            'N-M1845': '#F6E7A8',
            'N-M2005': '#F6E7A8',
            'N-M2019': '#F6E7A8',
            'N-L550': '#F6E7A8',
            'N-A9407': '#F6E7A8',
            'N-PH1896': '#F6E7A8',

            'O-M122': '#FFD22C',
            'O-M175': '#FFD22C',
            'O-M324': '#FFD22C',
            'O-M134': '#FFD22C',

            'Q-L53': '#D500F9',
            'Q-L54': '#D500F9',
            'Q-M25': '#D500F9',
            'Q-Y4800': '#D500F9',
            'Q-Y11938': '#D500F9',
            'Q-BZ640': '#D500F9',
            'Q-L715': '#D500F9',
            'Q-L330': '#D500F9',
            'Q-Y2700': '#D500F9',
            'Q-SK1392': '#D500F9',
            'Q-SK1995': '#D500F9',

            'R-Z280': '#F8BBD0',
            'R-Z282': '#F8BBD0',
            'R-Z283': '#F8BBD0',
            'R-Z284': '#F8BBD0',
            'R-L664': '#F8BBD0',
            'R-M458': '#F8BBD0',
            'R-L1029': '#F8BBD0',
            'R-L260': '#F8BBD0',
            'R-CTS1211': '#F8BBD0',
            'R-CTS3402': '#F8BBD0',
            'R-Y33': '#F8BBD0',
            'R-Y2915': '#F8BBD0',
            'R-YP315': '#F8BBD0',
            'R-YP582': '#F8BBD0',
            'R-P278': '#F8BBD0',
            'R-Z92': '#F8BBD0',
            'R-Y5570': '#F8BBD0',

            'R-Z93': '#E6A8AD',
            'R-Z94': '#E6A8AD',
            'R-Z2122': '#E6A8AD',
            'R-Z2123': '#E6A8AD',
            'R-Z2124': '#E6A8AD',
            'R-Z2125': '#E6A8AD',
            'R-FGC82884': '#E6A8AD',
            'R-Y934': '#E6A8AD',
            'R-Y874': '#E6A8AD',
            'R-YP451': '#E6A8AD',
            'R-YP6354': '#E6A8AD',
            'R-YP449': '#E6A8AD',
            'R-YP450': '#E6A8AD',
            'R-YP457': '#E6A8AD',
            'R-FGC22480': '#E6A8AD',
            'R-Y7094': '#E6A8AD',
            'R-BY30762': '#E6A8AD',
            'R-BY60213': '#E6A8AD',
            'R-Y86480': '#E6A8AD',
            'R-L657': '#E6A8AD',
            'R-S23592': '#E6A8AD',
            'R-Y57': '#E6A8AD',
            'R-FGC4547': '#E6A8AD',

            'R-M269': '#E1BEE7',
            'R-M73': '#E1BEE7',
            'R-M478': '#E1BEE7',
            'R-L1432': '#E1BEE7',
            'R-L1433': '#E1BEE7',
            'R-L23': '#E1BEE7',
            'R-L51': '#E1BEE7',
            'R-Z2103': '#E1BEE7',
            'R-Z2106': '#E1BEE7',
            'R-Z2109': '#E1BEE7',
            'R-L584': '#E1BEE7',
            'R-M12149': '#E1BEE7',
            'R-Y4364': '#E1BEE7',
            'R-Y13369': '#E1BEE7',

            'R-M207': '#D500F9',
            
            'T-M70': '#795548',
            'T-Z709': '#795548',
            'T-L208': '#795548',
            'T-L131': '#795548',
            'T-L446': '#795548',
            'T-L454': '#795548',
            'T-L454': '#795548',
        }

    }

    /**
     * Initialize statistics module
     * @param {Array} heritageData - The heritage data from main app
     */
    async init(heritageData) {
        console.log('📊 Initializing Heritage Statistics...');
        this.data = heritageData;
        this.allData = heritageData; // Store original full dataset
        
        // Setup tab listener to initialize charts when Statistics tab is opened
        this.setupTabListener();
        
        this.initialized = true;
    }

    /**
     * Setup listener for Statistics tab activation
     */
    setupTabListener() {
        const statisticsTab = document.querySelector('[data-tab="statistics"]');
        if (statisticsTab) {
            statisticsTab.addEventListener('click', () => {
                // Delay chart creation to ensure DOM is ready
                setTimeout(() => {
                    if (!this.charts.yDna) {
                        // Always start with global data when first opening statistics
                        this.data = this.allData;
                        this.createAllCharts();
                    }
                }, 100);
            });
        }
    }

    /**
     * Update statistics with filtered data from feed
     * @param {Array} filteredData - Filtered heritage data
     */
    updateWithFilteredData(filteredData) {
        console.log(`📊 Updating statistics with ${filteredData.length} filtered families`);
        
        // If no filters applied (full dataset), use all data
        if (filteredData.length === this.allData.length) {
            this.data = this.allData;
        } else {
            this.data = filteredData;
        }
        
        // Refresh all charts if they exist
        if (this.charts.yDna) {
            this.updateAllCharts();
        }
    }

    /**
     * Create all statistics charts
     */
    createAllCharts() {
        console.log('🎨 Creating statistics charts...');
        
        this.createYDnaChart();
        this.createMtDnaChart();
        this.createYSubcladeChart();
        this.createMtSubcladeChart();
        this.createEthnicityChart();
        this.createVillageChart();
    }

    /**
     * Update all existing charts
     */
    updateAllCharts() {
        if (this.charts.yDna) this.updateYDnaChart();
        if (this.charts.mtDna) this.updateMtDnaChart();
        if (this.charts.ySubclade) this.updateYSubcladeChart();
        if (this.charts.mtSubclade) this.updateMtSubcladeChart();
        if (this.charts.ethnicity) this.updateEthnicityChart();
        if (this.charts.village) this.updateVillageChart();
    }

    /**
     * Get Y-DNA haplogroup distribution
     */
    getYDnaDistribution() {
        const distribution = {};
        let totalMales = 0;
        
        this.data.forEach(family => {
            if (family.gender === 'male') {
                totalMales++;
                // Use clade from yDnaHaplogroup object
                const clade = family.yDnaHaplogroup?.clade;
                if (clade && clade !== 'N/A' && clade !== '—') {
                    // Use full clade value (e.g., "G2a1", "R1a1")
                    distribution[clade] = (distribution[clade] || 0) + 1;
                }
            }
        });
        
        // Group by root haplogroup and sort
        const grouped = {};
        Object.entries(distribution).forEach(([clade, count]) => {
            const root = clade.charAt(0);
            if (!grouped[root]) grouped[root] = [];
            grouped[root].push([clade, count]);
        });
        
        // Calculate total for each root group
        const groupTotals = Object.entries(grouped).map(([root, clades]) => {
            const total = clades.reduce((sum, [, count]) => sum + count, 0);
            return [root, total];
        }).sort((a, b) => b[1] - a[1]);
        
        // Build final sorted distribution: groups by size, clades within group by count
        const sortedDistribution = {};
        groupTotals.forEach(([root]) => {
            grouped[root]
                .sort((a, b) => b[1] - a[1])
                .forEach(([clade, count]) => {
                    sortedDistribution[clade] = count;
                });
        });
        
        return { distribution: sortedDistribution, totalMales };
    }

    /**
     * Get mtDNA haplogroup distribution
     */
    getMtDnaDistribution() {
        const distribution = {};
        let total = 0;
        
        this.data.forEach(family => {
            total++;
            // Use clade from mtDnaHaplogroup object
            const clade = family.mtDnaHaplogroup?.clade;
            if (clade && clade !== 'N/A' && clade !== '—') {
                // Use full clade value (e.g., "H1a", "R1a")
                distribution[clade] = (distribution[clade] || 0) + 1;
            }
        });
        
        // Group by root haplogroup and sort
        const grouped = {};
        Object.entries(distribution).forEach(([clade, count]) => {
            const root = clade.charAt(0);
            if (!grouped[root]) grouped[root] = [];
            grouped[root].push([clade, count]);
        });
        
        // Calculate total for each root group
        const groupTotals = Object.entries(grouped).map(([root, clades]) => {
            const total = clades.reduce((sum, [, count]) => sum + count, 0);
            return [root, total];
        }).sort((a, b) => b[1] - a[1]);
        
        // Build final sorted distribution: groups by size, clades within group by count
        const sortedDistribution = {};
        groupTotals.forEach(([root]) => {
            grouped[root]
                .sort((a, b) => b[1] - a[1])
                .forEach(([clade, count]) => {
                    sortedDistribution[clade] = count;
                });
        });
        
        return { distribution: sortedDistribution, total };
    }

    /**
     * Get Y-DNA subclade distribution
     */
    getYSubcladeDistribution() {
        const distribution = {};
        const subcladeToCladeMap = {};
        
        this.data.forEach(family => {
            if (family.gender === 'male') {
                // Use subclade, clade, or root from yDnaHaplogroup object
                const subclade = family.yDnaHaplogroup?.subclade || family.yDnaHaplogroup?.clade || family.yDnaHaplogroup?.root;
                const clade = family.yDnaHaplogroup?.clade || family.yDnaHaplogroup?.root;
                if (subclade && subclade !== 'N/A' && subclade !== '—') {
                    distribution[subclade] = (distribution[subclade] || 0) + 1;
                    // Map subclade to its clade for grouping
                    if (clade) subcladeToCladeMap[subclade] = clade;
                }
            }
        });
        
        // Group by clade
        const grouped = {};
        Object.entries(distribution).forEach(([subclade, count]) => {
            const clade = subcladeToCladeMap[subclade] || subclade.charAt(0);
            if (!grouped[clade]) grouped[clade] = [];
            grouped[clade].push([subclade, count]);
        });
        
        // Calculate total for each clade group
        const groupTotals = Object.entries(grouped).map(([clade, subclades]) => {
            const total = subclades.reduce((sum, [, count]) => sum + count, 0);
            return [clade, total];
        }).sort((a, b) => b[1] - a[1]);
        
        // Build sorted distribution: groups by clade size, subclades within group by count, take top 15
        const sortedEntries = [];
        groupTotals.forEach(([clade]) => {
            grouped[clade]
                .sort((a, b) => b[1] - a[1])
                .forEach(entry => sortedEntries.push(entry));
        });
        
        return sortedEntries
            .slice(0, 15)
            .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});
    }

    /**
     * Get mtDNA subclade distribution
     */
    getMtSubcladeDistribution() {
        const distribution = {};
        const subcladeToCladeMap = {};
        
        this.data.forEach(family => {
            // Use subclade, clade, or root from mtDnaHaplogroup object
            const subclade = family.mtDnaHaplogroup?.subclade || family.mtDnaHaplogroup?.clade || family.mtDnaHaplogroup?.root;
            const clade = family.mtDnaHaplogroup?.clade || family.mtDnaHaplogroup?.root;
            if (subclade && subclade !== 'N/A' && subclade !== '—') {
                distribution[subclade] = (distribution[subclade] || 0) + 1;
                // Map subclade to its clade for grouping
                if (clade) subcladeToCladeMap[subclade] = clade;
            }
        });
        
        // Group by clade
        const grouped = {};
        Object.entries(distribution).forEach(([subclade, count]) => {
            const clade = subcladeToCladeMap[subclade] || subclade.charAt(0);
            if (!grouped[clade]) grouped[clade] = [];
            grouped[clade].push([subclade, count]);
        });
        
        // Calculate total for each clade group
        const groupTotals = Object.entries(grouped).map(([clade, subclades]) => {
            const total = subclades.reduce((sum, [, count]) => sum + count, 0);
            return [clade, total];
        }).sort((a, b) => b[1] - a[1]);
        
        // Build sorted distribution: groups by clade size, subclades within group by count, take top 15
        const sortedEntries = [];
        groupTotals.forEach(([clade]) => {
            grouped[clade]
                .sort((a, b) => b[1] - a[1])
                .forEach(entry => sortedEntries.push(entry));
        });
        
        return sortedEntries
            .slice(0, 15)
            .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});
    }

    /**
     * Get ethnicity distribution
     */
    getEthnicityDistribution() {
        const distribution = {};
        
        this.data.forEach(family => {
            const ethnicity = family.ethnicity?.main?.english || 
                            family.ethnicity?.main?.native || 
                            'Unknown';
            distribution[ethnicity] = (distribution[ethnicity] || 0) + 1;
        });
        
        return distribution;
    }

    /**
     * Get colors for ethnicities using predefined schema
     * @param {Array} labels - Array of ethnicity labels
     * @returns {Array} Array of color hex codes
     */
    getEthnicityColors(labels) {
        return labels.map((label, index) => {
            // Use predefined color if available, otherwise generate
            if (this.ethnicityColors[label]) {
                return this.ethnicityColors[label];
            }
            // Fallback to generated color for unknown ethnicities
            const hue = (index * 137.508) % 360;
            return `hsl(${hue}, 70%, 50%)`;
        });
    }

    /**
     * Get colors for Y-DNA clades using predefined FamilyTreeDNA schema
     * @param {Array} labels - Array of clade labels (e.g., ['G2a1', 'R1a1', 'J2a1'])
     * @returns {Array} Array of color hex codes
     */
    getYDnaCladeColors(labels) {
        return labels.map((label, index) => {
            // Direct lookup in yDnaColors
            if (this.yDnaColors[label]) {
                return this.yDnaColors[label];
            }
            // Fallback to generated color for unknown clades
            const hue = (index * 137.508) % 360;
            return `hsl(${hue}, 60%, 55%)`;
        });
    }

    /**
     * Get colors for Y-DNA subclades using predefined FamilyTreeDNA schema
     * @param {Array} labels - Array of subclade labels (e.g., ['G-Z6553', 'R-Z93'])
     * @returns {Array} Array of color hex codes
     */
    getYSubcladeColors(labels) {
        return labels.map((label, index) => {
            // Use predefined color if available
            if (this.ySubcladeColors[label]) {
                return this.ySubcladeColors[label];
            }
            // Fallback to generated color for unknown subclades
            const hue = (index * 137.508) % 360;
            return `hsl(${hue}, 60%, 55%)`;
        });
    }

    /**
     * Get village distribution (top 10)
     */
    getVillageDistribution() {
        const distribution = {};
        
        this.data.forEach(family => {
            const village = family.location?.village?.main?.english || 
                          family.location?.village?.main?.native || 
                          family.location?.village?.main?.russian || 
                          'Unknown';
            distribution[village] = (distribution[village] || 0) + 1;
        });
        
        // Sort by count and take top 10
        return Object.entries(distribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});
    }

    /**
     * Generate distinct colors for chart
     */
    generateColors(count) {
        const colors = [
            '#477571', '#7b68ee', '#3498db', '#e74c3c', '#f39c12',
            '#2ecc71', '#9b59b6', '#1abc9c', '#e67e22', '#95a5a6',
            '#34495e', '#16a085', '#27ae60', '#2980b9', '#8e44ad'
        ];
        
        // If we need more colors, generate them
        while (colors.length < count) {
            const hue = (colors.length * 137.508) % 360; // Golden angle
            colors.push(`hsl(${hue}, 60%, 55%)`);
        }
        
        return colors.slice(0, count);
    }

    /**
     * Create Y-DNA Haplogroup Pie Chart
     */
    createYDnaChart() {
        const ctx = document.getElementById('yDnaChart');
        if (!ctx) return;

        const { distribution, totalMales } = this.getYDnaDistribution();
        const labels = Object.keys(distribution);
        const data = Object.values(distribution);
        const colors = this.getYDnaCladeColors(labels);

        this.charts.yDna = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 10,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const percentage = ((value / totalMales) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Update stats
        const statsDiv = document.getElementById('yDnaStats');
        if (statsDiv) {
            const totalWithData = data.reduce((a, b) => a + b, 0);
            statsDiv.innerHTML = `
                <strong>Total Males:</strong> ${totalMales}<br>
                <strong>With Y-DNA Data:</strong> ${totalWithData} (${((totalWithData/totalMales)*100).toFixed(1)}%)<br>
                <strong>Unique Clades:</strong> ${labels.length}
            `;
        }
    }

    /**
     * Create mtDNA Haplogroup Pie Chart
     */
    createMtDnaChart() {
        const ctx = document.getElementById('mtDnaChart');
        if (!ctx) return;

        const { distribution, total } = this.getMtDnaDistribution();
        const labels = Object.keys(distribution);
        const data = Object.values(distribution);
        const colors = this.generateColors(labels.length);

        this.charts.mtDna = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 10,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Update stats
        const statsDiv = document.getElementById('mtDnaStats');
        if (statsDiv) {
            const totalWithData = data.reduce((a, b) => a + b, 0);
            statsDiv.innerHTML = `
                <strong>Total Families:</strong> ${total}<br>
                <strong>With mtDNA Data:</strong> ${totalWithData} (${((totalWithData/total)*100).toFixed(1)}%)<br>
                <strong>Unique Clades:</strong> ${labels.length}
            `;
        }
    }

    /**
     * Create Y-DNA Subclade Pie Chart
     */
    createYSubcladeChart() {
        const ctx = document.getElementById('ySubcladeChart');
        if (!ctx) return;

        const distribution = this.getYSubcladeDistribution();
        const labels = Object.keys(distribution);
        const data = Object.values(distribution);
        const colors = this.getYSubcladeColors(labels);

        this.charts.ySubclade = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Create mtDNA Subclade Pie Chart
     */
    createMtSubcladeChart() {
        const ctx = document.getElementById('mtSubcladeChart');
        if (!ctx) return;

        const distribution = this.getMtSubcladeDistribution();
        const labels = Object.keys(distribution);
        const data = Object.values(distribution);
        const colors = this.generateColors(labels.length);

        this.charts.mtSubclade = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Create Ethnicity Pie Chart
     */
    createEthnicityChart() {
        const ctx = document.getElementById('ethnicityChart');
        if (!ctx) return;

        const distribution = this.getEthnicityDistribution();
        const labels = Object.keys(distribution);
        const data = Object.values(distribution);
        const colors = this.getEthnicityColors(labels);

        this.charts.ethnicity = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 10,
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
    }

    /**
     * Create Village Bar Chart (Top 10)
     */
    createVillageChart() {
        const ctx = document.getElementById('villageChart');
        if (!ctx) return;

        const distribution = this.getVillageDistribution();
        const labels = Object.keys(distribution);
        const data = Object.values(distribution);

        this.charts.village = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Families',
                    data: data,
                    backgroundColor: '#24690a',
                    borderColor: '#1a4f07',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y', // Horizontal bar chart
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    /**
     * Update Y-DNA chart with new data
     */
    updateYDnaChart() {
        const { distribution, totalMales } = this.getYDnaDistribution();
        const labels = Object.keys(distribution);
        const data = Object.values(distribution);
        
        this.charts.yDna.data.labels = labels;
        this.charts.yDna.data.datasets[0].data = data;
        this.charts.yDna.data.datasets[0].backgroundColor = this.getYDnaCladeColors(labels);
        this.charts.yDna.update();

        // Update stats
        const statsDiv = document.getElementById('yDnaStats');
        if (statsDiv) {
            const totalWithData = data.reduce((a, b) => a + b, 0);
            statsDiv.innerHTML = `
                <strong>Total Males:</strong> ${totalMales}<br>
                <strong>With Y-DNA Data:</strong> ${totalWithData} (${((totalWithData/totalMales)*100).toFixed(1)}%)<br>
                <strong>Unique Clades:</strong> ${labels.length}
            `;
        }
    }

    /**
     * Update mtDNA chart with new data
     */
    updateMtDnaChart() {
        const { distribution, total } = this.getMtDnaDistribution();
        const labels = Object.keys(distribution);
        const data = Object.values(distribution);
        
        this.charts.mtDna.data.labels = labels;
        this.charts.mtDna.data.datasets[0].data = data;
        this.charts.mtDna.data.datasets[0].backgroundColor = this.generateColors(labels.length);
        this.charts.mtDna.update();

        // Update stats
        const statsDiv = document.getElementById('mtDnaStats');
        if (statsDiv) {
            const totalWithData = data.reduce((a, b) => a + b, 0);
            statsDiv.innerHTML = `
                <strong>Total Families:</strong> ${total}<br>
                <strong>With mtDNA Data:</strong> ${totalWithData} (${((totalWithData/total)*100).toFixed(1)}%)<br>
                <strong>Unique Clades:</strong> ${labels.length}
            `;
        }
    }

    /**
     * Update Y-DNA subclade chart with new data
     */
    updateYSubcladeChart() {
        const distribution = this.getYSubcladeDistribution();
        const labels = Object.keys(distribution);
        const data = Object.values(distribution);
        
        this.charts.ySubclade.data.labels = labels;
        this.charts.ySubclade.data.datasets[0].data = data;
        this.charts.ySubclade.data.datasets[0].backgroundColor = this.getYSubcladeColors(labels);
        this.charts.ySubclade.update();
    }

    /**
     * Update mtDNA subclade chart with new data
     */
    updateMtSubcladeChart() {
        const distribution = this.getMtSubcladeDistribution();
        const labels = Object.keys(distribution);
        const data = Object.values(distribution);
        
        this.charts.mtSubclade.data.labels = labels;
        this.charts.mtSubclade.data.datasets[0].data = data;
        this.charts.mtSubclade.update();
    }

    /**
     * Update ethnicity chart with new data
     */
    updateEthnicityChart() {
        const distribution = this.getEthnicityDistribution();
        const labels = Object.keys(distribution);
        const data = Object.values(distribution);
        
        this.charts.ethnicity.data.labels = labels;
        this.charts.ethnicity.data.datasets[0].data = data;
        this.charts.ethnicity.data.datasets[0].backgroundColor = this.getEthnicityColors(labels);
        this.charts.ethnicity.update();
    }

    /**
     * Update village chart with new data
     */
    updateVillageChart() {
        const distribution = this.getVillageDistribution();
        const labels = Object.keys(distribution);
        const data = Object.values(distribution);
        
        this.charts.village.data.labels = labels;
        this.charts.village.data.datasets[0].data = data;
        this.charts.village.update();
    }
}

// Initialize statistics when DOM is ready
window.heritageStatistics = new HeritageStatistics();
