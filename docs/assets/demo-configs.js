/**
 * @fileoverview Synthetic data sets for t-SNE demo and visualizations,
 * along with some utility functions.
 */
 
// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
 
 if(typeof require != "undefined") {
   // hack for loading from generator
   var d3 = require('./d3.min.js')
 }

// Euclidean distance.
function dist(a, b) {
  var d = 0;
  for (var i = 0; i < a.length; i++) {
    d += (a[i] - b[i]) * (a[i] - b[i]);
  }
  return Math.sqrt(d);
}

// Gaussian generator, mean = 0, std = 1.
var normal = d3.randomNormal();

// Create random Gaussian vector.
function normalVector(dim) {
  var p = [];
  for (var j = 0; j < dim; j++) {
    p[j] = normal();
  }
  return p;
}

// Scale the given vector.
function scale(vector, a) {
  for (var i = 0; i < vector.length; i++) {
    vector[i] *= a;
  }
}

// Add two vectors.
function add(a, b) {
  var n = a.length;
  var c = [];
  for (var i = 0; i < n; i++) {
    c[i] = a[i] + b[i];
  }
  return c;
}

// A point with color info.
var Point = function(coords, color) {
  this.coords = coords;
  this.color = color || '#039';
};

// Adds colors to points depending on 2D location of original.
function addSpatialColors(points) {
  var xExtent = d3.extent(points, function(p) {return p.coords[0]});
  var yExtent = d3.extent(points, function(p) {return p.coords[1]});
  var xScale = d3.scaleLinear().domain(xExtent).range([0, 255]);
  var yScale = d3.scaleLinear().domain(yExtent).range([0, 255]);
  points.forEach(function(p) {
    var c1 = ~~xScale(p.coords[0]);
    var c2 = ~~yScale(p.coords[1]);
    p.color = 'rgb(20,' + c1 + ',' + c2 + ')';
  });
}

// Convenience function to wrap 2d arrays as Points, using a default
// color scheme.
function makePoints(originals) {
  var points = originals.map(function(p) {return new Point(p);});
  addSpatialColors(points);
  return points;
}

// Creates distance matrix for t-SNE input.
function distanceMatrix(points) {
  var matrix = [];
  var n = points.length;
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      matrix.push(dist(points[i].coords,
                       points[j].coords));
    }
  }
  return matrix;
}

// Data in shape of 2D grid.
function gridData(size) {
  var points = [];
  for (var x = 0; x < size; x++) {
    for (var y = 0; y < size; y++) {
      points.push([x, y]);
    }
  }
  return makePoints(points);
}

// Gaussian cloud, symmetric, of given dimension.
function gaussianData(n, dim) {
  var points = [];
  for (var i = 0; i < n; i++) {
    var p = normalVector(dim);
    points.push(new Point(p));
  }
  return points;
}

// Elongated Gaussian ellipsoid.
function longGaussianData(n, dim) {
  var points = [];
  for (var i = 0; i < n; i++) {
    var p = normalVector(dim);
    for (var j = 0; j < dim; j++) {
      p[j] /= (1 + j);
    }
    points.push(new Point(p));
  }
  return points;
}

// Return a color for the given angle.
function angleColor(t) {
  var hue = ~~(300 * t / (2 * Math.PI));
  return 'hsl(' + hue + ',50%,50%)';
}

// Data in a 2D circle, regularly spaced.
function circleData(numPoints) {
  var points = [];
  for (var i = 0; i < numPoints; i++) {
    var t = 2 * Math.PI * i / numPoints;
    points.push(new Point([Math.cos(t), Math.sin(t)], angleColor(t)));
  }
  return points;
}

// Random points on a 2D circle.
function randomCircleData(numPoints) {
  var points = [];
  for (var i = 0; i < numPoints; i++) {
    var t = 2 * Math.PI * Math.random();
    points.push(new Point([Math.cos(t), Math.sin(t)], angleColor(t)));
  }
  return points;
}

// Clusters arranged in a circle.
function randomCircleClusterData(numPoints) {
  var points = [];
  for (var i = 0; i < numPoints; i++) {
    var t = 2 * Math.PI * i / numPoints;//Math.random();
    var color = angleColor(t);
    for (var j = 0; j < 20; j++) {
      var x = Math.cos(t) + .01 * normal();
      var y = Math.sin(t) + .01 * normal();
      points.push(new Point([x, y], color));
    }
  }
  return points;
}

// Two 2D clusters of different sizes.
function twoDifferentClustersData2D(n) {
  var points = [];
  for (var i = 0; i < n; i++) {
    points.push(new Point([10 * normal(),
                           10 * normal()], '#039'));
    points.push(new Point([100 + normal(),
                                normal()], '#f90'));
  }
  return points;
}

// Two clusters of the same size.
function twoClustersData(n, dim) {
  dim = dim || 50;
  var points = [];
  for (var i = 0; i < n; i++) {
    points.push(new Point(normalVector(dim), '#039'));
    var v = normalVector(dim);
    v[0] += 10;
    points.push(new Point(v, '#f90'));
  }
  return points;
}

// Two differently sized clusters, of arbitrary dimensions.
function twoDifferentClustersData(n, dim, scale) {
  dim = dim || 50;
  scale = scale || 10;
  var points = [];
  for (var i = 0; i < n; i++) {
    points.push(new Point(normalVector(dim), '#039'));
    var v = normalVector(dim);
    for (var j = 0; j < dim; j++) {
      v[j] /= scale;
    }
    v[0] += 20;
    points.push(new Point(v, '#f90'));
  }
  return points;
}

// Three clusters, at different distances from each other, in 2D
function threeClustersData2d(n) {
  var points = [];
  for (var i = 0; i < n; i++) {
    points.push(new Point([normal(),
                           normal()], '#039'));
    points.push(new Point([10 + normal(),
                                normal()], '#f90'));
    points.push(new Point([50 + normal(),
                                normal()], '#6a3'));
  }
  return points;
}

// Three clusters, at different distances from each other, in any dimension.
function threeClustersData(n, dim) {
  dim = dim || 50;
  var points = [];
  for (var i = 0; i < n; i++) {
    var p1 = normalVector(dim);
    points.push(new Point(p1, '#039'));
    var p2 = normalVector(dim);
    p2[0] += 10;
    points.push(new Point(p2, '#f90'));
    var p3 = normalVector(dim);
    p3[0] += 50;
    points.push(new Point(p3, '#6a3'));
  }
  return points;
}

// One tiny cluster inside of a big cluster.
function subsetClustersData(n, dim) {
   dim = dim || 2;
  var points = [];
  for (var i = 0; i < n; i++) {
    var p1 = normalVector(dim);
    points.push(new Point(p1, '#039'));
    var p2 = normalVector(dim);
    scale(p2, 50);
    points.push(new Point(p2, '#f90'));
  }
  return points;
}

// Data in a rough simplex.
function simplexData(n, noise) {
  noise = noise || 0.5;
  var points = [];
  for (var i = 0; i < n; i++) {
    var p = [];
    for (var j = 0; j < n; j++) {
      p[j] = i == j ? 1 + noise * normal() : 0;
    }
    points.push(new Point(p));
  }
  return points;
}

// Uniform points from a cube.
function cubeData(n, dim) {
  var points = [];
  for (var i = 0; i < n; i++) {
    var p = [];
    for (var j = 0; j < dim; j++) {
      p[j] = Math.random();
    }
    points.push(new Point(p));
  }
  return points;
}

// Points in two unlinked rings.
function unlinkData(n) {
  var points = [];
  function rotate(x, y, z) {
    var u = x;
    var cos = Math.cos(.4);
    var sin = Math.sin(.4);
    var v = cos * y + sin * z;
    var w = -sin * y + cos * z;
    return [u, v, w];
  }
  for (var i = 0; i < n; i++) {
    var t = 2 * Math.PI * i / n;
    var sin = Math.sin(t);
    var cos = Math.cos(t);
    // Ring 1.
    points.push(new Point(rotate(cos, sin, 0), '#f90'));
    // Ring 2.
    points.push(new Point(rotate(3 + cos, 0, sin), '#039'));
  }
  return points;
}

// Points in linked rings.
function linkData(n) {
  var points = [];
  function rotate(x, y, z) {
    var u = x;
    var cos = Math.cos(.4);
    var sin = Math.sin(.4);
    var v = cos * y + sin * z;
    var w = -sin * y + cos * z;
    return [u, v, w];
  }
  for (var i = 0; i < n; i++) {
    var t = 2 * Math.PI * i / n;
    var sin = Math.sin(t);
    var cos = Math.cos(t);
    // Ring 1.
    points.push(new Point(rotate(cos, sin, 0), '#f90'));
    // Ring 2.
    points.push(new Point(rotate(1 + cos, 0, sin), '#039'));
  }
  return points;
}

// Points in a trefoil knot.
function trefoilData(n) {
  var points = [];
  for (var i = 0; i < n; i++) {
    var t = 2 * Math.PI * i / n;
    var x = Math.sin(t) + 2 * Math.sin(2 * t);
    var y = Math.cos(t) - 2 * Math.cos(2 * t);
    var z = -Math.sin(3 * t);
    points.push(new Point([x, y, z], angleColor(t)));
  }
  return points;
}

// Two long, linear clusters in 2D.
function longClusterData(n) {
  var points = [];
  var s = .03 * n;
  for (var i = 0; i < n; i++) {
    var x1 = i + s * normal();
    var y1 = i + s * normal();
    points.push(new Point([x1, y1], '#039'));
    var x2 = i + s * normal() + n / 5;
    var y2 = i + s * normal() - n / 5;
    points.push(new Point([x2, y2], '#f90'));
  }
  return points;
}

// Mutually orthogonal steps.
function orthoCurve(n) {
  var points = [];
  for (var i = 0; i < n; i++) {
    var coords = [];
    for (var j = 0; j < n; j++) {
      coords[j] = j < i ? 1 : 0;
    }
    var t = 1.5 * Math.PI * i / n;
    points.push(new Point(coords, angleColor(t)));
  }
  return points;
}

// Random walk
function randomWalk(n, dim) {
  var points = [];
  var current = [];
  for (var i = 0; i < dim; i++) {
    current[i] = 0;
  }
  for (var i = 0; i < n; i++) {
    var step = normalVector(dim);
    var next = current.slice();
    for (var j = 0; j < dim; j++) {
      next[j] = current[j] + step[j];
    }
    var t = 1.5 * Math.PI * i / n;
    points.push(new Point(next, angleColor(t)));
    current = next;
  }
  return points;
}

// Random jump: a random walk with
// additional noise added at each step.
function randomJump(n, dim) {
  var points = [];
  var current = [];
  for (var i = 0; i < dim; i++) {
    current[i] = 0;
  }
  for (var i = 0; i < n; i++) {
    var step = normalVector(dim);
    var next = add(step, current.slice());
    var r = normalVector(dim);
    scale(r, Math.sqrt(dim));
    var t = 1.5 * Math.PI * i / n;
    var coords = add(r, next);
    points.push(new Point(coords, angleColor(t)));
    current = next;
  }
  return points;
}


/**
 * @fileoverview Demo configuration for t-SNE playground.
 */

var demos = [
  {
    name: 'Grid',
    description: '点と点の感覚が等しい正方格子です。さまざまなサイズで収束を試してみてください。',
    options: [
      {
        name: 'Points Per Side',
        min: 2, max: 20, start: 10,
      }
    ],
    generator: gridData
  },
  {
    name: 'Two Clusters',
    description: '同数の点を持つ2つのクラスターです。',
    options: [
      {
        name: 'Points Per Cluster',
        min: 1, max: 100, start: 50,
      },
      {
        name: 'Dimensions',
        min: 1, max: 100, start: 2,
      }
    ],
    generator: twoClustersData
  },
  {
    name: 'Three Clusters',
    description: '同数の点を持つ3つのクラスターですが、互いの距離が異なります。クラスター間の距離は、特定のパープレキシティでのみ明らかになります。',
    options: [
      {
        name: 'Points Per Cluster',
        min: 1, max: 100, start: 50,
      },
      {
        name: 'Dimensions',
        min: 1, max: 100, start: 2,
      }
    ],
    generator: threeClustersData
  },
  {
    name: 'Two Different-Sized Clusters',
    description: '同数の点を持つ2つのクラスターですが、クラスター内の分散が異なります。クラスターの分離はパープレキシティに依存します。',
    options: [
      {
        name: 'Points Per Cluster',
        min: 1, max: 100, start: 50,
      },
      {
        name: 'Dimensions',
        min: 1, max: 100, start: 2,
      },
      {
        name: 'Scale',
        min: 1, max: 10, start: 5,
      }
    ],
    generator: twoDifferentClustersData
  },
  {
    name: 'Two Long Linear Clusters',
    description: '互いに近い平行線上に配置された2組の点の集合です。線の曲がりに注目してください。',
    options: [
      {
        name: 'Points Per Cluster',
        min: 1, max: 100, start: 50,
      }
    ],
    generator: longClusterData
  },
  {
    name: 'Cluster In Cluster',
    description: '広くて疎なクラスターの中にある、密でタイトなクラスターです。ここではパープレキシティが大きな違いを生みます。',
    options: [
      {
        name: 'Points Per Cluster',
        min: 1, max: 100, start: 50,
      },
      {
        name: 'Dimensions',
        min: 1, max: 100, start: 2,
      }
    ],
    generator: subsetClustersData
  },
  {
    name: 'Circle (Evenly Spaced)',
    description: '円の中に均等に分布した点です。色相は円の中の角度に対応します。',
    options: [
      {
        name: 'Number Of Points',
        min: 1, max: 100, start: 50,
      }
    ],
    generator: circleData
  },
  {
    name: 'Circle (Randomly Spaced)',
    description: '円の中にランダムに分布した点です。色相は円の中の角度に対応します。',
    options: [
      {
        name: 'Number Of Points',
        min: 1, max: 100, start: 50,
      }
    ],
    generator: randomCircleData
  },
  {
    name: 'Gaussian Cloud',
    description: '単位ガウス分布内の点です。データは完全にランダムなので、目に見えるサブクラスターは統計的に有意ではありません。',
    options: [
      {
        name: 'Number Of Points',
        min: 1, max: 500, start: 50,
      },
      {
        name: 'Dimensions',
        min: 1, max: 100, start: 2,
      }
    ],
    generator: gaussianData
  },
  {
    name: 'Ellipsoidal Gaussian Cloud',
    description: '楕円ガウス分布内の点です。次元nは分散1/nを持ちます。プロットで伸びがわかります。',
    options: [
      {
        name: 'Number Of Points',
        min: 1, max: 500, start: 50,
      },
      {
        name: 'Dimensions',
        min: 1, max: 100, start: 2,
      }
    ],
    generator: longGaussianData
  },
  {
    name: 'Trefoil Knot',
    description: '三つ葉結び目に沿って3Dに配置された点です。実行ごとに異なる結果になることがあります。',
    options: [
      {
        name: 'Number Of Points',
        min: 1, max: 200, start: 50,
      }
    ],
    generator: trefoilData
  },
  {
    name: 'Linked Rings',
    description: '2つのリンクした円上に3Dで配置された点です。実行ごとに異なる結果になることがあります。',
    options: [
      {
        name: 'Number Of Points',
        min: 1, max: 200, start: 50,
      }
    ],
    generator: linkData
  },
  {
    name: 'Unlinked Rings',
    description: '2つのリンクしていない円上に3Dで配置された点です。',
    options: [
      {
        name: 'Number Of Points',
        min: 1, max: 200, start: 50,
      }
    ],
    generator: unlinkData
  },
  {
    name: 'Orthogonal Steps',
    description: '互いに直交するステップで関連付けられた点です。ランダムウォークに非常に似ています。',
    options: [
      {
        name: 'Number Of Points',
        min: 1, max: 500, start: 50,
      }
    ],
    generator: orthoCurve
  },
  {
    name: 'Random Walk',
    description: 'ランダム（ガウス）ウォークです。思ったよりスムーズです。',
      options: [{
        name: 'Number Of Points',
        min: 1, max: 1000, start: 100,
      },
      {
        name: 'Dimension',
        min: 1, max: 1000, start: 100,
      }
    ],
    generator: randomWalk
  },
  {
    name: 'Random Jump',
    description: 'ランダム（ガウス）ジャンプ',
    options: [
      {
        name: 'Number Of Points',
        min: 1, max: 1000, start: 100,
      },
      {
        name: 'Dimension',
        min: 1, max: 1000, start: 100,
      }
    ],
    generator: randomJump
  },
  {
    name: 'Equally Spaced',
    description: '元の空間ですべての点のペア間の距離が同じである点の集合です。',
    options: [
      {
        name: 'Number Of Points',
        min: 2, max: 100, start: 50,
      }
    ],
    generator: simplexData
  },
  {
    name: 'Uniform Distribution',
    description: '単位立方体内に一様に分布した点です。',
    options: [
      {
        name: 'Number Of Points',
        min: 2, max: 200, start: 50,
      },
      {
        name: 'Dimensions',
        min: 1, max: 10, start: 3,
      }
    ],
    generator: cubeData
  }
];

var demosByName = {}
demos.forEach(function(d, i) {
  d.index = i;
  demosByName[d.name] = d;
})

if(typeof module != "undefined") module.exports = {
  demos: demos,
  demosByName: demosByName,
  distanceMatrix: distanceMatrix,
  Point: Point
};
