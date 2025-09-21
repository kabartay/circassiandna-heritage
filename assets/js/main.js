/**
 * Main Application - Fixed for Repository Structure
 * Works exactly like the original single HTML file
 */

class HeritageApp {
    constructor() {
        this.dataLoader = new DataLoader();
        this.currentFilter = 'all';
        this.currentSort = 'date-desc';
        this.displayedResults = 0;
        this.resultsPerPage = 4;
        this.config = null;
        this.isLoading = false;
        
        console.log('🎯 HeritageApp instance created');
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🚀 Initializing Circassian DNA Heritage App...');
            
            // Show initial loading
            this.showInitialLoading();
            
            // Load configuration and data
            this.config = await this.dataLoader.loadConfig();
            await this.dataLoader.loadHeritageData();
            
            // Set pagination from config
            this.resultsPerPage = this.config.pagination?.resultsPerPage || 4;
            
            // Initialize UI components
            this.initializeUI();
            this.setupEventListeners();
            
            // Load initial results
            await this.loadResults();
            
            console.log('✅ Application initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing application:', error);
            this.showError('Failed to load application. Using fallback data.');
            
            // Try to continue with fallback
            try {
                this.config = this.dataLoader.getDefaultConfig();
                this.initializeUI();
                this.setupEventListeners();
                await this.loadResults();
            } catch (fallbackError) {
                console.error('❌ Fallback also failed:', fallbackError);
                this.showCriticalError();
            }
        }
    }

    /**
     * Show initial loading state
     */
    showInitialLoading() {
        const feedContent = document.getElementById('feedContent');
        if (feedContent) {
            feedContent.innerHTML = `
                <div style="text-align: center; padding: 60px; color: #7f8c8d;">
                    <div style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #e74c3c; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <h3>Loading Heritage Data...</h3>
                    <p>Please wait while we load the family profiles</p>
                </div>
                <style>
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                </style>
            `;
        }
    }

    /**
     * Initialize UI components
     */
    initializeUI() {
        console.log('🎨 Initializing UI components...');
        
        this.updateTitle();
        this.updateStatistics();
        this.initializeFilters();
        this.initializeSorting();
        
        console.log('✅ UI components initialized');
    }

    /**
     * Update page title and header
     */
    updateTitle() {
        if (this.config?.app) {
            const headerTitle = document.querySelector('.feed-header h1');
            const headerSubtitle = document.querySelector('.feed-header p');
            
            if (headerTitle) {
                headerTitle.textContent = `🏔️ ${this.config.app.title}`;
            }
            if (headerSubtitle) {
                headerSubtitle.textContent = this.config.app.subtitle;
            }
            
            document.title = this.config.app.title;
        }
    }

    /**
     * Update statistics bar
     */
    updateStatistics() {
        const stats = this.dataLoader.calculateStatistics();
        const statItems = document.querySelectorAll('.stat-item .stat-number');
        
        if (statItems.length >= 4) {
            statItems[0].textContent = stats.totalProfiles || 0;
            statItems[1].textContent = stats.yDnaHaplogroups || 0;
            statItems[2].textContent = stats.villages || 0;
            statItems[3].textContent = stats.ethnicities || 0;
        }
        
        console.log('📊 Statistics updated:', stats);
    }

    /**
     * Initialize filter buttons
     */
    initializeFilters() {
        const filterSection = document.querySelector('.filter-section');
        if (!filterSection) {
            console.warn('⚠️ Filter section not found');
            return;
        }

        filterSection.innerHTML = '';
        
        const filters = this.config?.filters?.ethnicities || [
            { key: 'all', label: 'All Families', active: true },
            { key: 'abdzakh', label: 'Abdzakh', active: false },
            { key: 'abkhaz', label: 'Abkhaz', active: false },
            { key: 'kabardian', label: 'Kabardian', active: false },
            { key: 'shapsough', label: 'Shapsough', active: false },
            { key: 'ubykh', label: 'Ubykh', active: false }
        ];

        filters.forEach(filter => {
            const button = document.createElement('button');
            button.className = `filter-btn ${filter.active ? 'active' : ''}`;
            button.textContent = filter.label;
            button.setAttribute('aria-pressed', filter.active ? 'true' : 'false');  // ADD THIS
            button.setAttribute('role', 'button');  // ADD THIS
            button.onclick = () => this.filterResults(filter.key);
            filterSection.appendChild(button);
        });
    }

    /**
     * Initialize sorting dropdown
     */
    initializeSorting() {
        const sortSelect = document.getElementById('sortSelect');
        if (!sortSelect) {
            console.warn('⚠️ Sort select not found');
            return;
        }

        sortSelect.innerHTML = '';
        
        const sortOptions = this.config?.sorting?.options || [
            { value: "date-desc", label: "Date (Newest First)", default: true },
            { value: "date-asc", label: "Date (Oldest First)", default: false },
            { value: "name-asc", label: "Family Name (A-Z)", default: false },
            { value: "name-desc", label: "Family Name (Z-A)", default: false }
        ];
        
        sortOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            if (option.default) {
                optionElement.selected = true;
                this.currentSort = option.value;
            }
            sortSelect.appendChild(optionElement);
        });
        
        console.log('📋 Sorting options initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Sort dropdown change event
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortResults(e.target.value);
            });
        }

        // Infinite scroll
        const feedContent = document.getElementById('feedContent');
        if (feedContent) {
            feedContent.addEventListener('scroll', (e) => {
                this.handleScroll(e);
            });
        }
        
        console.log('👂 Event listeners setup complete');
    }

    /**
     * Handle scroll for infinite loading
     */
    handleScroll(event) {
        const container = event.target;
        const scrollPosition = container.scrollTop + container.clientHeight;
        const threshold = container.scrollHeight - 50;
        
        if (scrollPosition >= threshold && !this.isLoading) {
            this.loadMoreResults();
        }
    }

    /**
     * Filter results by ethnicity
     */
    filterResults(ethnicity) {
        console.log('🔍 Filtering by:', ethnicity);
        
        this.currentFilter = ethnicity;
        this.displayedResults = 0;
        
        // Update active state and aria-pressed for all buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');  // ADD THIS
        });
        
        // Find and activate the correct button
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            if ((ethnicity === 'all' && btn.textContent === 'All Families') ||
                (ethnicity === 'abdzakh' && btn.textContent === 'Abdzakh') ||
                (ethnicity === 'abkhaz' && btn.textContent === 'Abkhaz') ||
                (ethnicity === 'kabardian' && btn.textContent === 'Kabardian') ||
                (ethnicity === 'shapsough' && btn.textContent === 'Shapsough') ||
                (ethnicity === 'ubykh' && btn.textContent === 'Ubykh')) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');  // ADD THIS
            }
        });
        
        this.loadResults();
    }

    /**
     * Sort results
     */
    sortResults(sortType) {
        console.log('📊 Sorting by:', sortType);
        
        this.currentSort = sortType;
        this.displayedResults = 0;
        this.loadResults();
    }

    /**
     * Load and display results
     */
    async loadResults() {
        if (this.isLoading) {
            console.log('⏳ Already loading, skipping...');
            return;
        }
        
        try {
            this.isLoading = true;
            console.log(`📥 Loading results (filter: ${this.currentFilter}, sort: ${this.currentSort})`);
            
            const feedContent = document.getElementById('feedContent');
            if (!feedContent) {
                throw new Error('Feed content element not found');
            }
            
            // Clear content if starting fresh
            if (this.displayedResults === 0) {
                feedContent.innerHTML = '';
                feedContent.scrollTop = 0;
            }
            
            // Get processed data
            const processedData = this.dataLoader.getProcessedData(this.currentFilter, this.currentSort);
            
            // Check if we have any data
            if (processedData.length === 0 && this.displayedResults === 0) {
                this.showEmptyState();
                return;
            }
            
            // Get the next batch of results
            const resultsToShow = processedData.slice(this.displayedResults, this.displayedResults + this.resultsPerPage);
            
            if (resultsToShow.length === 0) {
                console.log('📭 No more results to show');
                return;
            }
            
            // Add results to the feed
            resultsToShow.forEach(data => {
                feedContent.innerHTML += this.createHeritageCard(data);
            });
            
            this.displayedResults += resultsToShow.length;
            
            console.log(`✅ Added ${resultsToShow.length} results (total: ${this.displayedResults})`);
            
        } catch (error) {
            console.error('❌ Error loading results:', error);
            this.showError('Error loading heritage data');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Load more results (infinite scroll)
     */
    async loadMoreResults() {
        const processedData = this.dataLoader.getProcessedData(this.currentFilter, this.currentSort);
        
        if (this.displayedResults < processedData.length && !this.isLoading) {
            console.log('📜 Loading more results...');
            await this.loadResults();
        }
    }

    /**
     * HTML escape utility for security
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    /**
     * Create heritage card HTML - FIXED with security & URLs
     */
    createHeritageCard(data) {
        // Escape all text data to prevent XSS
        const safe = {
            id: this.escapeHtml(data.id),
            ethnicity: this.escapeHtml(data.ethnicity),
            familyNameEnglish: this.escapeHtml(data.familyNameEnglish),
            familyNameCircassian: this.escapeHtml(data.familyNameCircassian),
            village: this.escapeHtml(data.village),
            yDnaHaplogroup: this.escapeHtml(data.yDnaHaplogroup),
            yDnaSubclade: this.escapeHtml(data.yDnaSubclade),
            yDnaTerminalSnp: this.escapeHtml(data.yDnaTerminalSnp),
            mtDnaHaplogroup: this.escapeHtml(data.mtDnaHaplogroup),
            mtDnaSubclade: this.escapeHtml(data.mtDnaSubclade),
            mtDnaTerminalSnp: this.escapeHtml(data.mtDnaTerminalSnp),
            date: this.escapeHtml(this.formatDate(data.date))
        };

        // Helper function to create action buttons based on URL availability
        const createActionButton = (urlKey, label, icon, cssClass = '') => {
            const url = data.urls?.[urlKey];
            
            if (url) {
                // If URL exists, create a working link
                const safeUrl = this.escapeHtml(url);
                return `<a href="${safeUrl}" 
                        target="_blank" 
                        class="action-btn ${cssClass}"
                        title="${label}">
                            ${icon} ${label}
                        </a>`;
            } else {
                // If no URL, create disabled button
                return `<button class="action-btn ${cssClass} disabled" 
                                disabled
                                title="Not available for this profile">
                            ${icon} ${label}
                        </button>`;
            }
        };

        return `
            <div class="heritage-result" data-ethnicity="${safe.ethnicity.toLowerCase()}" data-id="${safe.id}">
                <div class="result-header">
                    <div class="family-info">
                        <div class="family-avatar">
                            ${this.getFamilyInitials(safe.familyNameEnglish)}
                        </div>
                        <div class="family-names">
                            <div class="family-name-english">${safe.familyNameEnglish}</div>
                            <div class="family-name-circassian">${safe.familyNameCircassian}</div>
                        </div>
                        <div class="basic-info">
                            <div class="info-item">
                                <span class="info-label">Village:</span> ${safe.village}
                            </div>
                            <div class="info-item">
                                <span class="info-label">Ethnicity:</span> ${safe.ethnicity}
                            </div>
                        </div>
                    </div>
                    <div class="test-id-date">
                        <div><strong>ID:</strong> ${safe.id}</div>
                        <div><strong>Date:</strong> ${safe.date}</div>
                    </div>
                </div>
                
                <div class="genetic-data">
                    <div class="haplogroup-section y-dna">
                        <div class="haplogroup-title y-dna-title">
                            <span class="haplogroup-icon">👨</span>
                            Y-DNA (Paternal Line)
                        </div>
                        <div class="genetic-marker">
                            <div class="marker-label">Haplogroup</div>
                            <div class="marker-value">${safe.yDnaHaplogroup}</div>
                        </div>
                        <div class="genetic-marker">
                            <div class="marker-label">Subclade</div>
                            <div class="marker-value">${safe.yDnaSubclade}</div>
                        </div>
                        <div class="genetic-marker">
                            <div class="marker-label">Terminal SNP</div>
                            <div class="marker-value">${safe.yDnaTerminalSnp}</div>
                        </div>
                    </div>
                    
                    <div class="haplogroup-section mt-dna">
                        <div class="haplogroup-title mt-dna-title">
                            <span class="haplogroup-icon">👩</span>
                            mtDNA (Maternal Line)
                        </div>
                        <div class="genetic-marker">
                            <div class="marker-label">Haplogroup</div>
                            <div class="marker-value">${safe.mtDnaHaplogroup}</div>
                        </div>
                        <div class="genetic-marker">
                            <div class="marker-label">Subclade</div>
                            <div class="marker-value">${safe.mtDnaSubclade}</div>
                        </div>
                        <div class="genetic-marker">
                            <div class="marker-label">Terminal SNP</div>
                            <div class="marker-value">${safe.mtDnaTerminalSnp}</div>
                        </div>
                    </div>
                </div>
                
                <div class="result-actions">
                    ${createActionButton('yDnaClassicTree', 'Y-DNA Classic Tree', '🌳', 'heritage')}
                    ${createActionButton('yDnaTimeTree', 'Y-DNA Time Tree', '⏳', 'heritage')}
                    ${createActionButton('yDnaGroupTree', 'Y-DNA Group Time Tree', '👥', 'heritage')}
                    ${createActionButton('fullReport', 'Full Report', '📄', 'secondary')}
                    ${createActionButton('mtDnaClassicTree', 'mtDNA Classic Tree', '🌲', '')}
                    ${createActionButton('mtDnaTimeTree', 'mtDNA Time Tree', '⌚', '')}
                    ${createActionButton('mtDnaGroupTree', 'mtDNA Group Time Tree', '👪', '')}
                    ${createActionButton('relations', 'Relations', '🔗', 'secondary')}
                </div>
            </div>
        `;
    }

    /**
     * Utility functions
     */
    getFamilyInitials(name) {
        return name ? name.substring(0, 2).toUpperCase() : 'FA';
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (error) {
            return dateString || 'Unknown';
        }
    }

    showEmptyState() {
        const feedContent = document.getElementById('feedContent');
        const filterName = this.currentFilter === 'all' ? 'families' : this.currentFilter;
        
        feedContent.innerHTML = `
            <div style="text-align: center; padding: 60px; color: #7f8c8d;">
                <div style="font-size: 4rem; margin-bottom: 20px;">🔍</div>
                <h3>No ${filterName} found</h3>
                <p>Try adjusting your filters or check back later for new data.</p>
                <button onclick="app.filterResults('all')" style="margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Show All Families
                </button>
            </div>
        `;
    }

    showError(message) {
        console.error('💥 Error:', message);
        const feedContent = document.getElementById('feedContent');
        if (feedContent && this.displayedResults === 0) {
            feedContent.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #e74c3c; background: #fdf2f2; border-radius: 8px; margin: 20px;">
                    <h3>⚠️ ${message}</h3>
                    <p>The application encountered an error but will try to continue with available data.</p>
                    <button onclick="app.init()" style="margin-top: 20px; padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        🔄 Retry
                    </button>
                </div>
            `;
        }
    }

    showCriticalError() {
        const feedContent = document.getElementById('feedContent');
        if (feedContent) {
            feedContent.innerHTML = `
                <div style="text-align: center; padding: 60px; color: #e74c3c;">
                    <h3>💥 Critical Error</h3>
                    <p>The application failed to initialize. Please check the console for details.</p>
                    <button onclick="window.location.reload()">🔄 Reload Page</button>
                </div>
            `;
        }
    }

    // /**
    //  * Create heritage card HTML with individual URLs
    //  */
    // createHeritageCard(data) {
    //     // Helper function to create button/link based on URL availability
    //     const createActionButton = (url, label, iconEmoji, cssClass = '') => {
    //         if (url) {
    //             // If URL exists, create a link
    //             return `
    //                 <a href="${url}" 
    //                    target="_blank" 
    //                    class="action-btn ${cssClass}"
    //                    title="${label}">
    //                     ${iconEmoji} ${label}
    //                 </a>
    //             `;
    //         } else {
    //             // If no URL, create disabled button
    //             return `
    //                 <button class="action-btn ${cssClass} disabled" 
    //                         disabled
    //                         title="Not available for this profile">
    //                     ${iconEmoji} ${label}
    //                 </button>
    //             `;
    //         }
    //     };

    //     // Get URLs from data, with fallback to empty object
    //     const urls = data.urls || {};

    //     return `
    //         <div class="heritage-result" data-ethnicity="${data.ethnicity.toLowerCase()}" data-id="${data.id}">
    //             <div class="result-header">
    //                 <div class="family-info">
    //                     <div class="family-avatar">
    //                         ${this.getFamilyInitials(data.familyNameEnglish)}
    //                     </div>
    //                     <div class="family-names">
    //                         <div class="family-name-english">${data.familyNameEnglish}</div>
    //                         <div class="family-name-circassian">${data.familyNameCircassian}</div>
    //                     </div>
    //                     <div class="basic-info">
    //                         <div class="info-item">
    //                             <span class="info-label">Village:</span> ${data.village}
    //                         </div>
    //                         <div class="info-item">
    //                             <span class="info-label">Ethnicity:</span> ${data.ethnicity}
    //                         </div>
    //                     </div>
    //                 </div>
    //                 <div class="test-id-date">
    //                     <div><strong>ID:</strong> ${data.id}</div>
    //                     <div><strong>Date:</strong> ${this.formatDate(data.date)}</div>
    //                 </div>
    //             </div>
                
    //             <div class="genetic-data">
    //                 <div class="haplogroup-section y-dna">
    //                     <div class="haplogroup-title y-dna-title">
    //                         <span class="haplogroup-icon">👨</span>
    //                         Y-DNA (Paternal Line)
    //                     </div>
    //                     <div class="genetic-marker">
    //                         <div class="marker-label">Haplogroup</div>
    //                         <div class="marker-value">${data.yDnaHaplogroup}</div>
    //                     </div>
    //                     <div class="genetic-marker">
    //                         <div class="marker-label">Subclade</div>
    //                         <div class="marker-value">${data.yDnaSubclade}</div>
    //                     </div>
    //                     <div class="genetic-marker">
    //                         <div class="marker-label">Terminal SNP</div>
    //                         <div class="marker-value">${data.yDnaTerminalSnp}</div>
    //                     </div>
    //                 </div>
                    
    //                 <div class="haplogroup-section mt-dna">
    //                     <div class="haplogroup-title mt-dna-title">
    //                         <span class="haplogroup-icon">👩</span>
    //                         mtDNA (Maternal Line)
    //                     </div>
    //                     <div class="genetic-marker">
    //                         <div class="marker-label">Haplogroup</div>
    //                         <div class="marker-value">${data.mtDnaHaplogroup}</div>
    //                     </div>
    //                     <div class="genetic-marker">
    //                         <div class="marker-label">Subclade</div>
    //                         <div class="marker-value">${data.mtDnaSubclade}</div>
    //                     </div>
    //                     <div class="genetic-marker">
    //                         <div class="marker-label">Terminal SNP</div>
    //                         <div class="marker-value">${data.mtDnaTerminalSnp}</div>
    //                     </div>
    //                 </div>
    //             </div>
                
    //             <div class="result-actions">
    //                 ${createActionButton(urls.yDnaClassicTree, 'Y-DNA Classic Tree', '🌳', 'heritage')}
    //                 ${createActionButton(urls.yDnaTimeTree, 'Y-DNA Time Tree', '⏳', 'heritage')}
    //                 ${createActionButton(urls.yDnaGroupTree, 'Y-DNA Group Time Tree', '👥', 'heritage')}
    //                 ${createActionButton(urls.fullReport, 'Full Report', '📄', 'secondary')}
    //                 ${createActionButton(urls.mtDnaClassicTree, 'mtDNA Classic Tree', '🌲', '')}
    //                 ${createActionButton(urls.mtDnaTimeTree, 'mtDNA Time Tree', '⌚', '')}
    //                 ${createActionButton(urls.mtDnaGroupTree, 'mtDNA Group Time Tree', '👪', '')}
    //                 ${createActionButton(urls.relations, 'Relations', '🔗', 'secondary')}
    //             </div>
    //         </div>
    //     `;
    // }

}

// Make sure HeritageApp is available globally
if (typeof window !== 'undefined') {
    window.HeritageApp = HeritageApp;
    console.log('✅ HeritageApp class registered globally');
}