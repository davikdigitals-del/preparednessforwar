# Interactive World Map - Technical Design

## Architecture Overview

The InteractiveWorldMap component will be redesigned to use the exact pixel coordinates provided in the JSON data, with a proper coordinate conversion system to ensure accurate positioning across all screen sizes.

## Component Structure

```
InteractiveWorldMap
├── Map Container (responsive wrapper)
├── World Map Image (background)
├── Clickable Areas Overlay
│   ├── Country Area 1 (invisible clickable region)
│   ├── Country Area 2 (invisible clickable region)
│   └── ... (all countries from JSON data)
└── Debug Overlay (development only)
    ├── Debug Rectangle 1 (red border + country code)
    ├── Debug Rectangle 2 (red border + country code)
    └── ... (matching clickable areas)
```

## Coordinate Conversion System

### Problem Analysis
- **Source**: Pixel coordinates in JSON (e.g., Canada: x=303, y=259)
- **Target**: Percentage-based positioning for responsive design
- **Challenge**: Need to determine the reference dimensions for accurate conversion

### Conversion Formula
```typescript
// Assuming world map image dimensions (need to measure actual image)
const MAP_WIDTH = 2000;  // Estimated - needs actual measurement
const MAP_HEIGHT = 1000; // Estimated - needs actual measurement

const convertToPercentage = (pixelX: number, pixelY: number) => ({
  x: (pixelX / MAP_WIDTH) * 100,
  y: (pixelY / MAP_HEIGHT) * 100
});
```

### Dynamic Image Dimensions
For more accurate conversion, we'll programmatically determine image dimensions:

```typescript
const getImageDimensions = (imageSrc: string): Promise<{width: number, height: number}> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = imageSrc;
  });
};
```

## Data Management

### Country Code Mapping
Create a mapping from full country names to ISO 2-letter codes:

```typescript
const countryCodeMap: Record<string, string> = {
  "Canada": "ca",
  "United States of America": "us",
  "Mexico": "mx",
  "United Kingdom": "gb",
  "Germany": "de",
  "France": "fr",
  // ... all countries
};
```

### Data Interface
```typescript
interface CountryCoordinate {
  id: number;
  country: string;
  x: number; // pixel coordinate
  y: number; // pixel coordinate
}

interface ProcessedCountry {
  name: string;
  code: string;
  x: number; // percentage
  y: number; // percentage
  pixelX: number; // original pixel coordinate
  pixelY: number; // original pixel coordinate
}
```

## Implementation Strategy

### Phase 1: Coordinate Conversion
1. Load coordinate data from JSON
2. Determine actual world map image dimensions
3. Convert pixel coordinates to percentages
4. Implement country code mapping

### Phase 2: Debug Visualization  
1. Create debug overlay with red rectangles
2. Display country codes in debug rectangles
3. Verify positioning accuracy against actual map
4. Adjust coordinates if needed

### Phase 3: Click Functionality
1. Implement click handlers for each country area
2. Add navigation to `/countries/{countrycode}`
3. Test all country navigation routes

### Phase 4: Production Polish
1. Remove debug visualizations
2. Make clickable areas invisible
3. Add proper error handling
4. Performance optimization

## Component Implementation

### Core Component Structure
```typescript
export const InteractiveWorldMap = ({ onCountryClick, debugMode = false }: InteractiveWorldMapProps) => {
  const [processedCountries, setProcessedCountries] = useState<ProcessedCountry[]>([]);
  const [mapDimensions, setMapDimensions] = useState<{width: number, height: number}>();
  const navigate = useNavigate();

  // Load and process coordinate data
  useEffect(() => {
    const processCoordinates = async () => {
      // Get actual image dimensions
      const dimensions = await getImageDimensions('/images/world-map.png');
      setMapDimensions(dimensions);
      
      // Convert coordinates
      const processed = countryCoordinatesData.map(coord => ({
        name: coord.country,
        code: countryCodeMap[coord.country] || coord.country.toLowerCase(),
        x: (coord.x / dimensions.width) * 100,
        y: (coord.y / dimensions.height) * 100,
        pixelX: coord.x,
        pixelY: coord.y
      }));
      
      setProcessedCountries(processed);
    };
    
    processCoordinates();
  }, []);

  // ... rest of component
};
```

### Clickable Area Implementation
```typescript
{processedCountries.map((country) => (
  <div
    key={country.code}
    className={`absolute cursor-pointer ${debugMode ? 'border-2 border-red-500 bg-red-200 bg-opacity-30' : ''}`}
    style={{
      left: `${country.x}%`,
      top: `${country.y}%`,
      width: '60px',  // Adequate click area
      height: '20px', // Adequate click area
      transform: 'translate(-50%, -50%)' // Center on coordinate
    }}
    onClick={() => handleCountryClick(country)}
    title={country.name}
  >
    {debugMode && (
      <span className="font-bold text-red-900 text-xs text-center block leading-tight">
        {country.code.toUpperCase()}
      </span>
    )}
  </div>
))}
```

## Error Handling

### Missing Countries
- Handle countries in JSON that don't have country code mappings
- Log warnings for unmapped countries
- Provide fallback navigation using country name

### Image Loading
- Handle image load errors gracefully  
- Provide fallback behavior if image dimensions can't be determined
- Show loading state while processing coordinates

### Navigation Errors
- Handle cases where country page doesn't exist
- Provide user feedback for navigation failures
- Fallback to country list page

## Testing Strategy

### Coordinate Accuracy Testing
1. Visual verification in debug mode
2. Automated tests comparing expected vs actual positioning
3. Manual testing across different screen sizes
4. Cross-browser positioning verification

### Navigation Testing
1. Test navigation for all supported countries
2. Verify correct country code generation
3. Test error handling for unsupported countries

### Performance Testing
1. Measure initial load time with all countries
2. Test click responsiveness
3. Memory usage verification

## Deployment Considerations

### Production Configuration
- Set `debugMode = false` by default
- Ensure all debug styles are removed
- Optimize for performance

### Browser Compatibility
- Test positioning accuracy across major browsers
- Verify responsive behavior on mobile devices
- Handle different screen densities

## Future Enhancements

### Potential Improvements
1. Dynamic coordinate updates without redeploy
2. Country grouping for better UX
3. Search functionality for country finding
4. Analytics tracking for country interactions

### Scalability
- Support for additional coordinate data
- Multiple map versions (different projections)
- Internationalization for country names