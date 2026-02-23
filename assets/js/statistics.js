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
                        // Create charts with current data (filtered or all)
                        // Don't reset this.data - it should already be set by filters if applied
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
        
        // Always use the provided filtered data
        this.data = filteredData;
        
        // Refresh all charts if they exist, otherwise they'll be created with correct data when tab is clicked
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
        return labels.map((label, index) => HaplotypeConfig.getEthnicityColor(label, index));
    }

    /**
     * Get colors for Y-DNA clades using predefined FamilyTreeDNA schema
     * @param {Array} labels - Array of clade labels (e.g., ['G2a1', 'R1a1', 'J2a1'])
     * @returns {Array} Array of color hex codes
     */
    getYDnaCladeColors(labels) {
        return labels.map((label, index) => HaplotypeConfig.getYDnaCladeColor(label, index));
    }

    /**
     * Get colors for Y-DNA subclades using predefined FamilyTreeDNA schema
     * @param {Array} labels - Array of subclade labels (e.g., ['G-Z6553', 'R-Z93'])
     * @returns {Array} Array of color hex codes
     */
    getYSubcladeColors(labels) {
        return labels.map((label, index) => HaplotypeConfig.getYSubcladeColor(label, index));
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
