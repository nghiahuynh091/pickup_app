// import { Ionicons } from "@expo/vector-icons";
// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { Dimensions, StyleSheet, Text, View } from "react-native";
// import MapView, { Marker, Polyline, Region } from "react-native-maps";
// import { Hangout, Location } from "../../types/session.types";

// interface HangoutMapViewProps {
//   hangout: Hangout;
//   liveLocations: Record<string, Location>;
//   currentUserId: string;
//   myLocation?: Location | null;
//   onLocationUpdate?: (location: Location) => void;
// }

// const { width, height } = Dimensions.get("window");
// const ASPECT_RATIO = width / height;
// const LATITUDE_DELTA = 0.01;
// const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// export const HangoutMapView: React.FC<HangoutMapViewProps> = ({
//   hangout,
//   liveLocations,
//   currentUserId,
//   myLocation,
//   onLocationUpdate,
// }) => {
//   const mapRef = useRef<MapView>(null);
//   const [region, setRegion] = useState<Region>({
//     latitude: hangout.destination.lat,
//     longitude: hangout.destination.lng,
//     latitudeDelta: LATITUDE_DELTA,
//     longitudeDelta: LONGITUDE_DELTA,
//   });

//   // Center map on all participants and destination (optimized)
//   useEffect(() => {
//     if (mapRef.current && Object.keys(liveLocations).length > 0) {
//       // Debounce map updates to avoid excessive re-renders
//       const timer = setTimeout(() => {
//         const coordinates = [
//           // Destination
//           {
//             latitude: hangout.destination.lat,
//             longitude: hangout.destination.lng,
//           },
//           // All participant locations
//           ...Object.values(liveLocations).map((loc) => ({
//             latitude: loc.lat,
//             longitude: loc.lng,
//           })),
//         ];

//         mapRef.current?.fitToCoordinates(coordinates, {
//           edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
//           animated: true,
//         });
//       }, 500); // Debounce for 500ms

//       return () => clearTimeout(timer);
//     }
//   }, [liveLocations, hangout.destination]);

//   const getParticipantStatus = useCallback(
//     (participantId: string) => {
//       return hangout.participantInfo[participantId]?.status || "Idle";
//     },
//     [hangout.participantInfo]
//   );

//   const getStatusColor = useCallback((status: string) => {
//     switch (status) {
//       case "On My Way":
//         return "#3b82f6";
//       case "5 Mins Left":
//         return "#f59e0b";
//       case "Arrived":
//         return "#10b981";
//       case "Idle":
//         return "#6b7280";
//       default:
//         return "#6b7280";
//     }
//   }, []);

//   const calculateDistance = useCallback(
//     (loc1: Location, loc2: Location): number => {
//       const R = 6371; // Earth's radius in kilometers
//       const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
//       const dLon = ((loc2.lng - loc1.lng) * Math.PI) / 180;
//       const a =
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos((loc1.lat * Math.PI) / 180) *
//           Math.cos((loc2.lat * Math.PI) / 180) *
//           Math.sin(dLon / 2) *
//           Math.sin(dLon / 2);
//       const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//       return R * c;
//     },
//     []
//   );

//   // Memoize the participants count to avoid recalculation
//   const participantsCount = useMemo(() => {
//     return Object.keys(liveLocations).length;
//   }, [liveLocations]);

//   // Memoize distance calculation
//   const distanceToDestination = useMemo(() => {
//     if (!myLocation) return null;
//     return calculateDistance(myLocation, hangout.destination).toFixed(1);
//   }, [myLocation, hangout.destination, calculateDistance]);

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         initialRegion={region}
//         showsUserLocation={true}
//         showsMyLocationButton={true}
//         showsCompass={true}
//         showsScale={true}
//         mapType="standard"
//       >
//         {/* Destination Marker */}
//         <Marker
//           coordinate={{
//             latitude: hangout.destination.lat,
//             longitude: hangout.destination.lng,
//           }}
//           title={hangout.destination.name}
//           description={hangout.destination.address}
//           pinColor="#ef4444"
//         >
//           <View style={styles.destinationMarker}>
//             <Ionicons name="flag" size={24} color="#ffffff" />
//           </View>
//         </Marker>

//         {/* Participant Markers */}
//         {Object.entries(liveLocations).map(([participantId, location]) => {
//           const status = getParticipantStatus(participantId);
//           const isCurrentUser = participantId === currentUserId;
//           const statusColor = getStatusColor(status);

//           return (
//             <Marker
//               key={participantId}
//               coordinate={{
//                 latitude: location.lat,
//                 longitude: location.lng,
//               }}
//               title={
//                 isCurrentUser ? "You" : `Friend ${participantId.slice(-4)}`
//               }
//               description={`Status: ${status}`}
//             >
//               <View
//                 style={[
//                   styles.participantMarker,
//                   {
//                     backgroundColor: statusColor,
//                     borderColor: isCurrentUser ? "#ffffff" : statusColor,
//                     borderWidth: isCurrentUser ? 3 : 1,
//                   },
//                 ]}
//               >
//                 <Ionicons
//                   name={isCurrentUser ? "person" : "people"}
//                   size={16}
//                   color="#ffffff"
//                 />
//               </View>
//             </Marker>
//           );
//         })}

//         {/* Draw lines from participants to destination */}
//         {Object.entries(liveLocations).map(([participantId, location]) => (
//           <Polyline
//             key={`line-${participantId}`}
//             coordinates={[
//               { latitude: location.lat, longitude: location.lng },
//               {
//                 latitude: hangout.destination.lat,
//                 longitude: hangout.destination.lng,
//               },
//             ]}
//             strokeColor={getStatusColor(getParticipantStatus(participantId))}
//             strokeWidth={2}
//           />
//         ))}
//       </MapView>

//       {/* Map Info Overlay */}
//       <View style={styles.infoOverlay}>
//         <View style={styles.destinationInfo}>
//           <Ionicons name="flag" size={16} color="#ef4444" />
//           <Text style={styles.destinationText}>{hangout.destination.name}</Text>
//         </View>

//         <View style={styles.participantsInfo}>
//           <Text style={styles.participantsCount}>
//             {participantsCount} / {hangout.participants.length} online
//           </Text>
//         </View>
//       </View>

//       {/* Distance Info */}
//       {distanceToDestination && (
//         <View style={styles.distanceOverlay}>
//           <View style={styles.distanceInfo}>
//             <Ionicons name="location" size={14} color="#3b82f6" />
//             <Text style={styles.distanceText}>
//               {distanceToDestination} km to destination
//             </Text>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
//   destinationMarker: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#ef4444",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: "#ffffff",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   participantMarker: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   infoOverlay: {
//     position: "absolute",
//     top: 10,
//     left: 10,
//     right: 10,
//     backgroundColor: "#ffffff",
//     borderRadius: 12,
//     padding: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   destinationInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   destinationText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#111827",
//     marginLeft: 6,
//   },
//   participantsInfo: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   participantsCount: {
//     fontSize: 12,
//     color: "#6b7280",
//     fontWeight: "500",
//   },
//   distanceOverlay: {
//     position: "absolute",
//     bottom: 20,
//     left: 10,
//     right: 10,
//   },
//   distanceInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#ffffff",
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     alignSelf: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   distanceText: {
//     fontSize: 12,
//     color: "#374151",
//     fontWeight: "500",
//     marginLeft: 4,
//   },
// });
