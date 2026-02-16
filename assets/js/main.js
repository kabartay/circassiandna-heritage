/**
 * Main Application - Fixed for Repository Structure
 * Works exactly like the original single HTML file
 */

class HeritageApp {
    constructor() {
        this.dataLoader = new DataLoader();
        this.currentFilter = 'all';
        this.currentFilters = { ethnicity: 'all', village: 'all', state: 'all', yClade: 'all', mtClade: 'all' };
        this.currentSort = 'date-desc';
        this.currentSearch = '';
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
            
            // Initialize maps module if available
            if (window.heritageMaps) {
                await window.heritageMaps.init(this.dataLoader.heritageData);
            }
            
            // Initialize statistics module if available
            if (window.heritageStatistics) {
                await window.heritageStatistics.init(this.dataLoader.heritageData);
            }
            
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
            
            document.title = this.config.app.title || 'Circassian DNA';
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
        
        // Initialize custom Location dropdown with two-column layout
        this.initializeLocationDropdown(filterData.states, filterData.villages);
        
        // Initialize custom Clade dropdown with two-column layout
        this.initializeCladeDropdown(filterData.yClades, filterData.mtClades);
        
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
        
        // Store current selections as array for multi-select
        this.selectedEthnicities = [];
        
        // Build options HTML with checkboxes
        let optionsHTML = '<div class="custom-option reset-option" data-value="all"><span class="option-text">Reset All</span></div>';
        
        let currentMainValue = null;
        ethnicities.forEach(eth => {
            const flagHTML = eth.flag ? 
                `<img src="assets/img/${eth.flag}" alt="${eth.label}" class="option-flag">` : 
                '';
            
            if (eth.isMain) {
                currentMainValue = eth.value;
                const isChecked = this.selectedEthnicities?.includes(eth.value) ? 'checked' : '';
                // Main ethnicity with checkbox and expand icon
                optionsHTML += `
                    <div class="custom-option main-option" data-value="${eth.value}" data-type="main">
                        <input type="checkbox" class="ethnicity-checkbox" data-ethnicity="${eth.value}" data-type="main" ${isChecked}>
                        ${flagHTML}
                        <span class="option-text">${eth.label}</span>
                        <span class="expand-icon">▼</span>
                    </div>
                `;
            } else {
                const isChecked = this.selectedEthnicities?.includes(eth.value) ? 'checked' : '';
                // Sub-ethnicity with checkbox (hidden by default)
                optionsHTML += `
                    <div class="custom-option sub-option" data-value="${eth.value}" data-parent="${currentMainValue}" data-type="sub">
                        <input type="checkbox" class="ethnicity-checkbox" data-ethnicity="${eth.value}" data-type="sub" ${isChecked}>
                        <span class="option-text">${eth.label}</span>
                    </div>
                `;
            }
        });
        
        customOptions.innerHTML = optionsHTML;
        
        // Toggle dropdown
        customSelect.addEventListener('click', (e) => {
            e.stopPropagation();
            customSelect.classList.toggle('active');
            customOptions.classList.toggle('active');
        });
        
        // Handle reset option
        const resetOption = customOptions.querySelector('.reset-option');
        if (resetOption) {
            resetOption.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectedEthnicities = [];
                selectedText.textContent = 'All Ethnicities';
                
                // Uncheck all checkboxes and collapse groups
                customOptions.querySelectorAll('.ethnicity-checkbox').forEach(cb => {
                    cb.checked = false;
                });
                customOptions.querySelectorAll('.main-option.expanded').forEach(mainOpt => {
                    mainOpt.classList.remove('expanded');
                });
                customOptions.querySelectorAll('.sub-option.visible').forEach(subOpt => {
                    subOpt.classList.remove('visible');
                });
                
                this.applyFilters();
            });
        }
        
        // Handle checkbox clicks
        customOptions.querySelectorAll('.ethnicity-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                const ethnicity = checkbox.dataset.ethnicity;
                
                if (checkbox.checked) {
                    if (!this.selectedEthnicities.includes(ethnicity)) {
                        this.selectedEthnicities.push(ethnicity);
                    }
                } else {
                    this.selectedEthnicities = this.selectedEthnicities.filter(e => e !== ethnicity);
                }
                
                // Update display text
                this.updateEthnicityDisplayText();
                
                // Apply filters
                this.applyFilters();
            });
        });
        
        // Handle main ethnicity expand/collapse and clicks
        customOptions.querySelectorAll('.main-option').forEach(mainOption => {
            // Add click handler specifically to expand icon
            const expandIcon = mainOption.querySelector('.expand-icon');
            if (expandIcon) {
                expandIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const mainValue = mainOption.dataset.value;
                    
                    // Toggle expansion
                    mainOption.classList.toggle('expanded');
                    
                    // Show/hide sub-options
                    const subOptions = customOptions.querySelectorAll(`.sub-option[data-parent="${mainValue}"]`);
                    subOptions.forEach(sub => {
                        sub.classList.toggle('visible');
                    });
                });
            }
            
            // Handle clicks on the rest of the option (checkbox behavior)
            mainOption.addEventListener('click', (e) => {
                // Don't handle if clicking checkbox or expand icon
                if (e.target.classList.contains('ethnicity-checkbox') || 
                    e.target.classList.contains('expand-icon')) return;
                
                e.stopPropagation();
                
                // Toggle the checkbox
                const checkbox = mainOption.querySelector('.ethnicity-checkbox');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('click', { bubbles: true }));
                }
            });
        });
        
        // Handle sub-ethnicity clicks
        customOptions.querySelectorAll('.sub-option').forEach(subOption => {
            subOption.addEventListener('click', (e) => {
                // Don't handle if clicking checkbox
                if (e.target.classList.contains('ethnicity-checkbox')) return;
                
                e.stopPropagation();
                
                // Toggle the checkbox
                const checkbox = subOption.querySelector('.ethnicity-checkbox');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('click', { bubbles: true }));
                }
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            customSelect.classList.remove('active');
            customOptions.classList.remove('active');
        });
    }
    
    /**
     * Update ethnicity display text based on selections
     */
    updateEthnicityDisplayText() {
        const customSelect = document.getElementById('ethnicitySelect');
        const selectedText = customSelect?.querySelector('.selected-text');
        if (!selectedText) return;
        
        if (this.selectedEthnicities.length === 0) {
            selectedText.textContent = 'All Ethnicities';
        } else if (this.selectedEthnicities.length === 1) {
            // Find the label for the selected ethnicity
            const customOptions = document.getElementById('ethnicityOptions');
            const option = customOptions?.querySelector(`[data-ethnicity="${this.selectedEthnicities[0]}"]`);
            const label = option?.parentElement.querySelector('.option-text')?.textContent.trim() || this.selectedEthnicities[0];
            selectedText.textContent = label;
        } else {
            selectedText.textContent = `${this.selectedEthnicities.length} ethnicities`;
        }
    }
    
    /**
     * Initialize custom clade dropdown with two-column layout
     */
    initializeCladeDropdown(yClades, mtClades) {
        const customSelect = document.getElementById('cladeSelect');
        const customOptions = document.getElementById('cladeOptions');
        const selectedText = customSelect?.querySelector('.selected-text');
        
        if (!customSelect || !customOptions || !selectedText) {
            console.warn('⚠️ Custom clade dropdown elements not found');
            return;
        }
        
        // Store current selections (can select one from each column)
        this.currentYClade = 'all';
        this.currentMtClade = 'all';
        
        // Build two-column options HTML with checkboxes
        let optionsHTML = '<div class="clade-option reset-option" data-value="all"><span class="option-text">Reset All</span></div>';
        optionsHTML += '<div class="clade-columns">';
        
        // Y-DNA column
        optionsHTML += '<div class="clade-column">';
        optionsHTML += '<div class="clade-column-header">Y-DNA</div>';
        yClades.forEach(clade => {
            optionsHTML += `<div class="clade-option" data-value="y:${clade}" data-type="y">
                <input type="checkbox" class="clade-checkbox" data-clade="${clade}" data-type="y">
                <span>${clade}</span>
            </div>`;
        });
        optionsHTML += '</div>';
        
        // mtDNA column
        optionsHTML += '<div class="clade-column">';
        optionsHTML += '<div class="clade-column-header">mtDNA</div>';
        mtClades.forEach(clade => {
            optionsHTML += `<div class="clade-option" data-value="mt:${clade}" data-type="mt">
                <input type="checkbox" class="clade-checkbox" data-clade="${clade}" data-type="mt">
                <span>${clade}</span>
            </div>`;
        });
        optionsHTML += '</div>';
        
        optionsHTML += '</div>';
        customOptions.innerHTML = optionsHTML;
        
        // Toggle dropdown
        customSelect.addEventListener('click', (e) => {
            e.stopPropagation();
            customSelect.classList.toggle('active');
            customOptions.classList.toggle('active');
        });
        
        // Handle reset option
        const resetOption = customOptions.querySelector('.reset-option');
        if (resetOption) {
            resetOption.addEventListener('click', (e) => {
                e.stopPropagation();
                this.currentYClade = 'all';
                this.currentMtClade = 'all';
                selectedText.textContent = 'All Clades';
                
                // Uncheck all checkboxes
                customOptions.querySelectorAll('.clade-checkbox').forEach(cb => {
                    cb.checked = false;
                });
                
                this.applyFilters();
            });
        }
        
        // Handle checkbox clicks
        customOptions.querySelectorAll('.clade-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = checkbox.dataset.type;
                const clade = checkbox.dataset.clade;
                
                if (type === 'y') {
                    // Uncheck other Y-DNA checkboxes
                    customOptions.querySelectorAll('.clade-checkbox[data-type="y"]').forEach(cb => {
                        if (cb !== checkbox) cb.checked = false;
                    });
                    this.currentYClade = checkbox.checked ? clade : 'all';
                } else if (type === 'mt') {
                    // Uncheck other mtDNA checkboxes
                    customOptions.querySelectorAll('.clade-checkbox[data-type="mt"]').forEach(cb => {
                        if (cb !== checkbox) cb.checked = false;
                    });
                    this.currentMtClade = checkbox.checked ? clade : 'all';
                }
                
                // Update display text
                this.updateCladeDisplayText(selectedText);
                
                // Apply filters
                this.applyFilters();
            });
        });
        
        // Handle clicks on the option div (toggle the checkbox)
        customOptions.querySelectorAll('.clade-option:not(.reset-option)').forEach(option => {
            option.addEventListener('click', (e) => {
                if (e.target.classList.contains('clade-checkbox')) return; // Already handled
                e.stopPropagation();
                const checkbox = option.querySelector('.clade-checkbox');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('click'));
                }
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            customSelect.classList.remove('active');
            customOptions.classList.remove('active');
        });
    }
    
    /**
     * Update clade display text based on selections
     */
    updateCladeDisplayText(selectedText) {
        const parts = [];
        if (this.currentYClade && this.currentYClade !== 'all') {
            parts.push(this.currentYClade);
        }
        if (this.currentMtClade && this.currentMtClade !== 'all') {
            parts.push(this.currentMtClade);
        }
        
        if (parts.length === 0) {
            selectedText.textContent = 'All Clades';
        } else {
            selectedText.textContent = parts.join(', ');
        }
    }
    
    /**
     * Initialize custom location dropdown with two-column layout
     */
    initializeLocationDropdown(states, allVillages) {
        const customSelect = document.getElementById('locationSelect');
        const customOptions = document.getElementById('locationOptions');
        const selectedText = customSelect?.querySelector('.selected-text');
        
        if (!customSelect || !customOptions || !selectedText) {
            console.warn('⚠️ Custom location dropdown elements not found');
            return;
        }
        
        // Store current selections as arrays for multi-select
        this.selectedStates = [];
        this.selectedVillages = [];
        this.allStates = states;
        this.allVillages = allVillages;
        
        // Get village-to-state mapping from data
        this.villageToStateMap = {};
        this.dataLoader.heritageData.forEach(family => {
            const village = family.location?.village?.main?.native || 
                          family.location?.village?.main?.russian || 
                          family.location?.village?.main?.english;
            const state = family.location?.state?.main?.native || 
                        family.location?.state?.main?.russian || 
                        family.location?.state?.main?.english;
            if (village && state) {
                this.villageToStateMap[village] = state;
            }
        });
        
        // Initial render with all villages
        this.renderLocationOptions(customOptions, states, allVillages);
        
        // Toggle dropdown
        customSelect.addEventListener('click', (e) => {
            e.stopPropagation();
            customSelect.classList.toggle('active');
            customOptions.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            customSelect.classList.remove('active');
            customOptions.classList.remove('active');
        });
    }
    
    /**
     * Render location dropdown options with checkboxes
     */
    renderLocationOptions(customOptions, states, villages) {
        // Build two-column options HTML with checkboxes
        let optionsHTML = '<div class="location-option reset-option" data-value="all"><span class="option-text">Reset All</span></div>';
        optionsHTML += '<div class="location-columns">';
        
        // State column
        optionsHTML += '<div class="location-column">';
        optionsHTML += '<div class="location-column-header">State</div>';
        states.forEach(state => {
            const isChecked = this.selectedStates?.includes(state) ? 'checked' : '';
            optionsHTML += `<div class="location-option" data-value="state:${state}" data-type="state">
                <input type="checkbox" class="location-checkbox" data-location="${state}" data-type="state" ${isChecked}>
                <span>${state}</span>
            </div>`;
        });
        optionsHTML += '</div>';
        
        // Village column
        optionsHTML += '<div class="location-column">';
        optionsHTML += '<div class="location-column-header">Village</div>';
        villages.forEach(village => {
            const isChecked = this.selectedVillages?.includes(village) ? 'checked' : '';
            optionsHTML += `<div class="location-option" data-value="village:${village}" data-type="village">
                <input type="checkbox" class="location-checkbox" data-location="${village}" data-type="village" ${isChecked}>
                <span>${village}</span>
            </div>`;
        });
        optionsHTML += '</div>';
        
        optionsHTML += '</div>';
        customOptions.innerHTML = optionsHTML;
        
        // Handle reset option
        const resetOption = customOptions.querySelector('.reset-option');
        if (resetOption) {
            resetOption.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectedStates = [];
                this.selectedVillages = [];
                const customSelect = document.getElementById('locationSelect');
                const selectedText = customSelect?.querySelector('.selected-text');
                if (selectedText) selectedText.textContent = 'All Locations';
                
                // Uncheck all checkboxes
                customOptions.querySelectorAll('.location-checkbox').forEach(cb => {
                    cb.checked = false;
                });
                
                // Re-render with all villages
                this.renderLocationOptions(customOptions, this.allStates, this.allVillages);
                
                this.applyFilters();
            });
        }
        
        // Handle checkbox clicks
        customOptions.querySelectorAll('.location-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = checkbox.dataset.type;
                const location = checkbox.dataset.location;
                
                if (type === 'state') {
                    if (checkbox.checked) {
                        if (!this.selectedStates.includes(location)) {
                            this.selectedStates.push(location);
                        }
                    } else {
                        this.selectedStates = this.selectedStates.filter(s => s !== location);
                    }
                    
                    // Update village list based on selected states
                    if (this.selectedStates.length > 0) {
                        const filteredVillages = this.allVillages.filter(village => 
                            this.selectedStates.includes(this.villageToStateMap[village])
                        );
                        this.renderLocationOptions(customOptions, this.allStates, filteredVillages);
                    } else {
                        this.renderLocationOptions(customOptions, this.allStates, this.allVillages);
                    }
                } else if (type === 'village') {
                    if (checkbox.checked) {
                        if (!this.selectedVillages.includes(location)) {
                            this.selectedVillages.push(location);
                        }
                    } else {
                        this.selectedVillages = this.selectedVillages.filter(v => v !== location);
                    }
                }
                
                // Update display text
                this.updateLocationDisplayText();
                
                // Apply filters
                this.applyFilters();
            });
        });
        
        // Handle clicks on the option div (toggle the checkbox)
        customOptions.querySelectorAll('.location-option:not(.reset-option)').forEach(option => {
            option.addEventListener('click', (e) => {
                if (e.target.classList.contains('location-checkbox')) return; // Already handled
                e.stopPropagation();
                const checkbox = option.querySelector('.location-checkbox');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('click', { bubbles: true }));
                }
            });
        });
    }
    
    /**
     * Update location display text based on selections
     */
    updateLocationDisplayText() {
        const customSelect = document.getElementById('locationSelect');
        const selectedText = customSelect?.querySelector('.selected-text');
        if (!selectedText) return;
        
        const parts = [];
        if (this.selectedStates.length > 0) {
            parts.push(...this.selectedStates);
        }
        if (this.selectedVillages.length > 0) {
            parts.push(...this.selectedVillages);
        }
        
        if (parts.length === 0) {
            selectedText.textContent = 'All Locations';
        } else if (parts.length <= 2) {
            selectedText.textContent = parts.join(', ');
        } else {
            selectedText.textContent = `${parts.length} locations`;
        }
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
        // Search input event
        const searchInput = document.getElementById('searchInput');
        const clearSearchBtn = document.getElementById('clearSearch');
        
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                
                // Show/hide clear button
                if (clearSearchBtn) {
                    clearSearchBtn.style.display = query ? 'flex' : 'none';
                }
                
                // Debounce search
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentSearch = query;
                    this.displayedResults = 0;
                    this.loadResults();
                }, 300);
            });
        }
        
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                clearSearchBtn.style.display = 'none';
                this.currentSearch = '';
                this.displayedResults = 0;
                this.loadResults();
            });
        }
        
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
        const ethnicities = this.selectedEthnicities?.length > 0 ? this.selectedEthnicities : ['all'];
        const villages = this.selectedVillages?.length > 0 ? this.selectedVillages : ['all'];
        const states = this.selectedStates?.length > 0 ? this.selectedStates : ['all'];
        const yClade = this.currentYClade || 'all';
        const mtClade = this.currentMtClade || 'all';
        
        console.log('🔍 Applying filters:', { ethnicities, villages, states, yClade, mtClade });
        
        // Store current filters
        this.currentFilters = { ethnicities, villages, states, yClade, mtClade };
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
            let processedData = this.dataLoader.getProcessedData(filters, this.currentSort);
            
            // Apply search filter if search query exists
            if (this.currentSearch) {
                const searchResults = this.dataLoader.searchFamilies(this.currentSearch);
                // Combine search with filters - only show results that match both
                processedData = processedData.filter(family => 
                    searchResults.some(sr => sr.id === family.id)
                );
            }

            // Update maps with filtered data
            if (window.heritageMaps && window.heritageMaps.initialized) {
                window.heritageMaps.updateWithFilteredData(processedData);
            }

            // Update statistics with filtered data
            if (window.heritageStatistics && window.heritageStatistics.initialized) {
                window.heritageStatistics.updateWithFilteredData(processedData);
            }

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

        // Get ethnicity flag
        const ethnicityMain = (data.ethnicity?.main?.english || '').toLowerCase();
        const flagMap = {
            'abazin': 'abazin-flag.png',
            'abkhazian': 'abkhazian-flag.png',
            'circassian': 'circassian-flag.png',
            'karachay': 'karachay-flag.jpg',
            'balkar': 'balkaria-flag.png',
            'ossetian': 'ossetia-flag.png'
        };
        const ethnicityFlag = flagMap[ethnicityMain] || null;
        
        // Escape all text data to prevent XSS
        const safe = {
            id: this.escapeHtml(data.id),
            ethnicity: this.escapeHtml(data.ethnicity?.main?.sub?.english || data.ethnicity?.main?.english || data.ethnicity_sub || 'Unknown'),
            ethnicityFlag: ethnicityFlag ? `assets/img/${ethnicityFlag}` : null,
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
                data-ethnicity="${(data.ethnicity?.main?.sub?.english || data.ethnicity?.main?.english || data.ethnicity_sub || '').toLowerCase()}" 
                data-id="${safe.id}">

                <!-- COLLAPSED VIEW - Summary Line -->
                <div class="result-summary">
                    <div class="summary-avatar ${data.gender === 'male' ? 'male' : data.gender === 'female' ? 'female' : ''}">
                        ${safe.ethnicityFlag ? 
                            `<img src="${safe.ethnicityFlag}" alt="${safe.ethnicity} flag">` : 
                            `<div class="summary-avatar-initials">${this.getFamilyInitials(safe.familyNameEnglish)}</div>`
                        }
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
                                <span class="summary-value">${data.gender === 'female' ? '—' : (safe.yDnaHaplogroup || '—')}</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">mtDNA:</span>
                                <span class="summary-value">${safe.mtDnaHaplogroup || '—'}</span>
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
                                ${safe.ethnicityFlag ? 
                                    `<img src="${safe.ethnicityFlag}" alt="${safe.ethnicity} flag">` : 
                                    `<div class="family-avatar-initials">${this.getFamilyInitials(safe.familyNameEnglish)}</div>`
                                }
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
                // Clear search
                const searchInput = document.getElementById('searchInput');
                const clearSearchBtn = document.getElementById('clearSearch');
                if (searchInput) {
                    searchInput.value = '';
                    this.currentSearch = '';
                }
                if (clearSearchBtn) {
                    clearSearchBtn.style.display = 'none';
                }
                
                // Reset custom ethnicity dropdown
                this.selectedEthnicities = [];
                const selectedText = document.querySelector('#ethnicitySelect .selected-text');
                if (selectedText) selectedText.textContent = 'All Ethnicities';
                // Uncheck all ethnicity checkboxes
                const ethnicityOptions = document.getElementById('ethnicityOptions');
                if (ethnicityOptions) {
                    ethnicityOptions.querySelectorAll('.ethnicity-checkbox').forEach(cb => {
                        cb.checked = false;
                    });
                }
                
                // Reset custom clade dropdown
                this.currentYClade = 'all';
                this.currentMtClade = 'all';
                const cladeSelectedText = document.querySelector('#cladeSelect .selected-text');
                if (cladeSelectedText) cladeSelectedText.textContent = 'All Clades';
                // Uncheck all clade checkboxes
                const cladeOptions = document.getElementById('cladeOptions');
                if (cladeOptions) {
                    cladeOptions.querySelectorAll('.clade-checkbox').forEach(cb => {
                        cb.checked = false;
                    });
                }
                
                // Reset custom location dropdown
                this.selectedStates = [];
                this.selectedVillages = [];
                const locationSelectedText = document.querySelector('#locationSelect .selected-text');
                if (locationSelectedText) locationSelectedText.textContent = 'All Locations';
                // Re-render location options with all villages
                const locationOptions = document.getElementById('locationOptions');
                if (locationOptions && this.allStates && this.allVillages) {
                    this.renderLocationOptions(locationOptions, this.allStates, this.allVillages);
                }
                
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