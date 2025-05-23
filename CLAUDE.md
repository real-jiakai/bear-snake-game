# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based Bear Snake game built with vanilla HTML5, CSS3, and JavaScript. The game is a Bear-themed variation of the classic Snake game with enhanced features including sound effects, particle animations, power-ups, and progressive difficulty.

## Development Commands

Since this is a static web project with no build system:

- **Run the game**: Open `index.html` in a web browser (no server required)
- **Test locally**: Use a simple HTTP server like `python -m http.server 8000` or `npx serve .`
- **No build/lint commands**: This project uses vanilla JavaScript with no dependencies

## Architecture

### Core Game Structure

- **Game Loop**: Main update cycle runs at configurable intervals (initially 150ms, decreases as difficulty increases)
- **Grid-based Movement**: 30x30 grid with coordinate-based positioning
- **State Management**: Game state stored in global variables (snake array, food positions, power-ups, etc.)

### Key Systems

1. **Snake/Bear System**: Array-based snake where index 0 is the head, segments follow in sequence
2. **Food System**: Regular food (10 pts) and bonus food (50 pts, temporary spawning)
3. **Power-up System**: Slow motion and score boost power-ups with limited lifetimes
4. **Particle System**: Visual effects for food collection and power-up activation
5. **Audio System**: Web Audio API-based sound generation (no external audio files)
6. **Progressive Difficulty**: Speed increases every 50 points, with slow motion power-up override

### Game State Variables

Critical global state includes:
- `snake[]`: Array of {x, y} coordinates
- `direction` & `lastDirection`: Movement vectors to prevent 180-degree turns
- `gameActive`: Controls game loop execution
- `particles[]`: Visual effect particles with lifecycle management
- `powerUps[]`: Active power-ups with position and type
- `slowMotionActive` & `slowMotionTimer`: Temporary speed modification

### Rendering Pipeline

1. Clear canvas with animated gradient background
2. Draw grid (optional visual guide)
3. Draw animated food items (pulsing effects)
4. Draw power-ups with glow effects
5. Draw bear/snake segments with directional eyes on head
6. Draw particle effects with alpha blending
7. Draw UI overlays (slow motion indicator)

## File Structure

- `index.html`: Game interface and controls
- `src/js/bear_snake.js`: All game logic, rendering, and systems
- `src/css/style.css`: Styling for game interface and responsive design

## Key Implementation Details

- **Collision Detection**: Separate functions for wall/self collision and food/power-up collection
- **Animation Timing**: Uses `gameTime` counter for consistent animation timing across systems
- **Sound Generation**: Procedural audio using oscillators (frequency, duration, waveform type)
- **Responsive Canvas**: Fixed 450x450px canvas with grid-relative sizing
- **Touch Controls**: Grid-based directional buttons for mobile compatibility

## Common Modifications

When enhancing the game:
- New power-ups: Add to `createPowerUp()` type system and `updatePowerUps()` logic
- Visual effects: Extend particle system with new colors/behaviors
- Game mechanics: Modify scoring in food collection handlers
- Audio: Add new `playSound()` calls with appropriate frequency/duration
- UI changes: Update both HTML structure and corresponding CSS