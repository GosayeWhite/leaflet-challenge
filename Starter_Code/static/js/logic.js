
// Set variables 

let techPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
let quakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


// Perform a GET request to the query URL/
d3.json(quakeURL).then(function (data) {
  createFeatures(data.features);
});

// Set the eartchquake depth color
function setDepthColor(quakeDepth) {
    switch (true) {
        case quakeDepth > 90:
            return "#ff0000";
        case quakeDepth > 70:
            return "#ff8000";
        case quakeDepth > 50:
            return "#ffbf00";
        case quakeDepth > 30:
            return "#ffff00";
        case quakeDepth > 10:
            return "#bfff00";
        default:
            return "#00ff00";
    }
};

function setDepthRadius(feature, layer) {
    let circles = {
      radius: feature.properties.mag * 15000,
      fillColor: setDepthColor(feature.geometry.coordinates[2]),
      fillOpacity: 1,
      stroke: true,
      //color: "black",
      weight: 1
    }
    return L.circle(layer,circles);
  };


function createFeatures(earthquakeData) {

  // Create a GeoJSON layer 

  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr>
    <p><b>Magnitude</b>: ${feature.properties.mag}</p><p><b>Depth:</b> ${feature.geometry.coordinates[2]}</p>`);
}

  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: setDepthRadius
   
  });

  //Add fault lines
  techPlates = new L.layerGroup();

  // Perform a GET request to the tectonicplatesURL
  d3.json(techPlatesURL).then(function (plateData) {     
    L.geoJSON(plateData, {
        color: "#ffff00",
        weight: 2
    }).addTo(techPlates);
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  let imagery =  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

 let earthquakeBase = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topograph = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create an overlays 
  let overlayMaps = {
    "Earthquakes": earthquakes,
    "Techtonic Plates": techPlates
  };

   // Create a baseMaps
  let baseMaps = {
    "Greyscale Map": earthquakeBase,
    "Imagery Map": imagery,
    "Topographic Map": topograph
  };


// Create a legend to display information about our map.
   let info = L.control({
     position: "bottomright"
   });

   
  // Create our map, giving it the techtonic and earthquakes layers
  let myMap = L.map("map", {
    center: [52.245, -104.847],
    zoom: 4,
    layers: [earthquakeBase, earthquakes, techPlates]
  });


  
   //  insert a div with the class of "legend".
   info.onAdd = function() {
     let div = L.DomUtil.create("div", "legend");
     return div;
   };
   // Add the info legend to the map.
   info.addTo(myMap);

   var legend = L.control({position: 'bottomright'});

   legend.onAdd = function (map) {
  
    var div = L.DomUtil.create('div', 'info legend'),
        depth = [-10, 10, 30, 50, 70, 90],
        labels = [];

    // Loop through our density intervals and generate a label with a coloured square for each interval
    for (var i = 0; i < depth.length; i++) {
        div.innerHTML +=
            '<i style="background:' + setDepthColor(depth[i] + 1) + '"></i> ' +
            depth[i] + (depth[i + 1] ? ' &ndash; ' + depth[i + 1] + '<br>' : '+');
    }

    return div;
};

  legend.addTo(myMap);

  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

}