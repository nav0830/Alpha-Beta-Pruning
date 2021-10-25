// properties of each node
var size = 12, nodeId = 0, level = 1, num_Childs = 2, fir_child = 3, s_value = 4, posx = 5, posy = 6, alpha = 7, beta = 8, no_id_parent = 9, curr_child = 10, bes_child = 11;

// tree information
var treeA, treeH, nodesN;

// draw parameters
var xxl = 20, yyl = 20;

// simulation parameters
var interval_id, curr_node_id = 0, prev_node_id = -1, ret_child_value = 0, step = 0, mode = 0;

// constants
var low = -10000, high = +10000, cycleTime = 200; // cycle time (ms)



function create_game_tree() {
    if (mode == 1) clearInterval(interval_id);
    mode = 0;

    var stringToSplit = document.form1.treestructure.value;
    var arrayOfStringsInnerNodes = stringToSplit.split(" ");
    stringToSplit = document.form1.utilvalues.value;
    var arrayOfStringsLeafNodes = stringToSplit.split(" ");
    var len1 = arrayOfStringsInnerNodes.length;
    var len2 = arrayOfStringsLeafNodes.length;
    nodesN = len1 + len2; // total nodes
    treeA = new Array(nodesN * size); //size of the array
    
    var dp = 0; // node depth
    if (len1 > 0) {
        treeA[level] = dp; // depth of root node
        treeA[no_id_parent] = -1; // parent id of root node
        treeA[alpha] = low; // init alpha value of root node
        treeA[beta] = high;  // init beta value of root node
    }
    for (var i = 0, j = 0, id_first_child = 1; i < len1; i++, j += size) {
        treeA[j + nodeId] = i;
        if (treeA[j + level] % 2 == 0)
            treeA[j + s_value] = low; // max player initial value
        else
            treeA[j + s_value] = high; // min player initial value
        treeA[j + curr_child] = -1;
        treeA[j + num_Childs] = parseInt(arrayOfStringsInnerNodes[i], 10);
        treeA[j + fir_child] = id_first_child;
        dp = treeA[j + level];
        for (var child = 0; child < treeA[j + num_Childs]; child++) {
            treeA[(id_first_child + child) * size + level] = dp + 1; // depth of child
            treeA[(id_first_child + child) * size + no_id_parent] = i; // parent id
        }
        id_first_child += treeA[j + num_Childs];
    }
    // second loads into the array the leaf nodes (terminal nodes)
    for (var i = 0, j = len1 * size; i < len2; i++, j += size) {
        treeA[j + nodeId] = i + len1;
        treeA[j + num_Childs] = 0; // terminal/leaf node
        treeA[j + fir_child] = -1; // because is a terminal/leaf node
        treeA[j + s_value] = parseInt(arrayOfStringsLeafNodes[i], 10);
    }

    treeH = dp + 1;
    prepare_draw_tree(len2);
    draw_tree();
}


function prepare_draw_tree(numLeafNodes) {
    var canvas = document.querySelector('.canvas');
    var context = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    var top_margin_h = 30; // top margin defined for canvas
    var bot_margin_h = 40; // botton margin defined for canvas
    var h_util = h - top_margin_h - bot_margin_h;

    for (var i = nodesN - numLeafNodes, j = 1, idx_node = i * size; i < nodesN; i++, j++, idx_node += size) {
        treeA[idx_node + posy] = parseInt(top_margin_h + (h_util * treeA[idx_node + level]) / treeH);
        treeA[idx_node + posx] = parseInt((w / (numLeafNodes + 1)) * j);
    }

    for (var i = nodesN - numLeafNodes - 1, idx_node = i * size; i >= 0; i--, idx_node -= size) {
        treeA[idx_node + posy] = parseInt(top_margin_h + (h_util * treeA[idx_node + level]) / treeH);
        var fc_idx = treeA[idx_node + fir_child] * size;
        var lc_idx = (treeA[idx_node + fir_child] + treeA[idx_node + num_Childs] - 1) * size;
        treeA[idx_node + posx] = (treeA[fc_idx + posx] + treeA[lc_idx + posx]) / 2;
    }
}


function draw_tree() {
    var canvas = document.querySelector('.canvas');
    var context = canvas.getContext('2d');
    canvas.width = canvas.width; // resets canvas
    context.strokeStyle = 'white';
    context.lineWidth = 1;

    for (var i = 0, idx_node = 0; i < nodesN; i++, idx_node += size)
        draw_node(context, idx_node, "white");

    // draw line segments
    for (var i = 0, idx_node = 0; i < nodesN; i++, idx_node += size) {
        var id_first_child = treeA[idx_node + fir_child];
        var number_childs = treeA[idx_node + num_Childs];
        var bx = treeA[idx_node + posx];
        var by = treeA[idx_node + posy] + yyl;
        for (var child = 0; child < number_childs; child++) {
            var ex = treeA[(id_first_child + child) * size + posx];
            var ey = treeA[(id_first_child + child) * size + posy] - yyl;
            context.beginPath();
            context.moveTo(bx, by);
            context.lineTo(ex, ey);
            context.stroke();
            context.closePath();
        }
    }
}

/* draws node shape and changes node color to white*/
function draw_node(context, idx_node, fill_color) {
    var cx = treeA[idx_node + posx];
    var cy = treeA[idx_node + posy];
    context.fillStyle = fill_color;
    if (treeA[idx_node + level] % 2 == 0) { // draw max player triangle node
        context.beginPath();
        context.moveTo(cx - xxl, cy - yyl);
        context.lineTo(cx - xxl, cy + yyl);
        context.lineTo(cx + xxl, cy + yyl);
        context.lineTo(cx + xxl, cy - yyl);
        context.lineTo(cx - xxl, cy - yyl);
        context.stroke();
        context.fill();
        context.closePath();
        context.fillText(treeA[idx_node + s_value], cx - 10, cy);
    } else { // draw min player triangle node
        context.beginPath();
        context.moveTo(cx, cy + yyl);
        context.arc(cx, cy, xxl, 0, 2 * Math.PI);
        context.stroke();
        context.fill();
        context.closePath();
        context.fillText(treeA[idx_node + s_value], cx - 10, cy);
    }
    context.fillStyle = "black"; // controls text color
    if (treeA[idx_node + num_Childs] == 0) // draw value if is terminal node
        context.fillText(treeA[idx_node + s_value], cx - 3, cy + 3);
    else
        context.fillText(treeA[idx_node + s_value], cx - 10, cy);
}

/* Initial call */
function run_alphabeta_search() {
    mode = 1;
    curr_node_id = 0;
    prev_node_id = -1;
    step = 0;
    interval_id = setInterval(alphabeta_search, cycleTime);
}


function alphabeta_search() {
    if (prev_node_id >= 0)
        leave_node(prev_node_id * size);
    prev_node_id = curr_node_id;
    step++;
    minimax_value();
    if (prev_node_id >= 0)
        enter_node(prev_node_id * size);
    if (curr_node_id == -1 && mode == 1) {
        clearInterval(interval_id); // ends simulation
        step = 0;
        mode = 0;
        alert('Completed');
        draw_best_path(0);
    }
}


/* enter one node function */
function minimax_value() {
    var node_idx = curr_node_id * size;
    var parent_node_idx = treeA[node_idx + no_id_parent] * size;

    if (treeA[node_idx + num_Childs] == 0) { //is a terminal node
        curr_node_id = treeA[node_idx + no_id_parent];  // sets the next curr_node_id for the simulation
        ret_child_value = treeA[node_idx + s_value]; 		// next ret_child_value: the heuristic value of node
        return;
    }

    if (treeA[node_idx + curr_child] == -1) { // passing alpha and beta values from parent node
        if (parent_node_idx >= 0) {
            treeA[node_idx + alpha] = treeA[parent_node_idx + alpha];
            treeA[node_idx + beta] = treeA[parent_node_idx + beta];
        }
        if (treeA[node_idx + level] % 2 == 0)
            treeA[node_idx + s_value] = low; // max player initial value
        else
            treeA[node_idx + s_value] = high; // min player initial value			
        treeA[node_idx + curr_child]++;
        curr_node_id = treeA[node_idx + fir_child]; // sets the next curr_node_id for the simulation
        return;
    }

    if (treeA[node_idx + level] % 2 == 0) { // max player
        if (ret_child_value > treeA[node_idx + s_value]) {
            treeA[node_idx + s_value] = ret_child_value;
            treeA[node_idx + bes_child] = treeA[node_idx + fir_child] + treeA[node_idx + curr_child];
        }
        if (treeA[node_idx + s_value] >= treeA[node_idx + beta]) { // Alpha-beta pruning
            draw_prune_nodes(node_idx);
            curr_node_id = treeA[node_idx + no_id_parent];
            ret_child_value = treeA[node_idx + s_value];
            return;
        }
        treeA[node_idx + alpha] = Math.max(treeA[node_idx + alpha], treeA[node_idx + s_value]);
        treeA[node_idx + curr_child]++;
        if (treeA[node_idx + curr_child] < treeA[node_idx + num_Childs]) { // calls next child
            curr_node_id = treeA[node_idx + fir_child] + treeA[node_idx + curr_child];
        } else { // no more childs: returns to parent
            curr_node_id = treeA[node_idx + no_id_parent];
            ret_child_value = treeA[node_idx + s_value];
        }
        return;
    } else { // min player
        if (ret_child_value < treeA[node_idx + s_value]) {
            treeA[node_idx + s_value] = ret_child_value;
            treeA[node_idx + bes_child] = treeA[node_idx + fir_child] + treeA[node_idx + curr_child];
        }
        if (treeA[node_idx + s_value] <= treeA[node_idx + alpha]) { // Alpha-beta pruning
            draw_prune_nodes(node_idx);
            curr_node_id = treeA[node_idx + no_id_parent];
            ret_child_value = treeA[node_idx + s_value];
            return;
        }
        treeA[node_idx + beta] = Math.min(treeA[node_idx + beta], treeA[node_idx + s_value]);
        treeA[node_idx + curr_child]++;
        if (treeA[node_idx + curr_child] < treeA[node_idx + num_Childs]) { // calls next child
            curr_node_id = treeA[node_idx + fir_child] + treeA[node_idx + curr_child];
        } else { // no more childs: returns to parent
            curr_node_id = treeA[node_idx + no_id_parent];
            ret_child_value = treeA[node_idx + s_value];
        }
        return;
    }
}


function draw_best_path(root_id) {
    var canvas = document.querySelector('.canvas');
    var context = canvas.getContext('2d');
    var strokeS = context.strokeStyle; // stores previous strokeStyle
    var lineW = context.lineWidth; // stores previous lineWidth
    context.strokeStyle = "blue";
    context.lineWidth = 2;
    var parent_idx = root_id * size;
    while (treeA[parent_idx + num_Childs] > 0) {
        var child_idx = treeA[parent_idx + bes_child] * size;
        var bx = treeA[parent_idx + posx];
        var by = treeA[parent_idx + posy] + yyl;
        var ex = treeA[child_idx + posx];
        var ey = treeA[child_idx + posy] - yyl;
        context.beginPath();
        context.moveTo(bx, by);
        context.lineTo(ex, ey);
        context.stroke();
        context.closePath();
        parent_idx = child_idx;
    }
    context.strokeStyle = strokeS;
    context.lineWidth = lineW;
}

function draw_prune_nodes(parent_idx) {
    var canvas = document.querySelector('.canvas');
    var context = canvas.getContext('2d');
    var child_id = treeA[parent_idx + curr_child] + 1;
    var number_childs = treeA[parent_idx + num_Childs];
    var strokeS = context.strokeStyle; // stores previous strokeStyle
    var lineW = context.lineWidth; // stores previous lineWidth
    context.strokeStyle = "red";
    context.lineWidth = 2;
    while (child_id < number_childs) {
        var child_idx = (treeA[parent_idx + fir_child] + child_id) * size;
        var cxp = treeA[parent_idx + posx];
        var cyp = treeA[parent_idx + posy];
        var cxc = treeA[child_idx + posx];
        var cyc = treeA[child_idx + posy];
        var cx = (cxp + cxc) / 2;
        var cy = (cyp + cyc) / 2;
        context.beginPath();
        context.moveTo(cx - 10, cy - 10);
        context.lineTo(cx + 10, cy + 10);
        context.moveTo(cx + 10, cy - 10);
        context.lineTo(cx - 10, cy + 10);
        context.closePath();
        context.stroke();
        child_id++;
    }
    context.strokeStyle = strokeS;
    context.lineWidth = lineW;
}


/* changes node color to yellow and updates node info*/
function enter_node(idx_node) {
    var canvas = document.querySelector('.canvas');
    var context = canvas.getContext('2d');
    draw_node(context, idx_node, "green");
    var cx = treeA[idx_node + posx];
    var cy = treeA[idx_node + posy];
    var xx = cx - xxl * 5 - 2;
    context.fillStyle = "black";
    var oldFont = context.font;
    context.font = "6pt Arial";
    context.font = oldFont;
    if (treeA[idx_node + num_Childs] > 0) {
        // delete previous node info
        context.fillStyle = "black";
        context.fillRect(xx, cy - 20, xxl * 4, 34);
        // updated node info
        context.fillStyle = "white";
        context.fillText("\u237a= " + treeA[idx_node + alpha], xx, cy - 10); // alpha value
        context.fillText("\u03b2= " + treeA[idx_node + beta], xx, cy); // beta value
        context.fillText("v=" + treeA[idx_node + s_value], xx, cy + 10);
        context.fillText(treeA[idx_node + s_value], cx - 10, cy); // node value		
    }
}

// changes node color to white
function leave_node(idx_node) {
    var canvas = document.querySelector('.canvas');
    var context = canvas.getContext('2d');
    draw_node(context, idx_node, "white");
}





