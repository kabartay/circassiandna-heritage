/**
 * Configuration constants for Circassian DNA Heritage
 */

const HaplotypeConfig = {

    /**
     * Ethnicity color schema
     * Used in statistics charts and ethnicity visualizations
     */
    ETHNICITY_COLORS: {
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
    },

    /**
     * Color mapping for haplogroup roots
     * Used in DNA distribution maps and statistics
     */
    Y_DNA_HAPLOGROUP_COLORS: {
        'C': '#EDE8E6', // Light Gray
        'E': '#757575',  // Gray
        'H': '#808000',  // Olive
        'I': '#FB8C00',  // Orange
        'J': '#33A6B8',  // Blue
        'L': '#A1887f', // Light Brown
        'N': '#F6E7A8',  // Light Yellow
        'O': '#FFD22C',  // Yellow
        'Q': '#D500F9',  // Magenta
        'R': '#E6A8AD',  // Light Red
        'T': '#795548',  // Brown
        'default': '#34495e'  // Dark Blue Gray
    },

    /**
     * Y-DNA clade color schema (based on FamilyTreeDNA groups)
     * Used for Y-DNA clade statistics charts
     */
    Y_DNA_CLADE_COLORS: {
        'C1a1': '#EDE8E6', 'C1a2': '#EDE8E6', 'C1b1': '#EDE8E6', 'C1b2': '#EDE8E6',
        'C2a1': '#EDE8E6', 'C2a2': '#EDE8E6', 'C2b1': '#EDE8E6', 'C2b2': '#EDE8E6',
        'E1a1': '#757575', 'E1a2': '#757575', 'E1b1': '#757575', 'E1b2': '#757575',
        'G1a1': '#C0CA33', 'G1a2': '#C0CA33', 'G1b1': '#C8F29D', 'G1b2': '#C8F29D',
        'G2a1': '#64DD17', 'G2a2': '#2ECC71', 'G2b1': '#A5D6A7', 'G2b2': '#A5D6A7',
        'H1a1': '#808000', 'H1a2': '#808000', 'H1b1': '#808000', 'H1b2': '#808000',
        'H2a1': '#808000', 'H2a2': '#808000', 'H2b1': '#808000', 'H2b2': '#808000',
        'I1a1': '#FF631D', 'I1a2': '#FF631D', 'I1a3': '#FF631D',
        'I2a1': '#FB8C00', 'I2b1': '#FB8C00', 'I2b2': '#FB8C00', 'I2a2': '#FFD22C', 'I2c': '#FFD22C',
        'J1a1': '#B2EBF2', 'J1a2': '#B2EBF2', 'J1b1': '#B2EBF2', 'J1b2': '#B2EBF2',
        'J2a1': '#33A6B8', 'J2a2': '#2962FF', 'J2b1': '#1F63B5', 'J2b2': '#1F63B5',
        'L1a1': '#A1887f', 'L1a2': '#A1887f', 'L1b1': '#A1887f', 'L1b2': '#A1887f',
        'L2': '#A1887f', 'L2a1': '#A1887f', 'L2a2': '#A1887f',
        'N1a1': '#F6E7A8', 'N1a2': '#F6E7A8', 'N1b1': '#F6E7A8', 'N1b2': '#F6E7A8',
        'O1a1': '#FFD22C', 'O1a2': '#FFD22C', 'O1b1': '#FFD22C', 'O1b2': '#FFD22C',
        'O2a1': '#FFD22C', 'O2a2': '#FFD22C', 'O2b1': '#FFD22C', 'O2b2': '#FFD22C',
        'O3a1': '#FFD22C', 'O3a2': '#FFD22C', 'O3b1': '#FFD22C', 'O3b2': '#FFD22C',
        'Q1a1': '#D500F9', 'Q1a2': '#D500F9', 'Q1b1': '#D500F9', 'Q1b2': '#D500F9',
        'Q2a1': '#D500F9', 'Q2a2': '#D500F9', 'Q2b1': '#D500F9', 'Q2b2': '#D500F9',
        'R1a1': '#E6A8AD', 'R1a2': '#E6A8AD', 'R1b1': '#E1BEE7', 'R1b2': '#E1BEE7',
        'R2a1': '#D500F9', 'R2a2': '#D500F9', 'R2b1': '#D500F9', 'R2b2': '#D500F9',
        'T1a1': '#795548', 'T1a2': '#795548', 'T1b1': '#795548', 'T1b2': '#795548'
    },

    /**
     * Y-DNA subclade color schema (based on FamilyTreeDNA groups)
     * Used for Y-DNA subclade statistics charts
     */
    Y_DNA_SUBCLADE_COLORS: {
        // C haplogroup
        'C-M216': '#EDE8E6', 'C-M217': '#EDE8E6', 'C-M48': '#EDE8E6', 'C-M86': '#EDE8E6',
        'C-F1918': '#EDE8E6', 'C-F3830': '#EDE8E6', 'C-F9992': '#EDE8E6', 'C-F1067': '#EDE8E6',
        'C-V20': '#EDE8E6', 'C-B477': '#EDE8E6',
        
        // E haplogroup
        'E-M2': '#757575', 'E-M35': '#757575', 'E-M123': '#757575', 'E-V13': '#757575', 'E-V22': '#757575',
        
        // G haplogroup
        'G-GG313': '#C0CA33', 'G-GG349': '#C0CA33', 'G-BY1124': '#C0CA33', 'G-Z3353': '#C0CA33',
        'G-Z17774': '#C8F29D', 'G-BY116538': '#C8F29D',
        'G-Z6553': '#64DD17', 'G-Z6554': '#64DD17', 'G-Z6638': '#64DD17', 'G-Z6700': '#64DD17',
        'G-Z6702': '#64DD17', 'G-Z7940': '#64DD17', 'G-Z7941': '#64DD17', 'G-Z7943': '#64DD17',
        'G-Z31459': '#64DD17', 'G-Z31461': '#64DD17', 'G-Z31463': '#64DD17', 'G-Z45052': '#64DD17',
        'G-FGC672': '#64DD17', 'G-FGC693': '#64DD17', 'G-FGC713': '#64DD17', 'G-FGC715': '#64DD17',
        'G-FGC719': '#64DD17', 'G-FGC750': '#64DD17', 'G-FGC1053': '#64DD17', 'G-FGC1160': '#64DD17',
        'G-FGC3764': '#64DD17', 'G-FGC3780': '#64DD17', 'G-GG330': '#64DD17', 'G-FT23146': '#64DD17',
        'G-FT19842': '#64DD17',
        'G-FGC5089': '#1E8E00', 'G-FGC6662': '#1E8E00', 'G-FGC6669': '#1E8E00', 'G-M406': '#1E8E00',
        'G-CTS342': '#A5D6A7', 'G-S10654': '#A5D6A7', 'G-Z3440': '#A5D6A7', 'G-FT8419': '#A5D6A7',
        'G-PH1780': '#66BB6A', 'G-PH311': '#66BB6A', 'G-FT32900': '#66BB6A',
        'G-FT55754': '#2DBE60',
        'G-L1264': '#2ECC71', 'G-FGC21495': '#2ECC71', 'G-S9409': '#2ECC71', 'G-Y142068': '#2ECC71',
        'G-Z44145': '#2ECC71', 'G-Z30715': '#2ECC71', 'G-Z44151': '#2ECC71', 'G-FTC88737': '#2ECC71',
        'G-Y142023': '#2ECC71', 'G-FTB56229': '#2ECC71', 'G-FT12999': '#2ECC71', 'G-V7991': '#2ECC71',
        'G-Y112447': '#2ECC71', 'G-MF104773': '#2ECC71', 'G-FT9681': '#2ECC71', 'G-Y32923': '#2ECC71',
        'G-FT49803': '#2ECC71', 'G-Y32599': '#2ECC71', 'G-FTA35887': '#2ECC71', 'G-L654': '#2ECC71',
        'G-L13': '#B1C6B1',
        'G-PF3369': '#1E8E00', 'G-PF3355': '#1E8E00',
        
        // H haplogroup
        'H-M52': '#808000', 'H-M69': '#808000', 'H-M82': '#808000',
        
        // I haplogroup
        'I-Z63': '#FF631D', 'I-BY151': '#FF631D', 'I-S2078': '#FF631D', 'I-L1237': '#FF631D',
        'I-P37': '#FB8C00', 'I-P214': '#FB8C00', 'I-M223': '#FB8C00', 'I-L621': '#FB8C00',
        'I-A427': '#FB8C00', 'I-Y5382': '#FB8C00', 'I-L1294': '#FB8C00', 'I-S20602': '#FB8C00',
        'I-Y4460': '#FB8C00', 'I-Y3106': '#FB8C00', 'I-Z17855': '#FB8C00', 'I-FT8688': '#FB8C00',
        'I-Y3548': '#FB8C00',
        'I-L596': '#FFD22C', 'I-BY420': '#FFD22C', 'I-A1143': '#FFD22C', 'I-SK1270': '#FFD22C',
        
        // J haplogroup
        'J-P58': '#3DD5D8', 'J-Z1853': '#3DD5D8', 'J-FGC11': '#3DD5D8', 'J-YSC0000234': '#3DD5D8',
        'J-Z18292': '#3DD5D8', 'J-L862': '#3DD5D8',
        'J-Z1828': '#B2EBF2', 'J-Z1842': '#B2EBF2', 'J-CTS1460': '#B2EBF2', 'J-ZS3084': '#B2EBF2',
        'J-ZS3089': '#B2EBF2', 'J-ZS3042': '#B2EBF2', 'J-Z18436': '#B2EBF2',
        'J-L24': '#33A6B8', 'J-L25': '#33A6B8', 'J-L26': '#33A6B8', 'J-L70': '#33A6B8',
        'J-Z387': '#33A6B8', 'J-Z438': '#33A6B8', 'J-Z7706': '#33A6B8', 'J-PF5366': '#33A6B8',
        'J-FGC9883': '#33A6B8', 'J-Z2227': '#33A6B8', 'J-M67': '#33A6B8', 'J-M92': '#33A6B8',
        'J-Z7671': '#33A6B8', 'J-Z7675': '#33A6B8', 'J-Y11200': '#33A6B8', 'J-Y30812': '#33A6B8',
        'J-Y3612': '#33A6B8', 'J-Y7702': '#33A6B8', 'J-BY1147': '#33A6B8', 'J-S12459': '#33A6B8',
        'J-CTS900': '#33A6B8', 'J-Z500': '#33A6B8', 'J-Z515': '#33A6B8', 'J-M319': '#33A6B8',
        'J-P81': '#33A6B8', 'J-Z6065': '#33A6B8', 'J-Z7314': '#33A6B8',
        'J-SK1313': '#BBDEFB', 'J-SK1317': '#BBDEFB', 'J-SK1320': '#BBDEFB', 'J-Z35834': '#BBDEFB',
        'J-L581': '#2962FF', 'J-PF5016': '#2962FF', 'J-PH1795': '#2962FF', 'J-BY114993': '#2962FF',
        'J-Z1827': '#1F63B5', 'J-M241': '#1F63B5', 'J-M205': '#1F63B5', 'J-L283': '#1F63B5',
        'J-Z1296': '#1F63B5', 'J-Z2453': '#1F63B5',
        
        // L haplogroup
        'L-M20': '#A1887f', 'L-M22': '#A1887f', 'L-M27': '#A1887f', 'L-M317': '#A1887f',
        'L-M319': '#A1887f', 'L-M357': '#A1887f', 'L-SK1412': '#A1887f', 'L-PH8': '#A1887f',
        'L-L595': '#A1887f',
        
        // N haplogroup
        'N-TAT': '#F6E7A8', 'N-M231': '#F6E7A8', 'N-F2905': '#F6E7A8', 'N-M1845': '#F6E7A8',
        'N-M2005': '#F6E7A8', 'N-M2019': '#F6E7A8', 'N-L550': '#F6E7A8', 'N-A9407': '#F6E7A8',
        'N-PH1896': '#F6E7A8',
        
        // O haplogroup
        'O-M122': '#FFD22C', 'O-M175': '#FFD22C', 'O-M324': '#FFD22C', 'O-M134': '#FFD22C',
        
        // Q haplogroup
        'Q-L53': '#D500F9', 'Q-L54': '#D500F9', 'Q-M25': '#D500F9', 'Q-Y4800': '#D500F9',
        'Q-Y11938': '#D500F9', 'Q-BZ640': '#D500F9', 'Q-L715': '#D500F9', 'Q-L330': '#D500F9',
        'Q-Y2700': '#D500F9', 'Q-SK1392': '#D500F9', 'Q-SK1995': '#D500F9',
        
        // R haplogroup
        'R-Z280': '#F8BBD0', 'R-Z282': '#F8BBD0', 'R-Z283': '#F8BBD0', 'R-Z284': '#F8BBD0',
        'R-L664': '#F8BBD0', 'R-M458': '#F8BBD0', 'R-L1029': '#F8BBD0', 'R-L260': '#F8BBD0',
        'R-CTS1211': '#F8BBD0', 'R-CTS3402': '#F8BBD0', 'R-Y33': '#F8BBD0', 'R-Y2915': '#F8BBD0',
        'R-YP315': '#F8BBD0', 'R-YP582': '#F8BBD0', 'R-P278': '#F8BBD0', 'R-Z92': '#F8BBD0',
        'R-Y5570': '#F8BBD0',
        'R-Z93': '#E6A8AD', 'R-Z94': '#E6A8AD', 'R-Z2122': '#E6A8AD', 'R-Z2123': '#E6A8AD',
        'R-Z2124': '#E6A8AD', 'R-Z2125': '#E6A8AD', 'R-FGC82884': '#E6A8AD', 'R-Y934': '#E6A8AD',
        'R-Y874': '#E6A8AD', 'R-YP451': '#E6A8AD', 'R-YP6354': '#E6A8AD', 'R-YP449': '#E6A8AD',
        'R-YP450': '#E6A8AD', 'R-YP457': '#E6A8AD', 'R-FGC22480': '#E6A8AD', 'R-Y7094': '#E6A8AD',
        'R-BY30762': '#E6A8AD', 'R-BY60213': '#E6A8AD', 'R-Y86480': '#E6A8AD', 'R-L657': '#E6A8AD',
        'R-S23592': '#E6A8AD', 'R-Y57': '#E6A8AD', 'R-FGC4547': '#E6A8AD',
        'R-M269': '#E1BEE7', 'R-M73': '#E1BEE7', 'R-M478': '#E1BEE7', 'R-L1432': '#E1BEE7',
        'R-L1433': '#E1BEE7', 'R-L23': '#E1BEE7', 'R-L51': '#E1BEE7', 'R-Z2103': '#E1BEE7',
        'R-Z2106': '#E1BEE7', 'R-Z2109': '#E1BEE7', 'R-L584': '#E1BEE7', 'R-M12149': '#E1BEE7',
        'R-Y4364': '#E1BEE7', 'R-Y13369': '#E1BEE7',
        'R-M207': '#D500F9',
        
        // T haplogroup
        'T-M70': '#795548', 'T-Z709': '#795548', 'T-L208': '#795548', 'T-L131': '#795548',
        'T-L446': '#795548', 'T-L454': '#795548'
    },

    /**
     * Get color for a haplogroup root
     * @param {string} root - Haplogroup root letter
     * @returns {string} Hex color code
     */
    getHaplogroupColor(root) {
        return this.Y_DNA_HAPLOGROUP_COLORS[root] || this.Y_DNA_HAPLOGROUP_COLORS.default;
    },

    /**
     * Get color for an ethnicity
     * @param {string} ethnicity - Ethnicity name
     * @param {number} fallbackIndex - Index for generated fallback color
     * @returns {string} Hex color code
     */
    getEthnicityColor(ethnicity, fallbackIndex = 0) {
        if (this.ETHNICITY_COLORS[ethnicity]) {
            return this.ETHNICITY_COLORS[ethnicity];
        }
        // Fallback to generated color for unknown ethnicities
        const hue = (fallbackIndex * 137.508) % 360;
        return `hsl(${hue}, 70%, 50%)`;
    },

    /**
     * Get color for Y-DNA clade
     * @param {string} clade - Clade name (e.g., 'G2a1', 'R1a1')
     * @param {number} fallbackIndex - Index for generated fallback color
     * @returns {string} Hex color code
     */
    getYDnaCladeColor(clade, fallbackIndex = 0) {
        if (this.Y_DNA_CLADE_COLORS[clade]) {
            return this.Y_DNA_CLADE_COLORS[clade];
        }
        // Fallback to generated color for unknown clades
        const hue = (fallbackIndex * 137.508) % 360;
        return `hsl(${hue}, 60%, 55%)`;
    },

    /**
     * Get color for Y-DNA subclade
     * @param {string} subclade - Subclade name (e.g., 'G-Z6553', 'R-Z93')
     * @param {number} fallbackIndex - Index for generated fallback color
     * @returns {string} Hex color code
     */
    getYSubcladeColor(subclade, fallbackIndex = 0) {
        if (this.Y_DNA_SUBCLADE_COLORS[subclade]) {
            return this.Y_DNA_SUBCLADE_COLORS[subclade];
        }
        // Fallback to generated color for unknown subclades
        const hue = (fallbackIndex * 137.508) % 360;
        return `hsl(${hue}, 60%, 55%)`;
    }
};

// Make available globally
window.HaplotypeConfig = HaplotypeConfig;
