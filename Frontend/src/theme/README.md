# Centralized Theme Configuration

This directory contains the centralized theme configuration for the entire app. Update colors here to change the theme across all pages and components.

## File Structure

- `colors.js` - Main theme color definitions (simplified)
- `index.js` - Theme exports and helper functions

## Usage

### Import Theme

```javascript
import { themeColors } from '../../theme';
```

### Using Theme Colors

#### 1. Home Page Gradient
```javascript
// Background gradient
style={{ background: themeColors.backgroundGradient }}
```

#### 2. Button Color
```javascript
// Button color
style={{ backgroundColor: themeColors.button }}
```

#### 3. Icon Color
```javascript
// Icon color
style={{ color: themeColors.icon }}
```

## Changing Theme

To change the entire app theme, simply update values in `colors.js`:

```javascript
const themeColors = {
  backgroundGradient: 'linear-gradient(...)',  // Homepage gradient
  button: '#00a6a6',                           // Button color
  icon: '#29ad81',                             // Icon color
};
```

All components using `themeColors` will automatically update!

## Available Theme Properties

- `backgroundGradient` - Homepage background gradient
- `button` - Button color (#00a6a6)
- `icon` - Icon color (#29ad81)

