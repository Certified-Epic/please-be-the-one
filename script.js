class WarframeStarChart {
    constructor() {
        this.config = {
            orbitRadius: 300,
            planetSize: 80,
            animationSpeed: 1,
            glowIntensity: 1
        };
        
        this.achievements = {};
        this.currentZoom = null;
        this.audioEnabled = false;
        this.adminPassword = 'warframe2025';
        
        this.init();
    }
    
    async init() {
        await this.loadConfig();
        await this.loadAchievements();
        this.setupAudio();
        this.setupEventListeners();
        this.createPlanets();
        this.startDataPulses();
        this.enableBackgroundMusic();
    }
    
    async loadConfig() {
        try {
            const response = await fetch('config.json');
            const config = await response.json();
            this.config = { ...this.config, ...config };
        } catch (error) {
            console.log('Using default config');
        }
    }
    
    async loadAchievements() {
        try {
            const response = await fetch('achievements.json');
            this.achievements = await response.json();
        } catch (error) {
            console.error('Failed to load achievements:', error);
            this.achievements = { planets: {} };
        }
    }
    
    setupAudio() {
        this.bgMusic = document.getElementById('bg-music');
        this.hoverSound = document.getElementById('hover-sound');
        
        // Enable audio on first user interaction
        document.addEventListener('click', () => {
            if (!this.audioEnabled) {
                this.audioEnabled = true;
                this.bgMusic.volume = 0.3;
                this.hoverSound.volume = 0.5;
            }
        }, { once: true });
    }
    
    enableBackgroundMusic() {
        if (this.audioEnabled) {
            this.bgMusic.play().catch(e => console.log('Audio autoplay prevented'));
        }
    }
    
    playHoverSound() {
        if (this.audioEnabled) {
            this.hoverSound.currentTime = 0;
            this.hoverSound.play().catch(e => console.log('Audio play failed'));
        }
    }
    
    setupEventListeners() {
        // Modal close
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Complete achievement
        document.getElementById('complete-btn').addEventListener('click', (e) => {
            const achievementId = e.target.dataset.achievementId;
            const planetId = e.target.dataset.planetId;
            if (achievementId && planetId) {
                this.completeAchievement(planetId, achievementId);
                this.closeModal();
            }
        });
        
        // Admin panel
        document.getElementById('admin-toggle').addEventListener('click', () => {
            this.toggleAdminPanel();
        });
        
        document.getElementById('admin-close').addEventListener('click', () => {
            this.hideAdminPanel();
        });
        
        document.getElementById('admin-login').addEventListener('click', () => {
            this.adminLogin();
        });
        
        // Zoom out on escape or click background
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.zoomOut();
            }
        });
        
        document.addEventListener('click', (e) => {
            if (e.target === document.getElementById('star-chart')) {
                this.zoomOut();
            }
        });
        
        // Touch support
        let touchStartY = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
    
    createPlanets() {
        const container = document.getElementById('planets-container');
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Create core planets (5 main planets)
        const coreRadius = this.config.orbitRadius;
        const corePlanets = Object.keys(this.achievements.planets).slice(0, 5);
        
        corePlanets.forEach((planetId, index) => {
            const angle = (index / corePlanets.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + Math.cos(angle) * coreRadius;
            const y = centerY + Math.sin(angle) * coreRadius;
            
            this.createPlanet(planetId, x, y, true, container);
            
            // Create tier planets for this core planet (5 tier planets each)
            const tierRadius = 150;
            const tierPlanets = this.achievements.planets[planetId]?.tiers || {};
            
            Object.keys(tierPlanets).slice(0, 5).forEach((tierId, tierIndex) => {
                const tierAngle = angle + ((tierIndex - 2) * Math.PI / 6);
                const tierX = x + Math.cos(tierAngle) * tierRadius;
                const tierY = y + Math.sin(tierAngle) * tierRadius;
                
                this.createPlanet(`${planetId}-${tierId}`, tierX, tierY, false, container, planetId);
            });
        });
    }
    
    createPlanet(planetId, x, y, isCore, container, parentPlanet = null) {
        const planet = document.createElement('div');
        planet.className = 'planet';
        planet.id = `planet-${planetId}`;
        planet.style.left = `${x - this.config.planetSize / 2}px`;
        planet.style.top = `${y - this.config.planetSize / 2}px`;
        
        // Planet image
        const img = document.createElement('img');
        img.src = 'assets/planet.png';
        img.alt = planetId;
        
        // Orbital rings
        const orbitalRings = document.createElement('div');
        orbitalRings.className = 'orbital-rings';
        
        // Hover rings
        const hoverRings = document.createElement('div');
        hoverRings.className = 'hover-rings';
        
        // Planet label
        const label = document.createElement('div');
        label.className = 'planet-label';
        label.textContent = planetId.toUpperCase().replace('-', ' ');
        
        planet.appendChild(img);
        planet.appendChild(orbitalRings);
        planet.appendChild(hoverRings);
        planet.appendChild(label);
        
        // Event listeners
        planet.addEventListener('mouseenter', () => {
            this.playHoverSound();
        });
        
        planet.addEventListener('click', () => {
            this.zoomToPlanet(planetId);
        });
        
        container.appendChild(planet);
        
        // Create achievements and junctions for this planet
        if (isCore) {
            this.createPlanetContent(planetId, x, y);
        }
    }
    
    createPlanetContent(planetId, centerX, centerY) {
        const planetData = this.achievements.planets[planetId];
        if (!planetData) return;
        
        const container = document.getElementById('planets-container');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '1';
        container.appendChild(svg);
        
        Object.entries(planetData.tiers).forEach((tierEntry, tierIndex) => {
            const [tierId, tierData] = tierEntry;
            const isUnlocked = this.isTierUnlocked(planetId, tierId);
            
            Object.entries(tierData.topics).forEach((topicEntry, topicIndex) => {
                const [topicId, achievements] = topicEntry;
                
                // Create branch from planet center to topic cluster
                const branchAngle = (topicIndex / Object.keys(tierData.topics).length) * 2 * Math.PI;
                const branchRadius = 80 + (tierIndex * 30);
                const branchEndX = centerX + Math.cos(branchAngle) * branchRadius;
                const branchEndY = centerY + Math.sin(branchAngle) * branchRadius;
                
                this.createBranch(svg, centerX, centerY, branchEndX, branchEndY);
                
                // Create achievement nodes in cluster
                achievements.forEach((achievement, achIndex) => {
                    const nodeAngle = branchAngle + ((achIndex - achievements.length / 2) * 0.3);
                    const nodeRadius = branchRadius + (achIndex % 2) * 15;
                    const nodeX = centerX + Math.cos(nodeAngle) * nodeRadius;
                    const nodeY = centerY + Math.sin(nodeAngle) * nodeRadius;
                    
                    this.createAchievementNode(achievement, nodeX, nodeY, planetId, container);
                });
                
                // Create junction node at the edge toward next tier
                if (tierIndex < Object.keys(planetData.tiers).length - 1) {
                    const junctionAngle = branchAngle;
                    const junctionRadius = branchRadius + 40;
                    const junctionX = centerX + Math.cos(junctionAngle) * junctionRadius;
                    const junctionY = centerY + Math.sin(junctionAngle) * junctionRadius;
                    
                    this.createJunctionNode(tierId, junctionX, junctionY, planetId, container);
                }
            });
        });
    }
    
    createBranch(svg, startX, startY, endX, endY) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        
        // Create curved path
        const d = `M ${startX} ${startY} Q ${midX} ${midY - 20} ${endX} ${endY}`;
        path.setAttribute('d', d);
        path.className = 'branch-path';
        
        svg.appendChild(path);
        
        // Create animated data pulse
        const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulse.className = 'data-pulse';
        pulse.setAttribute('r', '3');
        
        const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
        animateMotion.setAttribute('path', d);
        animateMotion.setAttribute('dur', '3s');
        animateMotion.setAttribute('repeatCount', 'indefinite');
        
        pulse.appendChild(animateMotion);
        svg.appendChild(pulse);
    }
    
    createAchievementNode(achievement, x, y, planetId, container) {
        const node = document.createElement('div');
        node.className = 'achievement-node';
        node.style.left = `${x - 12}px`;
        node.style.top = `${y - 12}px`;
        
        const img = document.createElement('img');
        const status = this.getAchievementStatus(planetId, achievement.id);
        
        if (status === 'locked') {
            img.src = 'assets/lock.png';
            node.classList.add('locked');
        } else if (status === 'available') {
            img.src = 'assets/node.png';
            node.classList.add('available');
            
            // Add heartbeat overlay
            const overlay = document.createElement('div');
            overlay.className = 'heartbeat-overlay';
            node.appendChild(overlay);
        } else {
            img.src = 'assets/node.png';
            node.classList.add('completed');
        }
        
        node.appendChild(img);
        
        // Event listeners
        node.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showAchievementModal(achievement, planetId);
        });
        
        // Tooltip on hover
        node.addEventListener('mouseenter', (e) => {
            this.showTooltip(e, achievement.title);
        });
        
        node.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
        
        container.appendChild(node);
    }
    
    createJunctionNode(tierId, x, y, planetId, container) {
        const node = document.createElement('div');
        node.className = 'junction-node';
        node.style.left = `${x - 12}px`;
        node.style.top = `${y - 12}px`;
        
        const img = document.createElement('img');
        img.src = 'assets/junction.png';
        
        const isUnlocked = this.isTierUnlocked(planetId, tierId);
        if (isUnlocked) {
            node.classList.add('unlocked');
        }
        
        node.appendChild(img);
        
        // Event listeners
        node.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isUnlocked) {
                // Navigate to next tier planet
                this.navigateToNextTier(planetId, tierId);
            }
        });
        
        container.appendChild(node);
    }
    
    getAchievementStatus(planetId, achievementId) {
        const planetData = this.achievements.planets[planetId];
        if (!planetData) return 'locked';
        
        // Check if achievement is completed
        if (planetData.completed && planetData.completed.includes(achievementId)) {
            return 'completed';
        }
        
        // Check if prerequisites are met
        const achievement = this.findAchievement(planetId, achievementId);
        if (!achievement) return 'locked';
        
        const tierData = this.findTierForAchievement(planetId, achievementId);
        if (!tierData) return 'locked';
        
        // Check if tier is unlocked
        if (!this.isTierUnlocked(planetId, tierData.tierId)) {
            return 'locked';
        }
        
        return 'available';
    }
    
    findAchievement(planetId, achievementId) {
        const planetData = this.achievements.planets[planetId];
        if (!planetData) return null;
        
        for (const tier of Object.values(planetData.tiers)) {
            for (const topic of Object.values(tier.topics)) {
                const achievement = topic.find(a => a.id === achievementId);
                if (achievement) return achievement;
            }
        }
        return null;
    }
    
    findTierForAchievement(planetId, achievementId) {
        const planetData = this.achievements.planets[planetId];
        if (!planetData) return null;
        
        for (const [tierId, tier] of Object.entries(planetData.tiers)) {
            for (const topic of Object.values(tier.topics)) {
                if (topic.find(a => a.id === achievementId)) {
                    return { tierId, tier };
                }
            }
        }
        return null;
    }
    
    isTierUnlocked(planetId, tierId) {
        const planetData = this.achievements.planets[planetId];
        if (!planetData) return false;
        
        // Tier 1 is always unlocked
        if (tierId === 'tier1') return true;
        
        const tierNumbers = Object.keys(planetData.tiers).sort();
        const currentTierIndex = tierNumbers.indexOf(tierId);
        
        if (currentTierIndex <= 0) return true;
        
        // Check if previous tier is completed
        const previousTier = tierNumbers[currentTierIndex - 1];
        return this.isTierCompleted(planetId, previousTier);
    }
    
    isTierCompleted(planetId, tierId) {
        const planetData = this.achievements.planets[planetId];
        if (!planetData || !planetData.tiers[tierId]) return false;
        
        const completed = planetData.completed || [];
        const tierAchievements = [];
        
        // Collect all achievements in this tier
        Object.values(planetData.tiers[tierId].topics).forEach(topic => {
            tierAchievements.push(...topic.map(a => a.id));
        });
        
        // Check if all achievements in tier are completed
        return tierAchievements.every(id => completed.includes(id));
    }
    
    zoomToPlanet(planetId) {
        this.playHoverSound();
        this.currentZoom = planetId;
        
        const starChart = document.getElementById('star-chart');
        const planet = document.getElementById(`planet-${planetId}`);
        const planetLabel = document.getElementById('planet-label');
        
        if (!planet) return;
        
        // Show planet label
        planetLabel.textContent = planetId.toUpperCase().replace('-', ' ');
        planetLabel.classList.remove('hidden');
        
        // Add zoom classes
        starChart.classList.add('zoomed');
        planet.classList.add('zoomed');
        
        // Center the planet
        const rect = planet.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const planetCenterX = rect.left + rect.width / 2;
        const planetCenterY = rect.top + rect.height / 2;
        
        const offsetX = centerX - planetCenterX;
        const offsetY = centerY - planetCenterY;
        
        starChart.style.transform = `scale(2) translate(${offsetX / 2}px, ${offsetY / 2}px)`;
    }
    
    zoomOut() {
        if (!this.currentZoom) return;
        
        const starChart = document.getElementById('star-chart');
        const planet = document.getElementById(`planet-${this.currentZoom}`);
        const planetLabel = document.getElementById('planet-label');
        
        // Hide planet label
        planetLabel.classList.add('hidden');
        
        // Remove zoom classes
        starChart.classList.remove('zoomed');
        if (planet) planet.classList.remove('zoomed');
        
        // Reset transform
        starChart.style.transform = '';
        
        this.currentZoom = null;
    }
    
    showAchievementModal(achievement, planetId) {
        const modal = document.getElementById('achievement-modal');
        const title = document.getElementById('modal-title');
        const description = document.getElementById('modal-description');
        const completeBtn = document.getElementById('complete-btn');
        
        title.textContent = achievement.title;
        description.textContent = achievement.description;
        
        const status = this.getAchievementStatus(planetId, achievement.id);
        
        if (status === 'completed') {
            completeBtn.textContent = 'Completed';
            completeBtn.disabled = true;
        } else if (status === 'available') {
            completeBtn.textContent = 'Complete';
            completeBtn.disabled = false;
            completeBtn.dataset.achievementId = achievement.id;
            completeBtn.dataset.planetId = planetId;
        } else {
            completeBtn.textContent = 'Locked';
            completeBtn.disabled = true;
        }
        
        modal.classList.remove('hidden');
    }
    
    closeModal() {
        const modal = document.getElementById('achievement-modal');
        modal.classList.add('hidden');
    }
    
    completeAchievement(planetId, achievementId) {
        if (!this.achievements.planets[planetId]) return;
        
        if (!this.achievements.planets[planetId].completed) {
            this.achievements.planets[planetId].completed = [];
        }
        
        if (!this.achievements.planets[planetId].completed.includes(achievementId)) {
            this.achievements.planets[planetId].completed.push(achievementId);
            
            // Save to localStorage
            localStorage.setItem('warframe-achievements', JSON.stringify(this.achievements));
            
            // Refresh the UI
            this.refreshPlanetContent(planetId);
        }
    }
    
    refreshPlanetContent(planetId) {
        // Remove existing achievement nodes
        const nodes = document.querySelectorAll(`.achievement-node, .junction-node`);
        nodes.forEach(node => node.remove());
        
        // Remove existing SVG paths
        const svgs = document.querySelectorAll('svg');
        svgs.forEach(svg => svg.remove());
        
        // Recreate content
        const planet = document.getElementById(`planet-${planetId}`);
        if (planet) {
            const rect = planet.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            this.createPlanetContent(planetId, centerX, centerY);
        }
    }
    
    navigateToNextTier(planetId, tierId) {
        // Implementation for navigating to connected tier planets
        console.log(`Navigating from ${planetId} tier ${tierId} to next planet`);
    }
    
    showTooltip(event, text) {
        // Simple tooltip implementation
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY - 30}px`;
        tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '5px 10px';
        tooltip.style.borderRadius = '3px';
        tooltip.style.fontSize = '12px';
        tooltip.style.zIndex = '1000';
        tooltip.style.pointerEvents = 'none';
        
        document.body.appendChild(tooltip);
        this.currentTooltip = tooltip;
    }
    
    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }
    
    startDataPulses() {
        // Data pulses are handled by CSS animations in the SVG elements
    }
    
    // Admin panel methods
    toggleAdminPanel() {
        const panel = document.getElementById('admin-panel');
        panel.classList.toggle('hidden');
    }
    
    hideAdminPanel() {
        document.getElementById('admin-panel').classList.add('hidden');
    }
    
    adminLogin() {
        const password = document.getElementById('admin-password').value;
        if (password === this.adminPassword) {
            document.getElementById('admin-controls').classList.remove('hidden');
            this.setupAdminControls();
        } else {
            alert('Invalid password');
        }
    }
    
    setupAdminControls() {
        // Setup admin control event listeners
        document.getElementById('bulk-unlock').addEventListener('click', () => {
            this.bulkUnlock();
        });
        
        document.getElementById('bulk-reset').addEventListener('click', () => {
            this.bulkReset();
        });
        
        document.getElementById('download-json').addEventListener('click', () => {
            this.downloadJSON();
        });
        
        // Populate planet and tier selects
        this.populateAdminSelects();
    }
    
    populateAdminSelects() {
        const planetSelect = document.getElementById('planet-select');
        const tierSelect = document.getElementById('tier-select');
        
        // Clear existing options
        planetSelect.innerHTML = '<option value="">Select Planet</option>';
        tierSelect.innerHTML = '<option value="">Select Tier</option>';
        
        // Populate planets
        Object.keys(this.achievements.planets).forEach(planetId => {
            const option = document.createElement('option');
            option.value = planetId;
            option.textContent = planetId.toUpperCase();
            planetSelect.appendChild(option);
        });
        
        // Handle planet selection
        planetSelect.addEventListener('change', (e) => {
            const planetId = e.target.value;
            if (planetId) {
                this.populateTierSelect(planetId);
            }
        });
    }
    
    populateTierSelect(planetId) {
        const tierSelect = document.getElementById('tier-select');
        tierSelect.innerHTML = '<option value="">Select Tier</option>';
        
        const planetData = this.achievements.planets[planetId];
        if (planetData && planetData.tiers) {
            Object.keys(planetData.tiers).forEach(tierId => {
                const option = document.createElement('option');
                option.value = tierId;
                option.textContent = tierId.toUpperCase();
                tierSelect.appendChild(option);
            });
        }
    }
    
    bulkUnlock() {
        // Unlock all achievements
        Object.keys(this.achievements.planets).forEach(planetId => {
            if (!this.achievements.planets[planetId].completed) {
                this.achievements.planets[planetId].completed = [];
            }
            
            Object.values(this.achievements.planets[planetId].tiers).forEach(tier => {
                Object.values(tier.topics).forEach(topic => {
                    topic.forEach(achievement => {
                        if (!this.achievements.planets[planetId].completed.includes(achievement.id)) {
                            this.achievements.planets[planetId].completed.push(achievement.id);
                        }
                    });
                });
            });
        });
        
        localStorage.setItem('warframe-achievements', JSON.stringify(this.achievements));
        location.reload(); // Refresh to show changes
    }
    
    bulkReset() {
        // Reset all achievements
        Object.keys(this.achievements.planets).forEach(planetId => {
            this.achievements.planets[planetId].completed = [];
        });
        
        localStorage.setItem('warframe-achievements', JSON.stringify(this.achievements));
        location.reload(); // Refresh to show changes
    }
    
    downloadJSON() {
        const dataStr = JSON.stringify(this.achievements, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'achievements.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Initialize the star chart when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load saved achievements from localStorage
    const saved = localStorage.getItem('warframe-achievements');
    if (saved) {
        try {
            const savedData = JSON.parse(saved);
            // Merge saved data with base achievements
            window.savedAchievements = savedData;
        } catch (e) {
            console.log('Failed to load saved achievements');
        }
    }
    
    new WarframeStarChart();
});
