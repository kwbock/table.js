/**
 * @author Daniel White
 */

/*
 * Field object manages the input type (text vs select) and sets/gets the
 * default values of the inputs
 */
var Field = Class.create({
	initialize : function(name, type, options){
		this._type = type;
		this._name = name;
		if(options != null){
			//empty string has to be an option, and first
			options.splice(0,0,"");
		}
		this._options = options;
		if(type == "list"){
			this._elmnt = this.selectBox();
		}
		else{
			this._elmnt = this.textBox();
		}
	},
	textBox : function(){
		var self = this;
		var text = document.createElement("input");
        text.setAttribute("type", "text");
        return text;
	},
	selectBox : function(){
		var self = this;
        var select = document.createElement("select");
        $A(self._options).each(function(option) {
            var op = document.createElement("option");
            op.setAttribute("value", option);
            op.appendChild(document.createTextNode(option));
            select.appendChild(op);
        });
        return select;
    },
	setValue : function(value){
		var self = this;
		if(self._type == "list"){
			$A(self._elmnt.options).each(function(option){
				if(option.value == value){
					option.selected = true;
				}
			});
		}
		else{
			self._elmnt.value = value;
		}
	},
	getElement : function(){
		return this._elmnt;
	},
	getName : function(){
		return this._name;
	},
	getValue : function(){
		return this._elmnt.value;
	}
});

/*
 * Heading : class to manage type ('text', 'static', 'list') and choices
 */
var Heading = Class.create(Cell, {
	initialize : function($super, element, type, choices, key){
		if(!type)
		  type = "text";
	    this._type = type;
		this._choices = choices;
		this._key = key;
		$super(element);
	},
	getName : function(){
		return this.getValue();//heading name
	},
	getType : function(){
        return this._type;//text, static, or list
    },
	getChoices : function(){
        return this._choices;//only used for list
    },
	getKey : function(){
		return this._key;
	}
});

/*
 * EditWindow : Creates the edit window and pop-up
 */
var EditWindow = Class.create({
	initialize : function(table, headings){
		var self = this;
		this._table = table;
		this._headings = headings;
		this._fields = [];//an array of the input field
		this._popup = this.createWindow(this._headings);
		document.body.appendChild(this._popup);
		this._editWindow = new Control.Modal('popup_edit_window',{
            overlayOpacity: 0.75,
            className: 'popup',
            closeOnClick: 'edit_window_cancel',
            position: [400,50],
            draggable: 'results_head'
        });
		$('edit_button').observe('click', function(){
			if(self._table._selected.length > 0){
				self._table.calculateDefaultValues();//get default values
				self.loadDefaultValues();//set default values
	            self._editWindow.open();
			}
        });
		$('edit_button').disabled=true;
	},
	/*
	 * createWindow : creates the edit window div with input boxs to match the heading
	 * choices
	 */
	createWindow : function(headings){
		var self = this;
		var popup = document.createElement("div");
        popup.setAttribute("id", "popup_edit_window");
		popup.setAttribute("class", "popup center_text");
		popup.setAttribute("className", "popup center_text");//IE7
		
		var header = document.createElement("div");
        header.setAttribute("class", "results_head");
		header.setAttribute("className", "results_head");//IE7
		header.innerHTML = "<h3>Product Details Updates</h3>";
		popup.appendChild(header);
		
		//For each non-static heading, create a label and input option
		for (var i = 0; i < headings.length; i++) {
			var heading = headings[i];
			var type = heading.getType();
			if (type != 'static') {
				var row = self.formRow();
				var name = heading.getName();
				row.appendChild(self.label(name));
				var field = new Field(name, type, heading.getChoices())
				self._fields[name] = field
				row.appendChild(field.getElement());
				popup.appendChild(row);
			}
		}
		popup.appendChild(self.buttons());
		return popup;
	},
	//create HTML element
	formRow : function(){
		var form_row = document.createElement("div");
        form_row.setAttribute("class", "form_row");
		form_row.setAttribute("className", "form_row");
		return form_row;
	},
	//create HTML element
	label : function(name){
		var form_label = document.createElement("div");
        form_label.setAttribute("class", "form_label text_right");
		form_label.setAttribute("className", "form_label text_right");
        form_label.innerHTML = name;
		return form_label;
	},
	//create HTML elements
	buttons : function(){
		var self = this;
		var save = document.createElement("input");
		save.setAttribute("class", "first primary button");
		save.setAttribute("className", "first primary button");//IE7
		save.setAttribute("id", "edit_window_save");
		save.setAttribute("value", "Save");
		Event.observe(save, 'click', function(){
            self.changeValues();
			self._editWindow.close();
        });
		
		var cancel = document.createElement("input");
		cancel.setAttribute("class", "last danger button button_box");
		cancel.setAttribute("className", "last danger button button_box");//IE7
        cancel.setAttribute("id", "edit_window_cancel");
		cancel.setAttribute("value", "Cancel");
		
        var ul = document.createElement("ul");
        ul.setAttribute("class", "button-group center_text");
		ul.setAttribute("className", "button-group center_text");//IE7
		ul.appendChild(save);
        ul.appendChild(cancel);
		
		var container = document.createElement("div");
        container.setAttribute("class", "button_box center");
        container.setAttribute("className", "button_box-group center");//IE7
		container.appendChild(ul);
		
		return container;
	},
	/*
	 * loadDefaultValues : Called before the edit window pops up, sets the selected values to
	 * match the defaultValues from table (created by calculateDefaultValues)
	 */
	loadDefaultValues : function(){
		var self = this;
		var values = self._table._defaultValues;
		//for each heading that is not static, set the default value in the edit window
		$A(self._table._headings.getCells()).each(function(heading){
			if(heading.getType() != "static"){
				var name = heading.getName();
				var defaultValue = values[name];
				var field = self._fields[name];
				field.setValue(defaultValue);
			}
		});
	},
	/*
	 * changeValues : Loops through the selected rows and sets the values according to the
	 * selected values in the popup edit window
	 */
	changeValues : function(){
		var self = this;
		var rows = self._table.getSelectedRows();
		var headings = self._table._headings.getCells();
		$A(rows).each(function(row){
			var cells = row.getCells();
			for(var i=0 ; i < headings.length ; i++){
                if(headings[i]._type != "static"){//only change value for non-static cells
					var name = headings[i].getName();
					var field = self._fields[name];
					var value = field.getValue();
					if(value != ""){
						cells[i].setValue(value);
					}
					if(cells[i].changed()){
						cells[i].getElement().setAttribute('class', 'edited_item');
						cells[i].getElement().setAttribute('className', 'edited_item');//IE7
					}
					else{
						cells[i].getElement().setAttribute('class', 'normal_item');
						cells[i].getElement().setAttribute('className', 'normal_item');//IE7
					}
				}
            }
		});
	}
});

var Multi_Edit_Table = Class.create (Table, {
    initialize : function($super, id, headerOptions, data, options){
        this._selected = [];//selected rows via checkbox
		this._headings;
		this._defaultValues = [];
        $super(id, data, options);
        this.initHeadings(headerOptions);
        this.addCheckBoxs();
		this._editWindow = new EditWindow(this, this._headings.getCells());
    },
	/*
	 * addCheckBoxs : Loops though the table and adds a checkbox on each row with a
	 * click event
	 */
    addCheckBoxs : function(){
        var self = this;
        
        //add Header to table
        $A(self._elmnt.tHead.rows).each(function(row) {//loop rows
            var th = document.createElement('th');
            th.innerHTML="Edit";
            row.insertBefore(th, row.cells.item(0));
        });
        
        //Add Checkbox on each row
        $A(self._elmnt.tBodies).each(function(body) {
            $A(body.rows).each(function(row) {//loop rows
                //Create Checkbox
                var cb = document.createElement("input");
                cb.type = "checkbox";
                cb.name = "multi_edit";
                
                //Append checkbox
                var newCell = row.insertCell(0);
                newCell.appendChild(cb);
                
                //set event
                Event.observe(cb, 'click', function(){
					var rowObj = self.getRowByElmnt(row);//gets the matching row object for the html row
                    var index = self._selected.indexOf(rowObj);
                    (index == -1) ? self._selected.push(rowObj) : self._selected.splice(index, 1);
					(self._selected.length > 0) ? $('edit_button').disabled=false : $('edit_button').disabled=true;
                });
            });
        });
    },
	getSelectedRows : function() {
		return this._selected;
	},
	/*
     * initHeadings : Loops through the table to get heading name, the index of the  
     * heading determines which headerOptions are used for that heading.
     */
	initHeadings : function(headerOptions) {
        var self = this;
        // loop over tHead to init Heading rows
        $A(self._elmnt.tHead.rows).each(function(row) {
            self._headings = new Row(row, self,{autoInit: false});
            $A(row.cells).each(function(cell) {
                var type = headerOptions[cell.innerHTML].type;//Set type ('static, 'list', or 'text')
                var choices = headerOptions[cell.innerHTML].choices;//only needed for list
                var key = headerOptions[cell.innerHTML].key;//a key that can be used when getting changes
                self._headings.addCell(new Heading(cell, type, choices, key));
            });
        });
    },
	/*
	 * calculateDefaultValues : Called before the edit window is displayed. Sets an array of  
	 *   values (self._defaultValues) that should used by the popup window 
	 */
	calculateDefaultValues : function(){
		var self = this;
		self._defaultValues = [];
		var headings = self._headings.getCells();
        var rows = self.getSelectedRows();//Only use selected rows
		
		//Loop through each row to calculate default values
		$A(rows).each(function(row) {
			var cells = row.getCells();
			for(var i=0 ; i < cells.length ; i++){
				if(headings[i]._type != "static"){//only pick up headings that change
					var headingName = headings[i].getName();
					if(self._defaultValues[headingName] == null){
						//A value hasn't been picked yet, make this it
						self._defaultValues[headingName] = cells[i].getValue();
					}
					else if(self._defaultValues[headingName] != cells[i].getValue()){
						//A value has been picked, and this doesn't match, set to empty string
						self._defaultValues[headingName] = "";
					}
				}
			}
		});
	},
	/*
	 * revert : Loops through the table resetting the values and the divs
	 */
	revert : function(){
		var self = this;
		$A(self.getRows()).each(function(row){
			$A(row.getCells()).each(function(cell){
				cell.revert();//change value
				cell.getElement().setAttribute("class", "normal_item");
				cell.getElement().setAttribute("className", "normal_item");//for IE7
			});
		});
	},
	/*
	 * getChangedRows : Returns an array of rows (and array of values) containing all
	 * changed values
	 */
	getChangedRows : function(){
		var self = this;
		var changedRows = "[";
		$A(self.getRows()).each(function(row){//loop all rows
			var changed = false;
			//var rowValues;
			var cells = row.getCells();
			var headings = self._headings.getCells()
			for(var i=0 ; i < headings.length ; i++){//loop all cells & headings
				//rowValues.headings[i].getKey() = cells[i].getValue();//save the values in a value array
				if(cells[i].changed()){
                    //this cell has changed, mark the row as changed to return it
                    changed = true;
				}
			}
			if(changed){
				//the row was changed, add it to the return array
				if(changedRows != "["){
					changedRows = changedRows + ",";
				}
				changedRows = changedRows + row.toJSON();
			}
        });
		return changedRows + "]";
	}
});