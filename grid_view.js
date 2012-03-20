/**
 * @author kbock
 */
Element.addMethods({  
  getInnerText: function(element) {
    element = $(element);
    return element.innerText && !window.opera ? element.innerText
      : element.innerHTML.stripScripts().unescapeHTML().replace(/[\n\r\s]+/g, ' ');
  }
});

var GridViewTable = Class.create(Table, {
	_selectedCell : null,
	options : {
		autoLoad : true,
		gridViewSelector : ['table.gridview'],
		excludedColumns : [],
		multiTableSelect : true
	},
	initialize : function($super, id, data, options) {
		//this.options = options;
		$super(id, data, options);
		this.addGridViewCtrl();
	},
	addGridViewCtrl : function() {
		var self = this;
		$A(this.getRows()).each(function(row) {
			if (GridView.options.rowsOnly) {
				self.addListener(cell, index);
			}
			else {
				$A(row.getCells()).each(function(cell, index){
					self.addListener(cell, index);
				});
			}
		});
	},
	addListener : function(cell, index) {
		var self = this;
		if (this.options.excludedColumns.indexOf(index) != -1 || GridView.options.excludedColumns.indexOf(index) != -1)
			return;
		
		// attach click event to add or remove selected
		Event.observe(cell._elmnt, 'click', function(event) {
			var el = event.element();
			
			// dynamic callback based on options
			var setCallback = (!self.options.multiTableSelect) ? self.setSelected : GridView.setSelected;
			var getCallback = (!self.options.multiTableSelect) ? self.getSelected : GridView.getSelected;
			
			if (getCallback() != null && getCallback() == cell)
				return;
			
			// remove selection class from currently selected
			if (getCallback() != null && $(getCallback().getElement()).hasClassName("selected"))
				$(getCallback().getElement()).removeClassName("selected")
			
			// add selected style and set selected sell	
			$(el).addClassName("selected");
			
			//set selected cell. this is a cell object so we can manipulate better
			setCallback(cell);
			if (self.options.multiTableSelect)
				self.setSelected(cell);
		});
	},
	getSelected : function() {
		return this._selectedCell;
	},
	setSelected : function(cell) {
		this._selectedCell = cell;
	}
});

var GridView = Class.create({
	initialize : function(element, options) {
		var self = this;
		self._table = new GridViewTable(element, null, self.options || {});
	}
});

Object.extend(GridView, {
	_tables : [],
	_selectedCell : null,
	options: {
		autoLoad : true,
		gridViewSelector : ['table.gridview'],
		excludedColumns : [],
		multiTableSelect : true
	},
	load : function() {
		var self = this;
		if (GridView.options.autoLoad) {
			$A(GridView.options.gridViewSelector).each(function(s) {
				$$(s).each(function(table) {
					self._tables.push(new GridViewTable(table, null, GridView.options || {}));
				});
			});
		}
	},
	getSelected : function() {
		return GridView._selectedCell;
	},
	setSelected : function(cell) {
		GridView._selectedCell = cell;
	}
});
