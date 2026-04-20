import React, { Component, ErrorInfo, ReactNode, createContext, useContext } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapContextType {
  map: google.maps.Map | null;
  isLoaded: boolean;
}

const MapContext = createContext<MapContextType>({ map: null, isLoaded: false });
export const useMap = () => useContext(MapContext);

interface Props { children: ReactNode; }
interface State { hasError: boolean; isLoaded: boolean; map: google.maps.Map | null; }

export class MapBoundary extends Component<Props, State> {
  private mapRef = React.createRef<HTMLDivElement>();
  public state: State = { hasError: false, isLoaded: false, map: null };

  public static getDerivedStateFromError(_: Error): Partial<State> {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PulseStadium Map Error:', error, errorInfo);
  }

  public async componentDidMount() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY' || apiKey === 'your-api-key') {
      console.warn('[MapBoundary] No valid Maps API key — running in simulation mode.');
      this.setState({ isLoaded: true, map: null });
      return;
    }
    try {
      await this.loadAndInitMap(apiKey);
    } catch (err) {
      console.warn('[MapBoundary] Map load failed — simulation mode.', err);
      this.setState({ isLoaded: true, map: null });
    }
  }

  private async loadAndInitMap(apiKey: string): Promise<void> {
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });

    await loader.load();

    if (!this.mapRef.current) {
      this.setState({ isLoaded: true, map: null });
      return;
    }

    this.initializeMap();
  }

  private initializeMap() {
    if (!this.mapRef.current || !window.google?.maps) {
      this.setState({ isLoaded: true, map: null });
      return;
    }
    try {
      const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
      const mapOptions: google.maps.MapOptions = {
        center: { lat: 12.9789, lng: 77.5997 }, // M. Chinnaswamy Stadium, Bangalore
        zoom: 18,
        tilt: 55,
        heading: 30,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        keyboardShortcuts: true,
        rotateControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      };

      if (mapId && mapId !== 'YOUR_GOOGLE_MAPS_MAP_ID') {
        mapOptions.mapId = mapId;
      } else {
        // Fallback to satellite view when no custom Map ID is provided
        mapOptions.mapTypeId = 'satellite' as google.maps.MapTypeId;
      }

      const map = new google.maps.Map(this.mapRef.current, mapOptions);

      // Mark as loaded once the map is idle (tiles rendered)
      const idleListener = google.maps.event.addListenerOnce(map, 'idle', () => {
        this.setState({ map, isLoaded: true });
      });

      // Safety timeout — if idle never fires within 8s, proceed anyway
      setTimeout(() => {
        if (!this.state.isLoaded) {
          google.maps.event.removeListener(idleListener);
          this.setState({ map, isLoaded: true });
        }
      }, 8000);
    } catch (err) {
      console.warn('[MapBoundary] Map init failed:', err);
      this.setState({ isLoaded: true, map: null });
    }
  }

  public render() {
    const { hasError, isLoaded, map } = this.state;

    if (hasError) {
      return (
        <div className="w-full h-full bg-[#020617] flex flex-col items-center justify-center p-8 text-center" role="alert">
          <h2 className="text-xl font-bold mb-2 text-white">Visualization Error</h2>
          <p className="text-sm text-slate-400 mb-4">The map failed to render. Check your API key configuration.</p>
          <button
            onClick={() => this.setState({ hasError: false, isLoaded: false, map: null }, () => this.componentDidMount())}
            className="mt-4 px-6 py-2 bg-primary text-white text-xs font-bold uppercase rounded-xl"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <MapContext.Provider value={{ map, isLoaded }}>
        <div className="w-full h-full relative overflow-hidden bg-[#020617]">
          {/* The actual Google Maps container */}
          <div
            ref={this.mapRef}
            className={`absolute inset-0 transition-opacity duration-1000 ${map ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          />

          {/* Canvas overlays and glassmorphic HUD panels */}
          <div className="absolute inset-0 z-10">
            {this.props.children}
          </div>

          {/* Vignette (only full-strength in simulation mode) */}
          <div
            className={`absolute inset-0 pointer-events-none z-[5] transition-opacity duration-1000 ${map ? 'opacity-10' : 'opacity-100'}`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.15)_70%,rgba(2,6,23,0.5)_100%)]" />
          </div>

          {/* Loading spinner */}
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#020617] z-50">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-[10px] uppercase tracking-[0.5em] font-black text-primary animate-pulse">
                  Loading Stadium
                </span>
              </div>
            </div>
          )}

          {/* Simulation mode badge */}
          {isLoaded && !map && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold uppercase tracking-widest">
                ⚡ Simulation Mode — No Maps API Key
              </div>
            </div>
          )}
        </div>
      </MapContext.Provider>
    );
  }
}
