
var Cell = Class.create({
	options : {},
	initialize : function(element, index, row) {
		this._elmnt = element;
		this._originalValue = this.getValue();
		this._row = row;
		this._index = index;
	},
	getValue : function(){
		return $(this._elmnt).getInnerText();
	},
	setValue : function(value) {
		$(this._elmnt).update(value);
	},
	changed : function(){
		return this.getValue() != this._originalValue;
	},
	getElement : function() {
		return this._elmnt;
	},
	revert: function(){
		this.setValue(this._originalValue);
	},
	toJSON: function(){
		return "\"" + this.getValue() + "\"";
	},
	getRow : function() {
		return this._row;
	},
	getIndex : function() {
		return this._index;
	}
});

var Row = Class.create({
	options : {
		autoInit : true
	},
	initialize : function(element, table, options) {
		this._elmnt = element;
		this._table = table;
		this._cells = [];
		this.options = options || this.options;
		
		if (!this.options.autoInit)
		  return;
		this.initCells();
	},
	initCells : function() {
		var self = this;
		$A(this._elmnt.cells).each(function(cell, index) {
			self._cells.push(new Cell(cell, index, self));
		});
	},
	getCells : function() {
		return this._cells || [];
	},
	addCell : function(cell) {
		this._cells.push(cell);
	},
	toJSON: function(){
		var json = "";
		$A(this._cells).each(function(cell){
			if(json == ""){
				json = "[";
			}
			else{
				json = json + ", ";
			}
			json = json + cell.toJSON();
		});
		return json + "]";
	}, 
	getTable: function() {
		return this._table;
	}
});

var Table = Class.create({
	options : {},
	initialize : function(id, data, options) {
		this._elmnt = $(id);
		if (this._elmnt.tagName !== 'TABLE') {
			return;
		}
		
		this._rows = [];
		
		this.initRows();
	},
	initRows : function() {
		var self = this;
		// loop over tbodies to init rows
		$A(self._elmnt.tBodies).each(function(body) {
			$A(body.rows).each(function(row) {
				// push each row to the _rows array for easy access later			
				self._rows.push(new Row(row, self));
			});
		});
	},
	getRows : function() {
		return this._rows || [];
	},
	getRowByElmnt : function(elmnt){
		var result;
		$A(this._rows).each(function(row){
			if(row._elmnt == elmnt){
				result = row;
			}
		});
		return result;
	}
});

