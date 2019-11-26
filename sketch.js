var cols = 9;
var rows = 13;
var grid = new Array(cols);
var rasta = [];
var w, h;
var start_tile;
//var warehouses = new Array(12);
var houses_left = ["h1", "h2", "h3", "h4", "h5"];
var configuration = [
    [7, 8, 11, 12],
    [3, 4, 5, 6],
    [9, 10, 7, 8],
    [1, 2, 0, 0],
    [1, 2, 9, 10]
];

var obstacle_coords = [
    [0, 0], [0, 1], [0, 12], [0, 11], [8, 0], [8, 1], [8, 12], [8, 11],
    [2, 1], [3, 1], [5, 1], [6, 1], [3, 2], [5, 2], [0, 3], [2, 3], 
    [3, 3], [4, 3], [5, 3], [6, 3], [8, 3], [0, 5], [2, 5], [3, 5], 
    [4, 5], [5, 5], [6, 5], [8, 5], [3, 6], [4, 6], [5, 6], [0, 7], 
    [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [8, 7], [0, 9], [2, 9], 
    [3, 9], [4, 9], [5, 9], [6, 9], [8, 9], [3, 10], [5, 10], [2, 11], 
    [3, 11], [5, 11], [6, 11]
];

var w_coords = [  // location of warehouses
    [0, 10],
    [2, 10],
    [0, 6],
    [2, 6],         //change to key value pair
    [0, 2],
    [2, 2],
    [6, 10],
    [8, 10],
    [6, 6],
    [8, 6],
    [6, 2],
    [8, 2]
];

var house_coords = [   //location of houses
    [0, 8], [8, 8], [0, 4], [8, 4], [4, 2]          //change to key value pair
];

function heuristic(tile1, housex, housey){
    var distance = dist(tile1.x, housex, tile1.y, housey);
    return distance;
}

function removeFromArray(elt, array){                   //funtion to remove element from a given array
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
    this.show = function(color){
        fill(color);
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
            distance: dist(a, b, w_coords[i][0], w_coords[i][1]),
            id: i+1
        });
    } 
    distances.sort(function(x, y){
        return x.distance-y.distance
    })
    console.log(distances);
    return [distances[0], distances[1]];
}

//take warehouse coords and return the coords of house that require materials from that warehouse
function findRequirements(id1, id2){
    var destinations = [];
    for(var i = 0; i<configuration.length; i++){
        for(var j = 0; j<4; j++){
            if(configuration[i][j] == id1){
                destinations.push({
                    house: i+1,
                    warehouse: id1
                });
            }
            if(configuration[i][j] == id2){
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
        if(current.x == w_coords[w_number-1][0] && current.y == w_coords[w_number-1][1]){
           var temp = current;
            path.push(current);
            while(temp.previous){
                path.push(temp.previous);
                temp = temp.previous;
            }
            console.log("Found Path!!");
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
                neighbors[i].h = heuristic(neighbors[i], w_coords[w_number-1][0], w_coords[w_number-1][1]);
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


function findPath_house(h_number, current_warehouse){
    var openSet = [];                                   
    var closedSet = [];
    var path = [];
    var total_f = 0;
    
    //path from current position to closest warehouse
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
            console.log("Found Path!!");
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
               if(neighbors[i].x == 2 && neighbors[i].y == 8){
                console.log(neighbors[i]);
                console.log(neighbors[i].f);
                console.log(neighbors[i].g);
                console.log(neighbors[i].h);
            }
            }
        }
    }
    for(var i = 0; i<path.length; i++){
        total_f = path[i].f + total_f;                //get total f of going from current position to closest warehouse
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
  
  for(var i = 0; i<cols; i++){  // creating tile objects
      for(var j = 0; j<rows; j++){
          grid[i][j] = new Tile(i, j);
      }
  }
  
  for(var i = 0; i<cols; i++){  // creating tile neighbors
      for(var j = 0; j<rows; j++){
          grid[i][j].addNeighbors(grid);
      }
  }
     for(var k = 0; k<12; k++){          //update warehouses everytime in the beginning
      grid[w_coords[k][0]][w_coords[k][1]].warehouse = true;
      grid[w_coords[k][0]][w_coords[k][1]].id = k+1;
  }
    
  for(var k = 0; k<obstacle_coords.length; k++){
      grid[obstacle_coords[k][0]][obstacle_coords[k][1]].obstacle = true;
  }
    
    start_tile = grid[4][10];
    var shiggy = closestWarehouse(start_tile.x, start_tile.y);
    var array = findRequirements(shiggy[0]["id"], shiggy[1]["id"]);
    rasta = findPath_warehouse(array[0]["warehouse"], start_tile);
    console.log(array);
    console.log("Raasta");
    console.log(rasta);
    
     for(var i = 0; i<cols; i++){  // creating tile objects
      for(var j = 0; j<rows; j++){
          grid[i][j] = new Tile(i, j);
      }
  }
  console.log(grid);
  for(var i = 0; i<cols; i++){  // creating tile neighbors
      for(var j = 0; j<rows; j++){
          grid[i][j].addNeighbors(grid);
      }
  }
     for(var k = 0; k<12; k++){          //update warehouses everytime in the beginning
      grid[w_coords[k][0]][w_coords[k][1]].warehouse = true;
      grid[w_coords[k][0]][w_coords[k][1]].id = k+1;
  }
    
  for(var k = 0; k<obstacle_coords.length; k++){
      grid[obstacle_coords[k][0]][obstacle_coords[k][1]].obstacle = true;
  }
    var current_warehouse = grid[6][10];
    var rasta2 = findPath_house(array[0]["house"], current_warehouse);
    console.log(rasta2);
}


function draw() {
  var current_tile = start_tile;
    
  for(var k = 0; k<12; k++){          //update warehouses everytime in the beginning
      grid[w_coords[k][0]][w_coords[k][1]].warehouse = true;
      grid[w_coords[k][0]][w_coords[k][1]].id = k+1;
  }
    
  for(var k = 0; k<obstacle_coords.length; k++){
      grid[obstacle_coords[k][0]][obstacle_coords[k][1]].obstacle = true;
  }
    
  for(var i = 0; i<cols; i++){
      for(var j = 0; j<rows; j++){
          grid[i][j].show(255);
      }
  }
    /*for (var i = 0; i<rasta.length; i++){
        rasta[i].show(0, 255, 0);
    }*/
    /*while(houses_left.length != 0){
        var warehouses = closestWarehouse(current_tile.x, current_tile.y); 
    }*/
 
    
}