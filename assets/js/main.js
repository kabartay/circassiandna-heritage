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
     * Safely set text content on an element.
     * Always use for dynamic text (prevents XSS).
     */
    setSafeText(el, text) {
        if (el) el.textContent = text || '';
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
                img.classList.add('header-flag'); // Apply CSS class for styling
                headerTitle.appendChild(img);

                // Append the title safely as text
                headerTitle.appendChild(document.createTextNode(this.config.app.title));
            }

            if (headerSubtitle) {
                this.setSafeText(headerSubtitle, this.config.app.subtitle);
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
     * Initialize filter dropdowns
     */
    initializeFilters() {
        // Get filter statistics from data
        const filterData = this.dataLoader.getFilterOptions();
        
        // Initialize custom Ethnicity dropdown with flags
        this.initializeEthnicityDropdown(filterData.ethnicities);
        
        // Initialize Village filter
        this.initializeFilterDropdown('villageFilter', [
            { value: 'all', label: 'All Villages' },
            ...filterData.villages.map(v => ({ value: v, label: v }))
        ]);
        
        // Initialize State filter
        this.initializeFilterDropdown('stateFilter', [
            { value: 'all', label: 'All States' },
            ...filterData.states.map(s => ({ value: s, label: s }))
        ]);
        
        // Initialize Y-DNA Clade filter
        this.initializeFilterDropdown('yCladeFilter', [
            { value: 'all', label: 'All Y Clades' },
            ...filterData.yClades.map(c => ({ value: c, label: c }))
        ]);
        
        // Initialize mtDNA Clade filter
        this.initializeFilterDropdown('mtCladeFilter', [
            { value: 'all', label: 'All mt Clades' },
            ...filterData.mtClades.map(c => ({ value: c, label: c }))
        ]);
        
        console.log('✅ Filter dropdowns initialized');
    }
    
    /**
     * Initialize custom ethnicity dropdown with flag images
     */
    initializeEthnicityDropdown(ethnicities) {
        const customSelect = document.getElementById('ethnicitySelect');
        const customOptions = document.getElementById('ethnicityOptions');
        const selectedText = customSelect?.querySelector('.selected-text');
        
        if (!customSelect || !customOptions || !selectedText) {
            console.warn('⚠️ Custom ethnicity dropdown elements not found');
            return;
        }
        
        // Store current selection
        this.currentEthnicity = 'all';
        
        // Build options HTML
        let optionsHTML = '<div class="custom-option" data-value="all"><span class="option-text">All Ethnicities</span></div>';
        
        ethnicities.forEach(eth => {
            const flagHTML = eth.flag ? 
                `<img src="assets/img/${eth.flag}" alt="${eth.label}" class="option-flag">` : 
                '';
            const textClass = eth.isMain ? 'main' : 'sub';
            optionsHTML += `
                <div class="custom-option" data-value="${eth.value}">
                    ${flagHTML}
                    <span class="option-text ${textClass}">${eth.label}</span>
                </div>
            `;
        });
        
        customOptions.innerHTML = optionsHTML;
        
        // Toggle dropdown
        customSelect.addEventListener('click', (e) => {
            e.stopPropagation();
            customSelect.classList.toggle('active');
            customOptions.classList.toggle('active');
        });
        
        // Handle option selection
        customOptions.querySelectorAll('.custom-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.dataset.value;
                const text = option.textContent.trim();
                
                // Update selected value
                this.currentEthnicity = value;
                selectedText.textContent = text;
                
                // Update visual state
                customOptions.querySelectorAll('.custom-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                
                // Close dropdown
                customSelect.classList.remove('active');
                customOptions.classList.remove('active');
                
                // Apply filters
                this.applyFilters();
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            customSelect.classList.remove('active');
            customOptions.classList.remove('active');
        });
    }
    
    /**
     * Initialize a single filter dropdown
     */
    initializeFilterDropdown(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) {
            console.warn(`⚠️ ${selectId} not found`);
            return;
        }
        
        select.innerHTML = '';
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            select.appendChild(optionElement);
        });
        
        // Add event listener
        select.addEventListener('change', () => this.applyFilters());
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
     * Apply all filters from dropdowns
     */
    applyFilters() {
        const ethnicity = this.currentEthnicity || 'all';
        const village = document.getElementById('villageFilter')?.value || 'all';
        const state = document.getElementById('stateFilter')?.value || 'all';
        const yClade = document.getElementById('yCladeFilter')?.value || 'all';
        const mtClade = document.getElementById('mtCladeFilter')?.value || 'all';
        
        console.log('🔍 Applying filters:', { ethnicity, village, state, yClade, mtClade });
        
        // Store current filters
        this.currentFilters = { ethnicity, village, state, yClade, mtClade };
        this.displayedResults = 0;
        
        this.loadResults();
    }
    
    /**
     * Legacy filter method for backward compatibility
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
            
            // Get filters (use new multi-filter or legacy single filter)
            const filters = this.currentFilters || { ethnicity: this.currentFilter || 'all' };
            console.log(`📥 Loading results with filters:`, filters);

            const feedContent = document.getElementById('feedContent');
            if (!feedContent) {
                throw new Error('Feed content element not found');
            }

            // Clear content if starting fresh
            if (this.displayedResults === 0) {
                feedContent.textContent = ''; // Clear content (textContent is safer than innerHTML as it prevents XSS)
                feedContent.scrollTop = 0;
            }

            // Get processed data with current filters and sort
            const processedData = this.dataLoader.getProcessedData(filters, this.currentSort);

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
        const filters = this.currentFilters || { ethnicity: this.currentFilter || 'all' };
        const processedData = this.dataLoader.getProcessedData(filters, this.currentSort);
        
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
        const filters = this.currentFilters || { ethnicity: this.currentFilter || 'all' };
        const processedData = this.dataLoader.getProcessedData(filters, this.currentSort);
        
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
        // Helper to extract haplogroup value (handles both old string format and new object format)
        const getHaplogroupValue = (hg, field) => {
            if (!hg) return null;
            if (typeof hg === 'string') return hg;
            if (typeof hg === 'object') {
                const value = hg[field];
                return value || null;
            }
            return null;
        };

        // Escape all text data to prevent XSS
        const safe = {
            id: this.escapeHtml(data.id),
            ethnicity: this.escapeHtml(data.ethnicity?.main?.sub?.english || data.ethnicity_sub || 'Unknown'),
            familyNameEnglish: this.escapeHtml(data.familyName?.main?.english || data.familyName?.english || data.familyNameEnglish),
            familyNameRussian: this.escapeHtml(data.familyName?.main?.russian || data.familyName?.russian || data.familyNameRussian),
            familyNameNative: this.escapeHtml(data.familyName?.main?.native || data.familyName?.native || data.familyNameNative),
            village: this.escapeHtml(data.location?.village?.main?.native || data.village),
            yDnaHaplogroup: this.escapeHtml(getHaplogroupValue(data.yDnaHaplogroup, 'clade')),
            yDnaSubclade: this.escapeHtml(getHaplogroupValue(data.yDnaHaplogroup, 'subclade')),
            yDnaTerminalSnp: this.escapeHtml(getHaplogroupValue(data.yDnaHaplogroup, 'terminalSnp')),
            mtDnaHaplogroup: this.escapeHtml(getHaplogroupValue(data.mtDnaHaplogroup, 'clade')),
            mtDnaSubclade: this.escapeHtml(getHaplogroupValue(data.mtDnaHaplogroup, 'subclade')),
            mtDnaTerminalSnp: this.escapeHtml(getHaplogroupValue(data.mtDnaHaplogroup, 'terminalSnp')),
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
                data-ethnicity="${(data.ethnicity?.main?.sub?.english || data.ethnicity_sub || '').toLowerCase()}" 
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
                                <span class="summary-value">${data.gender === 'female' ? '' : safe.yDnaHaplogroup}</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">mtDNA:</span>
                                <span class="summary-value">${safe.mtDnaHaplogroup || 'N/A'}</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Date:</span>
                                <span class="summary-value">${safe.date}</span>
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
                                <div class="marker-value">${data.gender === 'female' ? '' : safe.yDnaHaplogroup}</div>
                            </div>
                            <div class="genetic-marker">
                                <div class="marker-label">Subclade</div>
                                <div class="marker-value">${data.gender === 'female' ? '' : safe.yDnaSubclade}</div>
                            </div>
                            <div class="genetic-marker">
                                <div class="marker-label">Terminal SNP</div>
                                <div class="marker-value">${data.gender === 'female' ? '' : safe.yDnaTerminalSnp}</div>
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
                        ${data.gender === 'female' ? `
                        <button class="action-btn y-dna-btn disabled tree-classic" disabled title="Not available for females">🌳 Y-DNA Classic Tree</button>
                        <button class="action-btn y-dna-btn disabled tree-time" disabled title="Not available for females">🌳 Y-DNA Time Tree</button>
                        <button class="action-btn y-dna-btn disabled tree-group" disabled title="Not available for females">🌳 Y-DNA Group Time Tree</button>
                        ` : `
                        ${createActionButton('yDnaClassicTree', 'Y-DNA Classic Tree', '🌳', 'y-dna-btn tree-classic')}
                        ${createActionButton('yDnaTimeTree', 'Y-DNA Time Tree', '🌳', 'y-dna-btn tree-time tree-time')}
                        ${createActionButton('yDnaGroupTree', 'Y-DNA Group Time Tree', '🌳', 'y-dna-btn tree-group')}
                        `}
                        ${createActionButton('fullReport', 'Full Report', '📄', 'secondary')}
                        ${createActionButton('mtDnaClassicTree', 'mtDNA Classic Tree', '🌲', 'mt-dna-btn tree-classic')}
                        ${createActionButton('mtDnaTimeTree', 'mtDNA Time Tree', '🌲', 'mt-dna-btn tree-time')}
                        ${createActionButton('mtDnaGroupTree', 'mtDNA Group Time Tree', '🌲', 'mt-dna-btn tree-group')}
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

            if (isNaN(entryDate)) return false; // invalid date
            if (entryDate > today) return false; // ignore future dates

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

        // Attach event - reset all filters to "all"
        const showAllBtn = document.getElementById('showAllFamiliesBtn');
        if (showAllBtn) {
            showAllBtn.addEventListener('click', () => {
                // Reset custom ethnicity dropdown
                this.currentEthnicity = 'all';
                const selectedText = document.querySelector('#ethnicitySelect .selected-text');
                if (selectedText) selectedText.textContent = 'All Ethnicities';
                
                // Reset standard dropdowns to "all"
                const dropdowns = ['villageFilter', 'stateFilter', 'yCladeFilter', 'mtCladeFilter'];
                dropdowns.forEach(id => {
                    const dropdown = document.getElementById(id);
                    if (dropdown) dropdown.value = 'all';
                });
                
                // Apply filters (all set to "all")
                this.applyFilters();
            });
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