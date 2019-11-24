var cols = 9;
var rows = 13;
var grid = new Array(cols);
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
]

var obstacle_coords = [
    [0, 0], [0, 1], [0, 12], [0, 11], [8, 0], [8, 1], [8, 12], [8, 11],
    [2, 1], [3, 1], [5, 1], [6, 1], [3, 2], [5, 2], [0, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3],
    [8, 3], [0, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [8, 5], [3, 6], [4, 6], [5, 6], 
    [0, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [8, 7], [0, 9], [2, 9], [3, 9], [4, 9], [5, 9], [6, 9], 
    [8, 9], [3, 10], [5, 10], [2, 11], [3, 11], [5, 11], [6, 11]
]

var w_coords = [  // location of warehouses
    [0, 10],
    [2, 10],
    [0, 6],
    [2, 6],
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
    [0, 8], [8, 8], [0, 4], [8, 4], [4, 2]
];

function Tile(i, j) {
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.x = i;
    this.y = j;
    this.warehouse = false;
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
    
}

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
    return destinations;//take warehouse coords and return the coords of house that require materials from that warehouse
}

function findPath(h_loc, w_loc, current){
    var openSet = [];
    var closedSet = [];
    openSet.push(current);
    
    var lowestf = 0;
    while(openSet.length != 0){
        for(var i = 0; i<openSet.length; i++){
            if(openSet[i].f < openSet[lowestf].f){
                lowestf = i;
            }    
        }
        if(openSet[lowestf].x == w_loc[0] && openSet[lowestf].y == w_loc[1]){
            console.log("Found Path!!");
        }
    }                                    //funtion to apply A* and find path to from the given start to end and return the time for the path
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
  start_tile = grid[4][10];
    var shiggy = closestWarehouse(start_tile.x, start_tile.y);
    var array = findRequirements(shiggy[0]["id"], shiggy[1]["id"]);
    console.log(array);
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
 
    /*while(houses_left.length != 0){
        var warehouses = closestWarehouse(current_tile.x, current_tile.y); 
    }*/
 
    
}