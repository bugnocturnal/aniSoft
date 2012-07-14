/*
	----------------------------

	aniSoft - animated Scrolling plugin for JQuery by Gart Flores [ http://www.gartflores.com ]
	
	----------------------------
	
	browser compatibility [ tested ]: Chrome 19, FireFox 13, Safari 5.1.4, Opera 11.64
	last update - 07/12/12
	version - 0.3
	
	-added History for browser back button functionality
	-added option to make certain sections scrollable if needed
	-added bg colors to options
	-added content 'fullView' with close btn
	-added minified version of external plugins this uses
	-minor refactoring
	
	----------------------------
	
	browser compatibility [ tested ]: Chrome 19, Safari 5.1.4, ie 8, ie 9
	last update - 06/28/12
	version - 0.2
	
	----------------------------
	
	dependencies [ included in aniSoft-extras-min.js ]:
	
	jquery 1.7.2
	http://gsgd.co.uk/sandbox/jquery/easing/
	https://github.com/jquery/jquery-color
	https://github.com/desandro/imagesloaded

	----------------------------
	
*/
var ani = {
	
	loadInt : '',
	aniDiv : '',
	mainDiv : '',
	leftDiv : '',
	rightDiv : '',
	imgCont : [],
	defaults : {
		aniWidth : 50,
		sectionHeight : 350,
		speed : 350,
		easeType : 'easeInQuad',
		contentFullHeight : '420px',
		rightOffset : '70',
		sectionbgcolors : '#333',
		scrollableSections : [],
		history : [],
		pageTitles : [],
	},
	options : '',
	curSection : -1,
	oldSection : -1,
	oldleft : '',
	oldright : '',
	oldMask : '',
	maskWidth : '',
	scrollable : true,
	sectionLength : '',
	
	/**
 	* Initialize plugin with main id of scrolling content.
 	* @param {div} [main] The main id '#aniScroll'.
 	* @param {object} [options] Following options:
 	* @param {object} [options] aniWidth : 50, sectionHeight : 350, speed : 350, easeType : 'easeInQuad', contentFullHeight : '420px', rightOffset : '70', sectionbgcolors : '#333', scrollableSections : [0,2], history : ['urlAdd0','urlAdd1','urlAdd2'], pageTitles : ['pageTitle0','pageTitle1','pageTitle2']
 	*/
	init : function(main,options) {
		
		ani.options = $.extend(ani.defaults, options);
		
		ani.aniDiv = main;
		ani.mainDiv = $('#aniWrap');
		ani.leftDiv = $('#aniLeft');
		ani.rightDiv = $('#aniRight');
		
		ani.sectionLength = ani.mainDiv.children().length;
		
		ani.preLoad();
		
	},
	
	preLoad : function() {
		
		$('#loaderbg').animate({
			margin: '0'
		}, 700 );
		
		$('.aniContent img').imagesLoaded( function( $images, $proper, $broken ) {
			// $images: the jQuery object with all images
			// `this` is a jQuery object of container
			/*
			console.log( $images.length + ' images total have been loaded in ' + this );
			console.log( '------------------' );
			*/

			ani.imgCont = $images;
			
			$('#loaderbg').animate({
				margin: '-120px 0 0 0'
			}, 700, function() {
				ani.build();
			});
		});
		
	},
	
	build : function() {
		
		ani.modCSS();
		ani.addNavFunc();
		
		$(window).bind('mousewheel DOMMouseScroll', ani.wheelEvent);
		$(document).on( {
			"keydown": ani.keyCheck
		});
		
		$('nav').css('display','inline');
		ani.aniDiv.css('display','block');
		$('#footer').css('display','inline');
		
		$('.aniClose').click(function() {
			ani.hideFullView(ani.curSection);
			ani.contentShrink(ani.curSection,'noMask');
			ani.showContent(ani.curSection);
		});
		
		ani.setupHistory();
		
		var s = $.History.getState().replace('/','');
		
		if(s == ''){
			ani.goSection(0);
		} else {
			var l = ani.options.history.length;
			for (var i=0;i<l;i++){
				if(s == ani.options.history[i]){
					document.title = ani.options.pageTitles[i];
					ani.goSection(i, 'noHist');
				}
			}
		}
		
	},
	
	setupHistory : function() {
		$.History.bind(function(state){ 
			state = state.replace('/','');
			
			if(state == ''){ 
				//document.title = global.docTitle;
			} else {
				//document.title = global.docTitle + ' | ' + state;
			}
			
			var l = ani.options.history.length;
			
			for (var i=0;i<l;i++){
				if(state == ani.options.history[i] && ani.curSection != i){
					document.title = ani.options.pageTitles[i];
					ani.goSection(i, 'noHist');
				}
			}
			
		});
	},
	
	addNavFunc : function() {
	
		$('a.nav').each(function(index) {
			var id = index
			$(this).attr('href','javascript:ani.goSection('+id+');');
			$(this).addClass('nav'+id);
			
		});
		
	},
	
	modCSS : function() {
		
		var l = ani.sectionLength
		var lclass = 'lsec';
		var rclass = 'rsec';
		
		//set main widths for columns
		var sw = (100-ani.options.aniWidth)/2;
		$('#aniLeft').css('width',sw+'%');
		$('#aniRight').css('width',sw+'%');
		$('#aniWrap').css('width',ani.options.aniWidth+'%');
		
		$('div.mask').each(function(index) {
			$(this).css('background',ani.options.sectionbgcolors);
			$(this).css('width',ani.options.aniWidth+'%');
			$(this).css('height',ani.options.sectionHeight+'px');
			if(index==0){ani.maskWidth = $(this).css('width');}
		});
		
		for(var i=0; i<l; i++){
			var sec = $('#'+i);
			sec.css('height',ani.options.sectionHeight+'px');
			sec.css('background',ani.options.sectionbgcolors);
			
			var lid = 'l'+i;
			var rid = 'r'+i;
			var ls = '<div id="'+lid+'" class="'+lclass+'"></div>';ani.leftDiv.append(ls);
			var rs = '<div id="'+rid+'" class="'+rclass+'"></div>';ani.rightDiv.append(rs);
			
			var j = $('#'+i+' .aniLeft');
			var k = $('#'+i+' .aniRight');

			if(j){
				j.css('opacity','0');
			}
			if(k){
				var w;
				if(ani.imgCont[i]){
					w=ani.imgCont[i].width
				} else {
					w=0;
				}
				k.css('opacity','0');
				k.css('margin-left',w-ani.options.rightOffset);
			}
			
		}
		
		$('#aniLeft div').css('height',ani.options.sectionHeight+'px');
		$('#aniRight div').css('height',ani.options.sectionHeight+'px');
		
		
	},
	
	sectionUpdate : function(id) {

		ani.hideOldContent();
		
		var lsec = $('#l'+id);
		var rsec = $('#r'+id);
		
		lsec.css('margin-left','100%');
		lsec.css('width','100%');
		lsec.css('background',ani.options.sectionbgcolors);
		lsec.animate({
			marginLeft: '0'
		}, ani.options.speed,ani.options.easeType);
		rsec.css('width','0');
		rsec.css('background',ani.options.sectionbgcolors);
		rsec.animate({ 
			width: '100%' 
		}, ani.options.speed,ani.options.easeType);
		
		//img content animations
		ani.showContent(id);
		
		ani.updateNav();
		
		ani.oldleft = lsec;
		ani.oldright = rsec;
		
	},
	
	showContent : function(id) {
		var l = $('#'+id+' .aniLeft');
		var r = $('#'+id+' .aniRight');
		
		if(l){
			l.animate({
				marginLeft: '-100px',
				opacity: '1'
			}, ani.options.speed,ani.options.easeType);
		}
		if(r){
			var w;
			if(ani.imgCont[id]){
				w=ani.imgCont[id].width;
			} else {
				w=0;
			}
			r.animate({
				marginLeft: w,
				opacity: '1'
			}, ani.options.speed,ani.options.easeType);
		}
	},
	
	hideOldContent : function(str) {
		
		if(ani.oldleft != ''){
			// hide old left and right content [aniContent]
			var ll = $('#'+ani.oldSection+' .aniLeft');
			var rr = $('#'+ani.oldSection+' .aniRight');
			ll.animate({
				marginLeft: '0',
				opacity: '0'
			}, ani.options.speed*.5 );
			var w;
			if(ani.imgCont[ani.oldSection]){
				w=ani.imgCont[ani.oldSection].width;
			} else {
				w=0;
			}
			rr.animate({
				marginLeft: w-ani.options.rightOffset,
				opacity: '0'
			}, ani.options.speed*.5 );
			
			if(str != 'keepWidth'){
				ani.oldleft.css('margin-left','0');
				ani.oldleft.css('width','100%');
				ani.oldleft.animate({
					marginLeft: '100%'
				}, ani.options.speed);
				ani.oldright.animate({
					width: '0'
				}, ani.options.speed);
			}
			ani.hideFullView(ani.oldSection);
		}
		
	},
	
	hideFullView : function(id) {
		var d = $('#'+id+' .fullView');
		if(d.css('display') == 'block'){
			d.fadeOut(ani.options.speed);
		}
		var c = $('#'+id+' .aniClose');

		if(c.css('display') == 'block'){
			c.fadeOut(ani.options.speed);
		}
	},
	
	showFullView : function(id) {
		
		var d = $('#'+id+' .fullView');
		d.fadeIn(ani.options.speed);
		
		var c = $('#'+id+' .aniClose');
		c.fadeIn(ani.options.speed);
		
	},
	
	wheelEvent : function(e) {
		//firefox wheelEvent
		var f = e.originalEvent.detail;
		var c = e.originalEvent.wheelDelta;
		if(f != 0){
			if (f <= 0) { ani.prevSection(); }
	    	else { ani.nextSection(); }
		} else {
			if (c >= 0) { ani.prevSection(); }
	    	else { ani.nextSection(); }
		}
		
	},
	
	// main navigation function
	goSection : function(id,str) {
		if(id != ani.curSection){
			
			var showScroll;
			for (var i=0;i<ani.options.scrollableSections.length;i++){
				if(ani.options.scrollableSections[i] == id){ showScroll=true; }
			}
			
			if(showScroll){ $('body').css('overflow','visible'); } else { $('body').css('overflow','hidden');}
			
			if(ani.scrollable){
				if(ani.oldSection != -1){ ani.contentShrink(ani.oldSection); }
				ani.curSection = id;
				ani.scrollable = false;
				setTimeout('ani.resetScroll();',ani.options.speed);
				 
				var d = -(ani.options.sectionHeight*ani.curSection);

				ani.aniDiv.animate({ marginTop: d+'px'}, ani.options.speed);
				ani.sectionUpdate(ani.curSection);
				
				var mask = $('#m'+ani.curSection);
				mask.css('width','0');
				
				ani.oldMask = mask;
				ani.oldSection = id;
			}
			if(str != 'noHist'){
				$.History.go('/'+ani.options.history[id]);
			} else {
				document.title = ani.options.pageTitles[id];
			}
		}
	},
	
	updateNav : function() {
		$('a.nav').each(function(index) {
			if(index != ani.curSection){
				if($(this).hasClass('navSelect')){
					$(this).removeClass('navSelect');
				}
			} else {
				$(this).addClass('navSelect');
			}
		});
	},
	
	nextSection : function() {
		var l = ani.mainDiv.children().length-1;
		if(ani.curSection < l){  ani.goSection(ani.curSection+1); }
	},
	
	prevSection : function() {
		if(ani.curSection > 0){ ani.goSection(ani.curSection-1); }
	},
	
	resetScroll : function() {
		ani.scrollable = true;
	},
	
	keyCheck : function(e) {
		
		switch ( e.keyCode ) {
			case 40: // Down Arrow
				ani.nextSection();
				break;
			case 38: // Up Arrow
				ani.prevSection();
				break;
			case 37: // Left
				ani.prevSection();
				break;
			case 39: // Right
				ani.nextSection();
				break;
		}		
	},
	
	// shrinks content in fullView
	contentShrink : function(index, str) {
		var d = $('#'+index);
		d.animate({
			height: ani.options.sectionHeight+'px'
		}, ani.options.speed);
		
		var m = ani.oldMask;
		
		if(ani.oldleft.css('height') != (ani.options.sectionHeight+'px')){
			ani.oldleft.animate({
				height: ani.options.sectionHeight+'px'
			}, ani.options.speed, function() {
				if(str != 'noMask'){ m.css('width',ani.maskWidth); }
			});
			ani.oldright.animate({
				height: ani.options.sectionHeight+'px'
			}, ani.options.speed);
		}
	},
	
	contentClick : function(index) {
		var d = $('#'+index);
		
		ani.hideOldContent('keepWidth');
		ani.showFullView(index);

		d.animate({
			height: ani.options.contentFullHeight
		}, ani.options.speed);
		
		ani.oldleft.animate({
				height: ani.options.contentFullHeight
			}, ani.options.speed);
			ani.oldright.animate({
				height: ani.options.contentFullHeight
			}, ani.options.speed);
		
	}
}