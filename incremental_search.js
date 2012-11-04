$(document).ready(function(){
	var sForm = $('.inc-search-form');
	if (sForm.length > 0)
	{
		var sHint = sForm.find('.hint .pseudo');
		if (sHint.length > 0)
		{
			sHint.click(function(){
				sForm.find('#IncSearch').val($(this).html());
				sForm.find('#IncSearch').keyup();
			});
		}
	}
	
	var f = new Finder({
		searchField: $('#IncSearch'),
		container: $('.operators-list'),
		typeSelector: '.type',
		itemSelector: 'ul li a',
		titleSelector: '.title',
		noResultSelector: $('.no-results')
	});
});

var Finder = $.inherit(
	{
		__constructor: function(options){

			options = options || {};
		
			if(!options.searchField) {
				options.searchField = $(this.self.selectors.searchField);
			}
			if(!options.container) {
				options.container = $(this.self.selectors.container);
			}
			if(!options.typeSelector) {
				options.typeSelector = this.self.selectors.typeSelector;
			}
			if(!options.itemSelector) {
				options.itemSelector = this.self.selectors.itemSelector;
			}
			
			if(!options.titleSelector) {
				options.titleSelector = this.self.selectors.titleSelector;
			}
			
			if(!options.noResultSelector) {
				options.noResultSelector = $(this.self.selectors.noResultSelector);
			}
			
			this.jSearchField = options.searchField;
			this.jContainer = options.container;
			this.jTypes = this.jContainer.find( options.typeSelector );
			this.sItems = options.itemSelector;
			this.sTitles = options.titleSelector;
			this.jNoResults = options.noResultSelector;

			this.jSearchField.bind('keyup', this.filter.scope(this));
			this.jSearchField.submit(function(){return false;});
		},
		
		filter: function (event)
		{
			var that = this;

			this.jTypes.each(function(){
				var jItems = $(this).find(that.sItems);
				jItems.each(function(){
					var aTitles = $(this).find(that.sTitles);
					var hasTitle = false;
					aTitles.each(function(){
						if ($(this).html().toLowerCase().indexOf(that.jSearchField.val().toLowerCase()) != -1 )
							hasTitle = true;
					});
					if(hasTitle || that.jSearchField.val() == '')
					{
						$(this).removeClass('hidden');
					}
					else
					{
						if(!$(this).hasClass('hidden'))
							$(this).addClass('hidden');
					}
				});
				jItems = $(this).find(that.sItems).not('.hidden');
				if (jItems.length > 0)
				{
					$(this).removeClass('hidden');
				}
				else
				{
					if(!$(this).hasClass('hidden'))
						$(this).addClass('hidden');
				}
			});
			var jVTypes = this.jTypes.not('.hidden');
			if (jVTypes.length == 0)
			{
				this.jNoResults.show();
			}
			else
			{
				this.jNoResults.hide();
			}
		}
	},
	{
		selectors: {
			searchField: $('#IncSearch'),
			container: $('.operators-list'),
			typeSelector: '.type',
			itemSelector: 'ul li',
			titleSelector: '.title',
			noResultSelector: $('.no-results')
		}
	}
);