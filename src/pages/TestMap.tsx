import React from "react";
import MapComponent from "../components/MapComponent";

function TestMap() {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapComponent coords={{ lat: 20.5937, lng: 78.9629 }} /> {/* India center */}
    </div>
  );
}

export default TestMap;
