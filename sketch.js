var cols = 9;
var rows = 13;
var grid = new Array(cols);
var w, h;
var start_tile;
var current_tile;
var number_paths = 0;
var hx = 4, hy = 10;

//function to recreate the grid and reset all the tiles
function resetGrid(){
  for(var i = 0; i<cols; i++){                                                // creating tile objects
      for(var j = 0; j<rows; j++){
          grid[i][j] = new Tile(i, j);
      }
  }

  for(var i = 0; i<cols; i++){                                               // creating tile neighbors
      for(var j = 0; j<rows; j++){
          grid[i][j].addNeighbors(grid);
      }
  }
    
  for(var k = 0; k<w_coords.length; k++){                                    //update warehouses everytime in the beginning
      grid[w_coords[k]["coords"][0]][w_coords[k]["coords"][1]].warehouse = true;
      grid[w_coords[k]["coords"][0]][w_coords[k]["coords"][1]].id = w_coords[k]["id"];
  }
    
  for(var k = 0; k<obstacle_coords.length; k++){                            //make the unaccessable tiles as obstacles
      grid[obstacle_coords[k][0]][obstacle_coords[k][1]].obstacle = true;
  }
}

var houses_left = [1, 2, 3, 4, 5];

//configuration to store the warehouse number for material 1 and material 2 that is required by the house at index number
var configuration = [
    {m1: [7, 8], m2: [11, 12]},
    {m1: [3, 4], m2: [5, 6]}, 
    {m1: [9, 10], m2: [7, 8]}, 
    {m1: [1, 2], m2: []},
    {m1: [1, 2], m2: [9, 10]}
];

var obstacle_coords = [
    [0, 0], [0, 1], [0, 12], [0, 11], [8, 0], [8, 1], [8, 12], [8, 11],
    [2, 1], [3, 1], [5, 1], [6, 1], [3, 2], [5, 2], [0, 3], [2, 3], 
    [3, 3], [4, 3], [5, 3], [6, 3], [8, 3], [0, 5], [2, 5], [3, 5], 
    [4, 5], [5, 5], [6, 5], [8, 5], [3, 6], [4, 6], [5, 6], [0, 7], 
    [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [8, 7], [0, 9], [2, 9], 
    [3, 9], [4, 9], [5, 9], [6, 9], [8, 9], [3, 10], [5, 10], [2, 11], 
    [3, 11], [5, 11], [6, 11], [2, 6], [2, 2]
];

// location of warehouses
var w_coords = [  
    {id: 1, coords:[0, 10]},
    {id: 2, coords:[2, 10]},
    {id: 3, coords: [0, 6]},
    //{id: 4, coords: [2, 6]},         
    {id: 5, coords: [0, 2]},
    //{id: 6, coords: [2, 2]},
    {id: 7, coords: [6, 10]},
    {id: 8, coords: [8, 10]},
    {id: 9, coords: [6, 6]},
    {id: 10, coords: [8, 6]},
    {id: 11, coords: [6, 2]},
    {id: 12, coords: [8, 2]}
];

//location of houses
var house_coords = [   
    [0, 8], [8, 8], [0, 4], [8, 4], [4, 2]          
];

//function to update the configuration after completing each delivery
function updateConfig(h_index, w_id){
    if(configuration[h_index]["m1"].includes(w_id)){
        configuration[h_index]["m1"] = [];
    }
    if(configuration[h_index]["m2"].includes(w_id)){
        configuration[h_index]["m2"] = [];
    }
}

//function to calculate heuristic
function heuristic(tile1, housex, housey){
    var distance = dist(tile1.x, housex, tile1.y, housey);
    return distance;
}

//funtion to remove element from a given array
function removeFromArray(elt, array){                   
    for(var i = array.length-1; i>=0; i--){
        if(array[i] == elt){
            array.splice(i, 1);
        }
    }
}

function Tile(i, j) {
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.x = i;
    this.y = j;
    this.neighbors = [];
    this.warehouse = false;
    this.previous = undefined;
    if(this.warehouse){
        this.id = 0;
    }
    this.obstacle = false;
    this.show = function(r, g, b){
        fill(r, g, b);
        if(this.obstacle){
            fill(0);
        }
        if(this.warehouse){
            fill(255, 255, 0);
        }
        rect(this.x * w, this.y * h, w, h);
    }
    this.addNeighbors = function(grid){
        if (this.x < cols - 1) {
           this.neighbors.push(grid[this.x + 1][this.y]);
        }
        if (this.x > 0) {
            this.neighbors.push(grid[this.x - 1][this.y]);
        }
        if (this.y < rows - 1) {
            this.neighbors.push(grid[this.x][this.y + 1]);
        }
        if (this.y > 0) {
            this.neighbors.push(grid[this.x][this.y - 1]);
        }
    }
}

//find warehouses closest to given location
function closestWarehouse(a, b){
    var distances = [];
    for(var i = 0; i<w_coords.length; i++){
        //distances[0][i] = i+1;
        //distances[1][i] = dist(a, b, w_coords[i][0], w_coords[i][1]);
        distances.push({
            distance: dist(a, b, w_coords[i]["coords"][0], w_coords[i]["coords"][1]),
            id: w_coords[i]["id"]
        });
    } 
    distances.sort(function(x, y){
        return x.distance-y.distance
    })
    return [distances[0], distances[1]];
}

//take warehouse number and return the coords of house that require materials from that warehouse
function findRequirements(id1, id2){
    var destinations = [];
    for(var i = 0; i<configuration.length; i++){
        for(var j = 0; j<2; j++){
            if(configuration[i]["m1"][j] == id1){
                destinations.push({
                    house: i+1,
                    warehouse: id1
                });
            }
           if(configuration[i]["m2"][j] == id1){
                destinations.push({
                    house: i+1,
                    warehouse: id1
                });
            }
            if(configuration[i]["m1"][j] == id2){
                destinations.push({
                    house: i+1,
                    warehouse: id2
                });
            }
            if(configuration[i]["m2"][j] == id2){
                destinations.push({
                    house: i+1,
                    warehouse: id2
                });
            }
        }
    }     
    return destinations;
}

//funtion to apply A* and find optimal path to closest warehouse
function findPath_warehouse(w_number, current_house){
    var openSet = [];                                   
    var closedSet = [];
    var path = [];
    var f1 = 0;
    var wx, wy;
    
    //path from current position to closest warehouse
    openSet.push(current_house);
    
    while(openSet.length != 0){
        var lowestf = 0;
        for(var i = 0; i<openSet.length; i++){
            if(openSet[i].f < openSet[lowestf].f){
                lowestf = i;
            }    
        }
        var current = openSet[lowestf];
        for(var i = 0; i<w_coords.length; i++){
            if(w_coords[i]["id"] == w_number){
                wx = w_coords[i]["coords"][0];
                wy = w_coords[i]["coords"][1];
            }
        }
        if(current.x == wx && current.y == wy){
           var temp = current;
            path.push(current);
            while(temp.previous){
                path.push(temp.previous);
                temp = temp.previous;
            }
            break;
        }
        removeFromArray(current, openSet);
        closedSet.push(current);

        var neighbors = current.neighbors;
        for(var i = 0; i<neighbors.length; i++){
            if(!closedSet.includes(neighbors[i]) && !neighbors[i].obstacle){
                var tempG = current.g + 1;
                if(openSet.includes(neighbors[i])){
                    if(tempG < neighbors[i].g){
                        neighbors[i].g = tempG;
                    }
                }else{
                    neighbors[i].g = tempG;
                    openSet.push(neighbors[i]);
                }
                neighbors[i].h = heuristic(neighbors[i], wx, wy);
                neighbors[i].f = neighbors[i].g + neighbors[i].h;
                neighbors[i].previous = current;
            }
        }
    }
    for(var i = 0; i<path.length; i++){
        f1 = path[i].f + f1;                //get total f of going from current position to closest warehouse
    }
    return [f1, path];
}

//apply A* algorithm to find the most optimal path from closest warehouse to respective house
function findPath_house(h_number, current_warehouse){
    var openSet = [];                                   
    var closedSet = [];
    var path = [];
    var total_f = 0;
    
    //path from current warehouse to respective house
    openSet.push(current_warehouse);
    
    while(openSet.length != 0){
        var lowestf = 0;
        for(var i = 0; i<openSet.length; i++){
            if(openSet[i].f < openSet[lowestf].f){
                lowestf = i;
            }    
        }
        var current = openSet[lowestf];
        if(current.x == house_coords[h_number-1][0] && current.y == house_coords[h_number-1][1]){
           var temp = current;
            path.push(current);
            while(temp.previous){
                path.push(temp.previous);
                temp = temp.previous;
            }
            break;
        }
        removeFromArray(current, openSet);
        closedSet.push(current);
        
        var neighbors = current.neighbors;
        for(var i = 0; i<neighbors.length; i++){
            if(!closedSet.includes(neighbors[i]) && !neighbors[i].obstacle){
                var tempG = current.g + 1;
                if(openSet.includes(neighbors[i])){
                    if(tempG < neighbors[i].g){
                        neighbors[i].g = tempG;
                    }
                }else{
                    neighbors[i].g = tempG;
                    openSet.push(neighbors[i]);
                }
                neighbors[i].h = heuristic(neighbors[i], house_coords[h_number-1][0], house_coords[h_number-1][1]);
                neighbors[i].f = neighbors[i].g + neighbors[i].h;
                neighbors[i].previous = current;
            }
        }
    }
    for(var i = 0; i<path.length; i++){
        total_f = path[i].f + total_f;                //get total f of going from current warehouse to respective house
    }
    return [total_f, path];
}


function setup() {
  createCanvas(400, 400);
  background(0);
  w = width/cols;
  h = height/rows;
  
  for(var i = 0; i<cols; i++){   //creating the array
      grid[i] = new Array(rows);
  } 
  resetGrid();
  start_tile = grid[4][10];
  current_tile = start_tile;   
}


function draw() { 
  console.log(""); console.log("");
  resetGrid();  
  current_tile = grid[hx][hy];
  for(var i = 0; i<cols; i++){       //show the arena
      for(var j = 0; j<rows; j++){
          grid[i][j].show(255, 255, 255);
      }
  }
  start_tile.show(0, 255, 0);
  current_tile.show(255, 0, 0);
  if(houses_left.length>0){
      var route_f = [];
      var nearest_warehouses = closestWarehouse(current_tile.x, current_tile.y);
      console.log("Current Tile:", current_tile);
      console.log("Distances to the Nearest Warehouses:", nearest_warehouses);
      var possible_routes = findRequirements(nearest_warehouses[0]["id"], nearest_warehouses[1]["id"]);
      console.log("Nearest Warehouse with respective Houses:", possible_routes);
      for(var i = 0; i<possible_routes.length; i++){
          w_id = possible_routes[i]["warehouse"];
          h_id = possible_routes[i]["house"];
          var arr1 = findPath_warehouse(w_id, current_tile);
          resetGrid();
          var current_warehouse = grid[arr1[1][0].x][arr1[1][0].y];
          var arr2 = findPath_house(h_id, current_warehouse);
          var total_f = arr1[0] + arr2[0];
          var arr3 = concat(arr1[1], arr2[1]);
          route_f.push({f_value: total_f, path: arr3, warehouse: w_id, house: h_id});
      }
      var lowestf = 0;
      for(var i = 0; i<route_f.length; i++){
          if(route_f[i] < route_f[lowestf]){
              lowestf = i;
          }
      }
      
      //print out the calculated route details
      console.log("Possible Routes that can be taken from current tile:", route_f);
      console.log("The Smallest possible Path:", route_f[lowestf]);

      //remove the warehouse which has been visited and add its coordinates to obstacle_coords
      var removeIndex = w_coords.map(function(item){return item.id;}).indexOf(route_f[lowestf]["warehouse"]);
      obstacle_coords.push([w_coords[removeIndex]["coords"][0], w_coords[removeIndex]["coords"][1]]);
      w_coords.splice(removeIndex, 1);

      //change the location of current tile to the current house location
      hx = house_coords[route_f[lowestf]["house"]-1][0];
      hy = house_coords[route_f[lowestf]["house"]-1][1];
      
      //update the configuration after this delivery
      updateConfig(route_f[lowestf]["house"]-1, route_f[lowestf]["warehouse"]);
            
      //remove the completed house from houses_left array
      for(var i = 0; i<configuration.length; i++){
          if(configuration[i]["m1"].length == 0 && configuration[i]["m2"].length == 0){
              removeFromArray(i+1, houses_left);
          }
      }
      
      //print out the details of the delivery
      console.log("Going from:", current_tile.x, ",", current_tile.y);
      console.log("Going to Warehouse No.:", route_f[lowestf]["warehouse"]);
      console.log("Going to House No.:", route_f[lowestf]["house"]);  
      console.log("Updated Configuration:", configuration);
      console.log("House No. of houses left Unfullfilled:", houses_left);
      number_paths = number_paths + 1;
  }else{
      console.log("COMPLETED ALL SCHEDULED DELIVERIES!!");
      console.log("Total paths taken for Completing the Task:", number_paths);
      noLoop();
  }

    
}