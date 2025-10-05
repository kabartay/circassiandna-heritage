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
        this.resultsPerPage = 8;
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
                <div class="spinner-container">
                    <div class="spinner"></div>
                    <h3>Loading Heritage Data...</h3>
                    <p>Please wait while we load the family profiles</p>
                </div>
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
                // Clear existing content
                headerTitle.textContent = '';

                // Create and append the flag image
                const img = document.createElement('img');
                img.src = "assets/img/circassian-flag.png";
                img.alt = "Circassian Flag";
                img.classList.add('header-flag'); // ✅ use CSS class for styling
                headerTitle.appendChild(img);

                // Append the title safely as text
                headerTitle.appendChild(document.createTextNode(this.config.app.title));
            }

            if (headerSubtitle) {
                headerSubtitle.textContent = this.config.app.subtitle || '';
            }
            
            document.title = this.config.app.title || 'Circassian DNA Heritage Feed';
        }
    }

    /**
     * Update statistics bar
     */
    updateStatistics() {
        const stats = this.dataLoader.calculateStatistics();

        // Dynamically update elements based on data-stat attributes
        Object.entries(stats).forEach(([key, value]) => {
            const el = document.querySelector(`.stat-number[data-stat="${key}"]`);
            if (el) {
                el.textContent = value || 0;
            }
        });
        
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
            { key: 'abkhazian', label: 'Abkhazian', active: false },
            { key: 'kabardian', label: 'Kabardian', active: false },
            { key: 'shapsough', label: 'Shapsough', active: false },
            { key: 'ubykh', label: 'Ubykh', active: false }
        ];

        filters.forEach(filter => {
            const button = document.createElement('button');
            button.className = `filter-btn ${filter.active ? 'active' : ''}`;
            button.textContent = filter.label;
            button.dataset.ethnicity = filter.key; // Add data attribute
            button.setAttribute('aria-pressed', filter.active ? 'true' : 'false');
            button.setAttribute('role', 'button');

            // Attach event listener instead of inline onclick
            button.addEventListener('click', () => this.filterResults(filter.key));

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

            // ✅ Event delegation for clicks (cards + action buttons)
            feedContent.addEventListener('click', (e) => {
                const card = e.target.closest('.heritage-result');
                const isButton = e.target.closest('.action-btn');

                // Stop clicks on buttons from toggling cards
                if (isButton) {
                    e.stopPropagation();
                    return;
                }

                // Toggle card expansion
                if (card) {
                    card.classList.toggle('expanded');
                }
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

        // Update button states based on data-ethnicity
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const isActive = btn.dataset.ethnicity === ethnicity;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive.toString());
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
            this.showLoadingSpinner(); // show spinner at the start
            console.log(`📥 Loading results (filter: ${this.currentFilter}, sort: ${this.currentSort})`);

            const feedContent = document.getElementById('feedContent');
            if (!feedContent) {
                throw new Error('Feed content element not found');
            }

            // Clear content if starting fresh
            if (this.displayedResults === 0) {
                feedContent.textContent = ''; // safer than innerHTML = ''
                feedContent.scrollTop = 0;
            }

            // Get processed data
            const processedData = this.dataLoader.getProcessedData(this.currentFilter, this.currentSort);

            // Check if we have any data
            if (processedData.length === 0 && this.displayedResults === 0) {
                this.showEmptyState(); // show only once
                
                return;
            }

            // Check if all results are already loaded
            if (this.displayedResults >= processedData.length) {
                this.hideLoadingSpinner();
                console.log("All profiles loaded.");
                return;
            }

            // Get the next batch of results
            const resultsToShow = processedData.slice(
                this.displayedResults,
                this.displayedResults + this.resultsPerPage
            );

            if (resultsToShow.length === 0) {
                console.log('No more results to show');
                this.hideLoadingSpinner(); // hide spinner when done
                return;
            }

            // Efficient and safe DOM append
            const fragment = document.createDocumentFragment();

            resultsToShow.forEach(data => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = this.createHeritageCard(data).trim();
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
            });

            feedContent.appendChild(fragment);

            this.displayedResults += resultsToShow.length;

            // If all loaded, hide spinner
            if (this.displayedResults >= processedData.length) {
                this.hideLoadingSpinner();
                console.log("All profiles loaded.");
            }

            console.log(`Added ${resultsToShow.length} results (total: ${this.displayedResults})`);

            // Auto-load more if no scrollbar
            setTimeout(() => this.checkIfNeedsMore(), 50);

        } catch (error) {
            console.error('❌ Error loading results:', error);
            this.showError('Error loading heritage data');
        } finally {
            this.isLoading = false;
        }
    }

    showLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'block';
        spinner.setAttribute('aria-hidden', 'false');
    }
    }

    hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'none';
        spinner.setAttribute('aria-hidden', 'true');
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
     * Check if we need to load more (no scrollbar scenario)
     */
    async checkIfNeedsMore() {
        const feedContent = document.getElementById('feedContent');
        const processedData = this.dataLoader.getProcessedData(this.currentFilter, this.currentSort);
        
        // If content doesn't fill the container and we have more data, load it
        if (feedContent.scrollHeight <= feedContent.clientHeight && 
            this.displayedResults < processedData.length) {
            console.log('📦 Auto-loading more - no scroll needed');
            await this.loadResults();
            // Check again recursively
            setTimeout(() => this.checkIfNeedsMore(), 100);
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
     * Create heritage card HTML - Collapsible Version
     * Replace the createHeritageCard method in your HeritageApp class
     */
    createHeritageCard(data) {
        // Escape all text data to prevent XSS
        const safe = {
            id: this.escapeHtml(data.id),
            ethnicity: this.escapeHtml(data.ethnicity_sub), // Use sub-ethnicity for display
            familyNameEnglish: this.escapeHtml(data.familyNameEnglish),
            familyNameRussian: this.escapeHtml(data.familyNameRussian),
            familyNameNative: this.escapeHtml(data.familyNameNative),
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
                const safeUrl = this.escapeHtml(url);
                const buttonId = `btn-${urlKey}-${safe.id}`;
                return `<a id="${buttonId}" 
                        href="${safeUrl}" 
                        target="_blank" 
                        class="action-btn ${cssClass}"
                        title="${this.escapeHtml(label)}">
                            ${icon} ${label}
                        </a>`;
            } else {
                const buttonIdD = `disabled-btn-${urlKey}-${safe.id}`;
                return `
                    <button id="${buttonIdD}" 
                        class="action-btn ${cssClass} disabled" 
                        disabled
                        title="Not available for this profile">
                        ${icon} ${label}
                    </button>
                `;
            }
        };

        return `
            <div class="heritage-result" 
                data-ethnicity="${data.ethnicity_sub ? data.ethnicity_sub.toLowerCase() : ''}" 
                data-id="${safe.id}">

                <!-- COLLAPSED VIEW - Summary Line -->
                <div class="result-summary">
                    <div class="summary-avatar">
                        ${this.getFamilyInitials(safe.familyNameEnglish)}
                    </div>
                    <div class="summary-content">
                        <span class="summary-name">${safe.familyNameEnglish}</span>
                        <div class="summary-info">
                            <div class="summary-item">
                                <span class="summary-label">Village:</span>
                                <span class="summary-value">${safe.village || 'N/A'}</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Ethnicity:</span>
                                <span class="summary-value">${safe.ethnicity}</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Y-DNA:</span>
                                <span class="summary-value">${safe.yDnaHaplogroup}</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">mtDNA:</span>
                                <span class="summary-value">${safe.mtDnaHaplogroup || 'N/A'}</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Date:</span>
                                <span class="summary-value">${data.date}</span>
                            </div>
                        </div>
                        ${this.isNewEntry(data.date) ? '<img src="assets/img/new-badge.png" alt="NEW" class="new-badge">' : ''}
                    </div>
                    <div class="expand-icon">▼</div>
                </div>
                
                <!-- EXPANDED VIEW - Full Details -->
                <div class="result-details">
                    <div class="result-header">
                        <div class="family-info">
                            <div class="family-avatar ${data.gender === 'male' ? 'male' : data.gender === 'female' ? 'female' : ''}">
                                ${this.getFamilyInitials(safe.familyNameEnglish)}
                            </div>
                            <div class="family-names">
                                <div class="family-name-english">${safe.familyNameEnglish}</div>
                                <div class="family-name-russian">${safe.familyNameRussian}</div>
                                <div class="family-name-native">${safe.familyNameNative}</div>
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
                        ${createActionButton('yDnaClassicTree', 'Y-DNA Classic Tree', '🌳', 'y-dna-btn')}
                        ${createActionButton('yDnaTimeTree', 'Y-DNA Time Tree', '⏳', 'y-dna-btn')}
                        ${createActionButton('yDnaGroupTree', 'Y-DNA Group Time Tree', '👥', 'y-dna-btn')}
                        ${createActionButton('fullReport', 'Full Report', '📄', 'secondary')}
                        ${createActionButton('mtDnaClassicTree', 'mtDNA Classic Tree', '🌲', 'mt-dna-btn')}
                        ${createActionButton('mtDnaTimeTree', 'mtDNA Time Tree', '⌚', 'mt-dna-btn')}
                        ${createActionButton('mtDnaGroupTree', 'mtDNA Group Time Tree', '👪', 'mt-dna-btn')}
                        ${createActionButton('relations', 'Relations', '🔗', 'secondary')}
                    </div>
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

    isNewEntry(dateString) {
        try {
            const entryDate = new Date(dateString);
            const today = new Date();
            const diffTime = today - entryDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        } catch (error) {
            return false;
        }
    }

    showEmptyState() {
        const feedContent = document.getElementById('feedContent');
        if (!feedContent) return;

        const filterName = this.currentFilter === 'all' ? 'families' : this.currentFilter;

        // Clear content safely
        feedContent.textContent = '';

        // Create wrapper
        const container = document.createElement('div');
        container.classList.add('empty-state');

        // Add inner content
        container.innerHTML = `
            <div class="empty-icon">🔍</div>
            <h3>No ${this.escapeHtml(filterName)} found</h3>
            <p>Try adjusting your filters or check back later for new data.</p>
            <button id="showAllFamiliesBtn" class="primary-btn">
                Show All Families
            </button>
        `;

        // Append to feed
        feedContent.appendChild(container);

        // Attach event
        const showAllBtn = document.getElementById('showAllFamiliesBtn');
        if (showAllBtn) {
            showAllBtn.addEventListener('click', () => this.filterResults('all'));
        }
    }

    showError(message) {
        console.error('💥 Error:', message);
        const feedContent = document.getElementById('feedContent');
        if (!feedContent || this.displayedResults > 0) return;

        feedContent.textContent = '';

        const container = document.createElement('div');
        container.classList.add('error-state');

        container.innerHTML = `
            <h3>⚠️ ${this.escapeHtml(message)}</h3>
            <p>The application encountered an error but will try to continue with available data.</p>
            <button id="retryBtn" class="danger-btn">
                🔄 Retry
            </button>
        `;

        feedContent.appendChild(container);

        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                if (window.app && typeof window.app.init === 'function') {
                    window.app.init();
                } else {
                    console.warn('⚠️ App instance not found');
                }
            });
        }
    }

    showCriticalError() {
        const feedContent = document.getElementById('feedContent');
        if (feedContent) {
            feedContent.innerHTML = `
                <div style="text-align: center; padding: 60px; color: #e74c3c;">
                    <h3>💥 Critical Error</h3>
                    <p>The application failed to initialize. Please check the console for details.</p>
                    <button id="reloadPageBtn" 
                        style="margin-top: 20px; padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        🔄 Reload Page
                    </button>
                </div>
            `;

            // Attach event listener programmatically
            const reloadBtn = document.getElementById('reloadPageBtn');
            if (reloadBtn) {
                reloadBtn.addEventListener('click', () => {
                    window.location.reload();
                });
            }
        }
    }

}

// Make sure HeritageApp is available globally
if (typeof window !== 'undefined') {
    window.HeritageApp = HeritageApp;
    console.log('✅ HeritageApp class registered globally');
}