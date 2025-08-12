export type RoutePoint = {
  name: string;
  lat: number;
  lng: number;
};

export type RouteData = {
  Start_Point: RoutePoint;
  Route: RoutePoint[];
  Destination: RoutePoint;
};
