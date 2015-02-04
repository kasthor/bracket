$(function(){
  var width = 960,
      height = 500,
      teams = [{
        name: "UAB Blazers",
        logo: "uabblazers"  
      },{
        name: "UCLA Bruins",
        logo: "uclabruins"  
      },{
        name: "UConn Huskies",
        logo: "uconnhuskies"  
      },{
        name: "UCSB Gauchos",
        logo: "ucsbgauchos"  
      },{
        name: "Umass Lowell River Hawks",
        logo: "umasslowelriverhawks"
      },{
        name: "UMBC Retrievers",
        logo: "umbcretrievers"  
      },{
        name: "UMKC Kangarooos",
        logo: "umkckangaroos"  
      },{
        name: "UNF Ospreys",
        logo: "unfospreys"  
      }],
      tree_data = create_games( teams ),
      /*
      tree_data = {
        name: "root",
        parent: "null",
        children: [{
          name: "leaf 1",
          parent: "root" 
        },{
          name: "leaf 2",
          parent: "root",
          children:[{
            name: "leaf 2.1",
            parent: "leaf 2"
          },{ 
            name: "leaf 2.2",
            parent: "leaf 2"
          }]
        },{
          name: "leaf 3",
          parent: "root"
        }]  
      },
      */
      tree = d3.layout.tree()
               .size( [ height, width ] ),
      elbow = function( d, i ){
        function _calc_src( d ){
          return { x: d.x, y: d.y }
        }
        var s = _calc_src( d.source ),
            t = _calc_src( d.target ),
            h = (t.y - s.y) / 2;

        return "M" + s.y + "," + s.x +
               "H" + ( s.y + h ) +
               "V" + t.x + "H" + t.y;
      },
      bracket = d3.select('body')
        .append('svg')
          .attr("width", width)
          .attr("height", height)
        .append('g')
          .attr("transform", "translate( 0, 0 )" );

  function flatten( item, array ){
    array || (array = []);
    array.push(item); 
    if( item.children ){
      item.children.forEach( function( i ){
        flatten( i, array );
      });  
    }

    return array;
  }

  var root = tree_data;
  update(root);

  function select_team( d ) {
    d.parent.logo = d.logo;
    update( root );
  }
  function create_games( arry ){
    var i = 0;
    while( arry.length > 1 ){
      arry = split_games( arry ).map(function( game ){
        var lbl = "game_" + ++i;
        game.forEach( function( child ){
          child.parent = lbl;
        })
        return {
          name: lbl,
          children: game
        }
      });
    }
    return arry[0];
  }
  function split_games( arry ){
    var result = [];
    for( var i = 0; i < arry.length; i+= 2 ){
      result.push( [ arry[i], arry[i+1] ] ); 
    }
    return result;
  }

  function update( source ){
    var nodes = tree.nodes(tree_data),
        links = tree.links(nodes);
        id = 0

    nodes.forEach(function( d ) { d.y = d.depth * 180; });

    var node = bracket
      .selectAll("g.node")
      .data( nodes, function(d){ return d.id || (d.id = ++id)} );

    var node_enter = node
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d){ return "translate(" + d.y + "," + d.x + ")"})

    node_enter.append("circle")
      .attr("r", 15)
      .attr("fill-opacity", 0)
      .style("stroke", "lightsteelblue")
      .on("click", select_team);

    var nodeUpdate = node.transition()
        .duration( 500 )
        .attr("fill-opacity", 1)
        
    nodeUpdate.select('circle')
      .attr("fill-opacity", 1)
      .style("fill", function(d){
        if( d.logo ){
          return "url(#" + d.logo + ")";
        } else {
          return "gray";
        }
      })
      

    var link = bracket.selectAll("path.link")
      .data( links, function(d) { return d.target.id } );

    link.enter().insert("path", "g")
      .attr("class", "link")
        .style("stroke", function(d){ return d.target.depth })
      .attr("d", elbow);

      // .attr('xlink:href', '/images/tile-worldwide.png')
    var defs = bracket.append('defs');
    var pattern = defs.selectAll( "pattern" )
      .data(nodes, function(d){ return d.id } )

    var dimension = 6;
    var patterns_enter = pattern.enter()
      .append('svg:pattern')
        .attr('id', function(d){ return d.logo })
        .attr('patternContentUnits', 'objectBoundingBox')
        .attr('width', '100%')
        .attr('height', '100%')
        .append('svg:image')
          .attr('xlink:href', function(d){ return "logos/" + d.logo + ".gif"})
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 1)
          .attr('height', 1)
  }
});
