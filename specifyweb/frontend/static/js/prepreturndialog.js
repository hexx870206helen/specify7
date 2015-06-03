define([
    'jquery', 'underscore', 'backbone', 'schema', 'navigation', 
    'specifyapi', 'populateform', 'resourceview', 'fieldformat','prepdialog',
    'jquery-ui', 'jquery-bbq'
], function($, _, Backbone, schema, navigation, api, populateform, ResourceView, FieldFormat, PrepDialog) {
    "use strict";

    return PrepDialog.extend({
        __name__: "PrepReturnDialog",
        className: "prepreturndialog table-list-dialog",
        events: {
	    'click :checkbox': 'prepCheck'
	},

	//ui elements stuff >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

	getTblHdr: function() {
	    return '<tr><th>  </th>'
		+ '<th>' + this.colobjModel.getField('catalognumber').getLocalizedName() + '</th>'
		+ '<th>' + this.detModel.getField('taxon').getLocalizedName() + '</th>'
		+ '<th>' + this.prepModel.getField('preptype').getLocalizedName() + '</th>'
		+ '<th>Unresolved</th><th>Return</th><th>Resolve</th></tr>';
	},
	getDlgTitle: function() {
	    return "Loan Preparations";
	},
	finishRender: function() {
	    var returnSpinners = this.$(".return-amt");
	    returnSpinners.spinner({
		spin: _.bind(this.returnSpin, this)
	    });
	    returnSpinners.width(50);
	    var resolvedSpinners = this.$(".resolve-amt");
	    resolvedSpinners.spinner({
		spin: _.bind(function( evt, ui ) {
		    var idx = this.$(".resolve-amt").index(evt.target);
		    if (idx >= 0) {
			var returnSp =this.$(".return-amt")[idx];
			var val = new Number($(ui).attr('value'));
			var max = this.options.preps[idx].unresolved;
			this.$(':checkbox')[idx].checked = val > 0;
			var returnVal = new Number($(returnSp).attr('value'));
			if (val < returnVal) {
			    returnVal = val;
			}
			$(returnSp).spinner({
			    readOnly: true,
			    min: 0,
			    max: max - (val - returnVal),
			    spin:  _.bind(this.returnSpin, this)
			});
			$(returnSp).attr('value', returnVal);
		    }
		}, this)
	    });
	    resolvedSpinners.width(50);
	},

        dialogEntry: function(iprep) {
	    var entry = $('<tr>').append(
		$('<td>').append($('<input>').attr('type', 'checkbox')),
                $('<td>').append(FieldFormat(this.colobjModel.getField('catalognumber'), iprep.catalognumber)),
                $('<td>').append(iprep.taxon),
                $('<td>').attr('align', 'center').append(iprep.preptype),
		$('<td>').attr('align', 'center').append(iprep.unresolved),
		//not allowing typing into spinners because tricky returned-resolved interdependancy requires previous value, 
		//which seems to be unavailable in the 'change' event.
		$('<td>').append($('<input readonly>').attr('align', 'right').attr('value', '0').attr('max', iprep.unresolved).attr('min', 0).addClass('return-amt')),
		$('<td>').append($('<input readonly>').attr('align', 'right').attr('value', '0').attr('max', iprep.unresolved).attr('min', 0).addClass('resolve-amt'))
	    );
            return entry;
        },

        buttons: function() {
            var buttons = this.options.readOnly ? [] : [
                { text: 'Select All', click: _.bind(this.selectAll, this),
                  title: 'Return all preparations.' },
		{ text: 'De-select All', click: _.bind(this.deSelectAll, this),
		  title: 'Clear all.' },
		{ text: 'OK', click: _.bind(this.returnSelections, this),
		  title: 'Return selected preparations' }
            ];
            buttons.push({ text: 'Cancel', click: function() { $(this).dialog('close'); }});
            return buttons;
        },



	//<<<<<<<<<<<<<<<<<<<< ui elements stuff

	//events >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

	returnSpin: function(evt, ui) {
	    var idx = this.$(".return-amt").index(evt.target);
	    if (idx >= 0) {
		var resolveSp =this.$(".resolve-amt")[idx];
		var val = new Number($(ui).attr('value'));
		var prevVal = new Number($(evt.target).attr('value'));
		var delta = val - prevVal; //can this ever NOT be +-1 for a spin?
		var resolvedVal = new Number($(resolveSp).attr('value')) + delta;
		$(resolveSp).attr('value', resolvedVal);
		this.$(':checkbox')[idx].checked = resolvedVal > 0;
	    }
	},

	returnSelections: function() {
	    console.info("returning selections");
	},

	prepCheck: function( evt ) {
	    var idx = this.$(':checkbox').index( evt.target );
	    if (idx >= 0) {
		var newVal = evt.target.checked ? this.options.preps[idx].unresolved : 0;
		$(this.$('.resolve-amt')[idx]).attr('value',  newVal);
		var returnSp = this.$('.return-amt')[idx];
		$(returnSp).spinner({
		    readOnly: true,
		    min: 0,
		    max: this.options.preps[idx].unresolved,
		    spin:  _.bind(this.returnSpin, this)
		});
		$(returnSp).attr('value', newVal);
	    }
	},

	selectAll: function() {
	    var returns = this.$('.return-amt');
	    var resolves = this.$('.resolve-amt');
	    for (var p=0; p < returns.length; p++) {
		$(returns[p]).spinner({
		    readOnly: true,
		    min: 0,
		    max: this.options.preps[p].unresolved,
		    spin:  _.bind(this.returnSpin, this)
		});
		$(returns[p]).attr('value', this.options.preps[p].unresolved);
		$(resolves[p]).attr('value', this.options.preps[p].unresolved);
	    };	  
	    this.$(':checkbox').attr('checked', true);
	},

	deSelectAll: function() {
	    var returns = this.$('.return-amt');
	    for (var p=0; p < returns.length; p++) {
		$(returns[p]).spinner({
		    readOnly: true,
		    min: 0,
		    max: this.options.preps[p].unresolved,
		    spin:  _.bind(this.returnSpin, this)
		});
		$(returns[p]).attr('value', 0);
	    };	  
	    this.$('.resolve-amt').attr('value', 0);
	    this.$(':checkbox').attr('checked', false);
	}
	
	//<<<<<<<<<<<<<<<<<<<<<<< events


    });


});
