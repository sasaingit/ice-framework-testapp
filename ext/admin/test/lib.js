/**
 * Author: Sasanga
 */

function TestAdapter(endPoint) {
	this.initAdapter(endPoint);
}

TestAdapter.inherits(AdapterBase);



TestAdapter.method('getDataMapping', function() {
	return [
	        "id",
	        "title",
	        "description",
	        "rec1",
	        "rec2"
	];
});

TestAdapter.method('getHeaders', function() {
	return [
			{ "sTitle": "ID","bVisible":false },
			{ "sTitle": "TestTitle" },
			{ "sTitle": "TestDescription"},
			{ "sTitle": "TestRec1"},
			{ "sTitle": "TestRec2", "sClass": "center" }
	];
});

TestAdapter.method('getFormFields', function() {
	return [
	        [ "id", {"label":"ID","type":"hidden","validation":""}],
	        [ "title", {"label":"TestTitleForm","type":"text","validation":""}],
	        [ "description", {"label":"TestDescriptionForm","type":"textarea","validation":""}],
	        [ "rec1", {"label":"TestRec1Form","type":"textarea","validation":"none"}],
	        [ "rec2", {"label":"TestRec2Form","type":"textarea","validation":"none"}]
	];
});


/*
 * Company Graph
 */


function CompanyGraphAdapter(endPoint) {
	this.initAdapter(endPoint);
	this.nodeIdCounter = 0;
}

CompanyGraphAdapter.inherits(TestAdapter);

/*
CompanyGraphAdapter.method('createTable', function(elementId) {
	
	var sourceData = this.sourceData;
	
	if(modJs['r'] == undefined || modJs['r'] == null){
		modJs['r'] = Raphael("CompanyGraph", 800, 2000);
		modJs['r'].setViewBox(0,0,800,2000,false);
	}else{
		return;
	}
	
	var r = modJs['r'];
	
	for(var i=0; i< sourceData.length; i++){
		sourceData[i].parent = sourceData[i]._original[6];
	}
	
	if(this.fixCyclicParent(sourceData)){
		var hierarchy = new HierarchyJs();
		var nodes = hierarchy.createNodes(sourceData);
		hierarchy.createHierarchy(nodes, r);
	}
	
	
	
	
});
*/

CompanyGraphAdapter.method('convertToTree', function(data) {
	var ice = {};
	ice['id'] = -1;
	ice['title'] = '';
	ice['name'] = '';
	ice['children'] = [];
	
	var parent = null;
	
	var added = {};
	
	
	for(var i=0;i<data.length;i++){
		
		data[i].name = data[i].title;
		
		if(data[i].parent != null && data[i].parent != undefined){
			parent = this.findParent(data,data[i].parent);
			if(parent != null){
				if(parent.children == undefined || parent.children == null){
					parent.children = [];
				}
				parent.children.push(data[i]);
			}
		}
		
	}
	
	for(var i=0;i<data.length;i++){
		if(data[i].parent == null || data[i].parent == undefined){
			ice['children'].push(data[i]);
		}
	}
	
	return ice;
	
});


CompanyGraphAdapter.method('findParent', function(data, parent) {
	for(var i=0;i<data.length;i++){
		if(data[i].title == parent || data[i].title == parent){
			return data[i];
		}
	}
	return null;
});


CompanyGraphAdapter.method('createTable', function(elementId) {
	$("#tabPageCompanyGraph").html("");
	var that = this;
	var sourceData = this.sourceData;
	
	//this.fixCyclicParent(sourceData);
	var treeData = this.convertToTree(sourceData);
	
	var m = [20, 120, 20, 120],
    w = 5000 - m[1] - m[3],
    h = 1000 - m[0] - m[2],
    root;

	var tree = d3.layout.tree()
	    .size([h, w]);
	
	this.diagonal  = d3.svg.diagonal()
	    .projection(function(d) { return [d.y, d.x]; });
	
	this.vis = d3.select("#tabPageCompanyGraph").append("svg:svg")
	    .attr("width", w + m[1] + m[3])
	    .attr("height", h + m[0] + m[2])
	    .append("svg:g")
	    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
	
	  root = treeData;
	  root.x0 = h / 2;
	  root.y0 = 0;
	
	  function toggleAll(d) {
	    if (d.children) {
	      console.log(d.name);
	      d.children.forEach(toggleAll);
	      that.toggle(d);
	    }
	  }
	  this.update(root, tree, root);
	  
	  
	
});

CompanyGraphAdapter.method('update', function(source, tree, root) {
	var that = this;
	  var duration = d3.event && d3.event.altKey ? 5000 : 500;

	  // Compute the new tree layout.
	  var nodes = tree.nodes(root).reverse();

	  // Normalize for fixed-depth.
	  nodes.forEach(function(d) { d.y = d.depth * 180; });

	  // Update the nodes�
	  var node = that.vis.selectAll("g.node")
	      .data(nodes, function(d) { return d.id || (d.id = ++that.nodeIdCounter); });

	  // Enter any new nodes at the parent's previous position.
	  var nodeEnter = node.enter().append("svg:g")
	      .attr("class", "node")
	      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
	      .on("click", function(d) { that.toggle(d); that.update(d, tree, root); });

	  nodeEnter.append("svg:circle")
	      .attr("r", 1e-6)
	      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

	  nodeEnter.append("svg:text")
	      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
	      .attr("dy", ".35em")
	      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
	      .text(function(d) { return d.name; })
	      .style("fill-opacity", 1e-6);

	  // Transition nodes to their new position.
	  var nodeUpdate = node.transition()
	      .duration(duration)
	      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

	  nodeUpdate.select("circle")
	      .attr("r", 4.5)
	      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

	  nodeUpdate.select("text")
	      .style("fill-opacity", 1);

	  // Transition exiting nodes to the parent's new position.
	  var nodeExit = node.exit().transition()
	      .duration(duration)
	      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
	      .remove();

	  nodeExit.select("circle")
	      .attr("r", 1e-6);

	  nodeExit.select("text")
	      .style("fill-opacity", 1e-6);

	  // Update the links�
	  var link = that.vis.selectAll("path.link")
	      .data(tree.links(nodes), function(d) { return d.target.id; });

	  // Enter any new links at the parent's previous position.
	  link.enter().insert("svg:path", "g")
	      .attr("class", "link")
	      .attr("d", function(d) {
	        var o = {x: source.x0, y: source.y0};
	        return that.diagonal({source: o, target: o});
	      })
	    .transition()
	      .duration(duration)
	      .attr("d", that.diagonal);

	  // Transition links to their new position.
	  link.transition()
	      .duration(duration)
	      .attr("d", that.diagonal);

	  // Transition exiting nodes to the parent's new position.
	  link.exit().transition()
	      .duration(duration)
	      .attr("d", function(d) {
	        var o = {x: source.x, y: source.y};
	        return that.diagonal({source: o, target: o});
	      })
	      .remove();

	  // Stash the old positions for transition.
	  nodes.forEach(function(d) {
	    d.x0 = d.x;
	    d.y0 = d.y;
	  });
});

// Toggle children.
CompanyGraphAdapter.method('toggle', function(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
});


CompanyGraphAdapter.method('getSourceDataById', function(id) {

	for(var i=0; i< this.sourceData.length; i++){
		if(this.sourceData[i].id == id){
			return this.sourceData[i];
		}
	}
	
	return null;
	
});

CompanyGraphAdapter.method('fixCyclicParent', function(sourceData) {
	var errorMsg = "";
	for(var i=0; i< sourceData.length; i++){
		var obj = sourceData[i];
		
		
		var curObj = obj;
		var parentIdArr = {};
		parentIdArr[curObj.id] = 1;
		
		while(curObj.parent != null && curObj.parent != undefined){
			var parent = this.getSourceDataById(curObj.parent);
			if(parent == null){
				break;
			}else if(parentIdArr[parent.id] == 1){
				errorMsg = obj.title +"'s parent structure set to "+parent.title+"<br/>";
				obj.parent = null;
				break;
			}
			parentIdArr[parent.id] = 1;
			curObj = parent;
		}
	}
	
	if(errorMsg != ""){
		this.showMessage("Company Structure is having a cyclic dependency","We found a cyclic dependency due to following reasons:<br/>"+errorMsg);
		return false;
	}
	
	return true;
	
});

CompanyGraphAdapter.method('getHelpLink', function () {
	return 'http://blog.icehrm.com/?page_id=61';
});




