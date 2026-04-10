"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPin, Search, Navigation, Bus, Car, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

import { calculateSmartRoute } from "./actions";

export default function TransportPage() {
  const map = useMap();
  const placesLib = useMapsLibrary("places");
  const routesLib = useMapsLibrary("routes");
  const geocodingLib = useMapsLibrary("geocoding");

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  const [fallbackPolyline, setFallbackPolyline] = useState<google.maps.Polyline | null>(null);
  const [mockPath, setMockPath] = useState<google.maps.LatLng[] | null>(null);

  const [routeData, setRouteData] = useState<google.maps.DirectionsResult | any | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [taxiEstimates, setTaxiEstimates] = useState<any[] | null>(null);
  const [isMockRoute, setIsMockRoute] = useState(false);

  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);

  // Initialize Directions Service, Renderer & Geocoder
  useEffect(() => {
    if (routesLib && map && !directionsService) {
      setDirectionsService(new routesLib.DirectionsService());
      setDirectionsRenderer(new routesLib.DirectionsRenderer({ map }));
    }
    if (geocodingLib && !geocoder) {
      setGeocoder(new geocodingLib.Geocoder());
    }
  }, [routesLib, geocodingLib, map, directionsService, geocoder]);

  // Main Map Route Renderer
  useEffect(() => {
    if (!directionsRenderer || !routeData) return;
    if (isMockRoute) {
      directionsRenderer.setMap(null); // Clear previous real route if any
      return;
    }
    directionsRenderer.setMap(map);
    directionsRenderer.setDirections(routeData);
  }, [directionsRenderer, routeData, map, isMockRoute]);

  // Fallback Polyline Drawer
  useEffect(() => {
    if (!map) return;
    
    // Cleanup previous polyline
    if (fallbackPolyline) fallbackPolyline.setMap(null);

    if (mockPath && isMockRoute) {
       // @ts-ignore - Ignore optional type issues if polyline constructor isn't strictly typed
       const poly = new google.maps.Polyline({
         path: mockPath,
         geodesic: true,
         strokeColor: "#3b82f6", // tailwind blue-500
         strokeOpacity: 0.8,
         strokeWeight: 5,
       });
       poly.setMap(map);
       setFallbackPolyline(poly);

       return () => poly.setMap(null); // cleanup on unmount
    }
  }, [mockPath, isMockRoute, map]);


  const handleRouteSearch = async (travelMode: google.maps.TravelMode) => {
    if (!origin || !destination) return;
    setIsRouting(true);
    setTaxiEstimates(null);
    setRouteData(null);
    setIsMockRoute(false);

    try {
      if (!directionsService) throw new Error("Google Maps Directions API not loaded.");
      const result = await directionsService.route({
        origin,
        destination,
        travelMode,
        provideRouteAlternatives: true,
      });

      setRouteData(result);
      generateTaxiFares(result, travelMode);

    } catch (error) {
      console.warn("Google API restricted. Falling back to Skyra AI Engine for real-time distances.", error);
      setIsMockRoute(true);
      
      // Fetch REAL distance via Genkit AI Server Action
      const modeStr = travelMode === google.maps.TravelMode.TRANSIT ? 'TRANSIT' : 'DRIVE';
      const aiResponse = await calculateSmartRoute(origin, destination, modeStr);
      
      if (aiResponse.success && aiResponse.data) {
          const aiData = aiResponse.data;
          
          const realResult = {
            routes: [{
              legs: [{
                distance: { text: aiData.distanceText, value: aiData.distanceMeters },
                duration: { text: aiData.durationText, value: aiData.durationSeconds },
                steps: aiData.steps.map((step: any) => ({
                    instructions: step.instructions,
                    distance: { text: step.distanceText },
                    duration: { text: step.durationText }
                }))
              }]
            }]
          };
          setRouteData(realResult);
          generateTaxiFares(realResult, travelMode);

          // Generate physical map path since directions renderer block is engaged
          if (geocoder && map) {
            try {
              const originResult = await geocoder.geocode({ address: origin });
              const destResult = await geocoder.geocode({ address: destination });
              
              if (originResult.results[0] && destResult.results[0]) {
                 const originLatLng = originResult.results[0].geometry.location;
                 const destLatLng = destResult.results[0].geometry.location;
                 
                 const bounds = new google.maps.LatLngBounds();
                 bounds.extend(originLatLng);
                 bounds.extend(destLatLng);
                 map.fitBounds(bounds, { padding: 50 });
                 
                 setMockPath([originLatLng, destLatLng]);
              }
            } catch (geoError) {
              console.warn("Geocode fallback mapping failed - no visual routes will display", geoError);
            }
          }
      } else {
        // Final fallback if both Maps JS and AI Engine fail
        const mockResult = {
          routes: [{ legs: [{ distance: { text: "0 km", value: 0 }, duration: { text: "0 mins", value: 0 }, steps: [{ instructions: "Route calculation failed. Please check locations." }] }]}]
        };
        setRouteData(mockResult);
        generateTaxiFares(mockResult, travelMode);
      }
    } finally {
      setIsRouting(false);
    }
  };

  const generateTaxiFares = (result: any, travelMode: google.maps.TravelMode) => {
    if (travelMode === google.maps.TravelMode.DRIVING || travelMode === 'DRIVING' as any) {
        const route = result.routes[0];
        const distanceMt = route.legs[0].distance?.value || 0;
        const durationSec = route.legs[0].duration?.value || 0;

        const distanceKm = distanceMt / 1000;
        const durationMin = durationSec / 60;

        // Mock Rate generation ($2 base + $1.5/km + $0.5/min)
        const baseFare = 2.0;
        const perKm = 1.5;
        const perMin = 0.5;

        const economyFare = baseFare + (distanceKm * perKm) + (durationMin * perMin);

        setTaxiEstimates([
          { type: 'Economy Share', seats: 2, price: (economyFare * 0.7).toFixed(2), time: '3 min', icon: '🚙' },
          { type: 'Standard Taxi', seats: 4, price: economyFare.toFixed(2), time: '5 min', icon: '🚕' },
          { type: 'Premium SUV', seats: 6, price: (economyFare * 1.5).toFixed(2), time: '8 min', icon: '🚙' },
        ]);
      }
  };

  return (

    <div className="flex flex-col md:flex-row h-full w-full bg-background overflow-hidden relative">
      
      {/* Left Sidebar Control Panel - Glassmorphic */}
      <div className="w-full md:w-[450px] z-10 flex flex-col p-4 md:p-6 overflow-y-auto">
        <div className="mb-6 animate-in slide-in-from-left-4 fade-in duration-500">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Navigation className="h-8 w-8 text-primary" />
            Transport
          </h1>
          <p className="text-muted-foreground mt-2">
            Plan your multi-modal journey with real-time transit and ride-hailing options.
          </p>
        </div>

        <Tabs defaultValue="transit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="transit" className="flex items-center gap-2">
              <Bus className="h-4 w-4" /> Transit
            </TabsTrigger>
            <TabsTrigger value="taxi" className="flex items-center gap-2">
              <Car className="h-4 w-4" /> Taxi
            </TabsTrigger>
          </TabsList>

          {/* Common Input Card */}
          <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-lg mb-6">
            <CardHeader className="pb-4">
              <CardTitle>Where to?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 relative">
                <Label>Origin</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    ref={originRef}
                    placeholder="Enter starting point" 
                    className="pl-9 bg-background/50 backdrop-blur-sm"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2 relative">
                <Label>Destination</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    ref={destinationRef}
                    placeholder="Enter destination" 
                    className="pl-9 bg-background/50 backdrop-blur-sm focus-visible:ring-primary"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <TabsContent value="transit" className="animate-in fade-in duration-500">
             <Button 
                onClick={() => handleRouteSearch(google.maps.TravelMode.TRANSIT)}
                className="w-full mb-6 py-6 text-lg rounded-xl shadow-lg relative overflow-hidden group"
                disabled={!origin || !destination || isRouting}
              >
                {isRouting ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    Find Route
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              {routeData && routeData.routes[0] && (
                <div className="space-y-4 pb-8">
                  <h3 className="font-semibold text-lg flex items-center justify-between">
                    Suggested Route
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                      {routeData.routes[0].legs[0].duration?.text}
                    </Badge>
                  </h3>
                  
                  {routeData.routes[0].legs[0].steps?.map((step, idx) => (
                    <Card key={idx} className="bg-muted/30 border-none overflow-hidden hover:bg-muted/50 transition-colors">
                       <CardContent className="p-4 flex gap-4">
                         <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
                              {idx + 1}
                            </div>
                            {idx !== (routeData.routes[0].legs[0].steps?.length || 0) - 1 && (
                              <div className="w-1 h-full bg-primary/20 my-1 rounded-full" />
                            )}
                         </div>
                         <div className="flex-1">
                           {/* Step instructions are in HTML from Google Maps */}
                           <div 
                              className="text-sm font-medium leading-relaxed prose prose-sm dark:prose-invert"
                              dangerouslySetInnerHTML={{ __html: step.instructions }} 
                            />
                           <div className="text-xs text-muted-foreground mt-2 flex gap-4">
                             <span>{step.distance?.text}</span>
                             <span>{step.duration?.text}</span>
                           </div>
                         </div>
                       </CardContent>
                    </Card>
                  ))}
                </div>
              )}
          </TabsContent>

          <TabsContent value="taxi" className="animate-in fade-in duration-500">
             <Button 
                onClick={() => handleRouteSearch(google.maps.TravelMode.DRIVING)}
                className="w-full mb-6 py-6 text-lg rounded-xl shadow-lg relative overflow-hidden group bg-orange-600 hover:bg-orange-700 text-white"
                disabled={!origin || !destination || isRouting}
              >
                {isRouting ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    Estimate Fare
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              {taxiEstimates && (
                <div className="space-y-4 pb-8">
                  <div className="flex justify-between items-end mb-2">
                     <h3 className="font-semibold text-lg">Available Rides</h3>
                     <span className="text-xs flex items-center text-green-500 gap-1"><ShieldCheck className="h-3 w-3"/> Fixed Prices</span>
                  </div>
                  
                  {taxiEstimates.map((ride, idx) => (
                    <Card key={idx} className="bg-muted/30 border-none overflow-hidden hover:border-orange-500/50 hover:bg-muted/50 transition-all cursor-pointer group">
                       <CardContent className="p-4 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                           <div className="text-3xl bg-background/50 backdrop-blur rounded-full p-2 w-14 h-14 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                             {ride.icon}
                           </div>
                           <div>
                             <h4 className="font-semibold">{ride.type}</h4>
                             <p className="text-xs text-muted-foreground flex items-center gap-2">
                               <span>{ride.seats} seats</span>
                               <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                               <span>{ride.time} away</span>
                             </p>
                           </div>
                         </div>
                         <div className="text-right">
                           <div className="font-bold text-xl">${ride.price}</div>
                         </div>
                       </CardContent>
                    </Card>
                  ))}

                  <Button className="w-full py-6 mt-4 rounded-xl font-bold bg-foreground text-background hover:bg-foreground/90">
                    Book Ride Now
                  </Button>
                </div>
              )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Map Canvas */}
      <div className="hidden md:block flex-1 relative rounded-l-3xl overflow-hidden shadow-2xl border-l border-white/10 m-4 ml-0">
        <Map
          defaultCenter={{ lat: 40.7128, lng: -74.0060 }}
          defaultZoom={11}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId="transport-map"
          className="w-full h-full"
        />
        
        {/* Decorative Map Gradient Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-background/80 via-transparent to-transparent opacity-50" />
      </div>
    </div>
  );
}
