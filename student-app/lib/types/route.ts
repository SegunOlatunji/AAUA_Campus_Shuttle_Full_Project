export interface RouteStop {
  order: number;
  name: string;
  lat: number | null;
  lng: number | null;
}

export interface RouteRecord {
  id: string;
  name: string;
  direction: 'outbound' | 'inbound';
  stops: RouteStop[];
}
