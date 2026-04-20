declare module '@googlemaps/three' {
  import * as THREE from 'three';

  export class ThreeJSOverlayView {
    constructor(options: { map: google.maps.Map; scene: THREE.Scene; anchor: { lat: number; lng: number } });
    requestRedraw(): void;
    setMap(map: google.maps.Map | null): void;
  }

  export function latLngToVector3Relative(
    point: { lat: number; lng: number; altitude?: number },
    anchor: { lat: number; lng: number; altitude?: number }
  ): THREE.Vector3;
}
