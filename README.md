# 💠 Warframe Star Chart - Interactive Achievement System

A fully interactive Warframe-inspired star chart built for GitHub Pages with achievement tracking, progression systems, and admin controls.

## 🚀 Features

- **25 Interactive Planets**: 5 core planets with 5 tier planets each
- **Achievement System**: Unlock achievements by completing objectives
- **Tier-based Progression**: Complete achievements to unlock new tiers
- **Junction System**: Navigate between connected planets
- **Warframe-style UI**: Authentic visual design with glowing effects
- **Admin Panel**: Password-protected controls for achievement management
- **Audio System**: Background music and interaction sounds
- **Touch Support**: Full mobile compatibility
- **Local Storage**: Progress automatically saved

## 📁 File Structure

```
warframe-star-chart/
├── index.html          # Main HTML file
├── styles.css          # All CSS styling
├── script.js           # JavaScript functionality
├── config.json         # Configuration settings
├── achievements.json   # Achievement data
├── README.md           # This file
└── assets/             # Asset folder (create and add images/audio)
    ├── central.png     # Central geometric image
    ├── planet.png      # Planet texture
    ├── node.png        # Achievement node
    ├── lock.png        # Locked achievement
    ├── heartbeat.png   # Heartbeat overlay
    ├── junction.png    # Junction node
    ├── bg-music.mp3    # Background music
    └── hover.mp3       # Hover sound effect
```

## 🎮 How to Use

### Basic Navigation
1. **Hover** over planets to see orbital rings and hear sound effects
2. **Click** or **scroll** to zoom into a planet and view achievements
3. **Click achievements** to view details and complete them
4. **Press Escape** or **click background** to zoom out
5. **Touch support** for mobile devices

### Achievement System
- **White nodes**: Available achievements (with heartbeat pulse)
- **Gray locks**: Locked achievements (prerequisites not met)
- **Static white**: Completed achievements
- **Junctions**: Connect to next tier planets when unlocked

### Admin Panel
1. Click the ⚙️ button in the top-right corner
2. Enter password: `warframe2025`
3. Access controls:
   - **Unlock All**: Complete all achievements
   - **Reset All**: Clear all progress
   - **Download JSON**: Export current achievement data
   - **Achievement Editor**: Edit individual achievements

## 🛠️ Setup Instructions

### 1. Download Required Assets

You need to download these assets and place them in the `assets/` folder:

- **central.png**: `https://files.catbox.moe/8eyie5.png`
- **planet.png**: `https://files.catbox.moe/b0zug5.png`  
- **lock.png**: `https://files.catbox.moe/jbhsjx.png`
- **heartbeat.png**: `https://files.catbox.moe/2tciqz.png`
- **node.png**: `https://files.catbox.
