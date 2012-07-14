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
/*
   Variable: ani

   calls to plugin made through here.

   Parameters:

      aniDiv - main div with scrollable content
      mainDiv - #aniWrap - wrapper div
      leftDiv - div for left side animations #aniLeft
      rightDiv - div for right side animations #aniRight
      imgCont - all 'img' within .aniContent - used for preloading
      curSection - id of current section user is viewing
      oldSection - id of old section if any, used for hiding old section animations / content
      oldleft - #l0, #l1, #l2, ect. - used for hiding old section animations / content
      oldright - same as above but #r0
      oldMask - #m0, #m1, etc. - used for same
      scrollable - Boolean used for pausing sections scrolling too fast
      sectionLength - total amount of sections inside mainDiv

*/
var ani = {
	
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
 	
/*
   Function: ani.init(main,options)

   Initialize plugin with main div of scrolling content #aniScroll, and setup options.

   Parameters:

      main - The main id '#aniScroll' containing all sections.
      options - Setup options.
      options.aniWidth - 50 ... percent width of main content
      options.sectionHeight - 350 ... height of sections in normal view
      options.speed - 350 ... speed of all transitions
      options.easeType - 'easeInQuad' ... easing functions - readmore at http://gsgd.co.uk/sandbox/jquery/easing/
      options.contentFullHeight - '420px' ... section height in fullView
      options.rightOffset - '70' ... offset right content elements will animate in at 
      options.sectionbgcolors - '#333' ... main background color of sections
      options.scrollableSections - [0,2] ... array of section id's that will add browser scroll when in full view
      options.history - ['urlAdd0','urlAdd1','urlAdd2'] ... array of strings for browser History
      options.pageTitles - ['pageTitle0','pageTitle1','pageTitle2'] ... array of strings for each section's document.title
      
     Calls:
     
     	preLoad - <ani.preLoad()>

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
/*
   Function: ani.preLoad()

   Preloads all 'img' elements inside of .aniContent.
      
   Calls:
   
		build() - <ani.build()>

*/
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
/*
   Function: ani.build()

   Modifies some div styles, adds functionality to our nav system [click / mousewheel / arrowkeys], adds 'close' functionality to fullView close btn [.aniClose], sets up History functionality, loads our first section.
      
     Calls:
     
     	modCSS - <ani.modCSS()>
     	addNavFunc - <ani.addNavFunc()>
     	setupHistory - <ani.setupHistory()>
     	goSection - <ani.goSection(id)>
     	goSection - <ani.goSection(id, str)>
     	
     Adds click to:
     
     	.aniClose - <ani.hideFullView(id)> <ani.contentShrink(id, str)> <ani.showContent(id)>
     	
*/
	build : function() {
		
		ani.modCSS();
		ani.addNavFunc();
		
		$(window).bind('mousewheel DOMMouseScroll', ani.wheelEvent);
		$(document).on( {
			"keydown": ani.keyCheck
		});
		
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
/*
   Function: ani.setupHistory()

   Creates functionality for browser history state changes, updates document.title.
      
     Calls:
     
     	goSection - <ani.goSection(id, str)>
     	
     	
*/
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
/*
   Function: ani.addNavFunc()

   Adds click functionality for navigation menu.
     	
     Adds click to:
     
     	('a.nav').each - <ani.goSection(id)>
     	
*/
	addNavFunc : function() {
	
		$('a.nav').each(function(index) {
			var id = index
			$(this).attr('href','javascript:ani.goSection('+id+');');
			$(this).addClass('nav'+id);
			
		});
		
	},
/*
   Function: ani.modCSS()

   Adds main style elements.
      
     Sets:
     
     	#aniLeft - width to 100-options.aniWidth/2 %
     	#aniRight - same as above %
     	#aniWrap - width to options.aniWidth %
     	div.mask - background to options.sectionbgcolors
     	div.mask - width to options.aniWidth %
     	div.mask - height to options.sectionHeight px
     	#0,#1,.. - height to options.sectionHeight px
     	#l0,#l1.. - creates div with 'lsec' class and appends to ani.leftDiv
     	#r...... - same as above with 'rsec'
    	#0 .aniLeft - opacity to 0
    	#0 .aniRight - opacity to 0, moves margin-left if there is images in it's section
    	#aniLeft div - height to options.sectionHeight px
    	#aniRight div - same
    	nav - display to inline
    	ani.aniDiv - display to block
    	#footer - display to inline
     	
     Adds click function:
     
     	.aniClose - <ani.hideFullView(id)> <ani.contentShrink(id, str)> <ani.showContent(id)>
     	
*/
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
		
		$('nav').css('display','inline');
		ani.aniDiv.css('display','block');
		$('#footer').css('display','inline');
		
	},
/*
   Function: ani.sectionUpdate(id)

   Updates section left and right backgrounds, hides old section, show's content for current section, updates nav, and sets new old left and right section backgrounds
      
     Parameters:
     
     	id - section id to update
     	
     Calls:
     
     	hideOldContent - <ani.hideOldContent(str)>
     	showContent - <ani.showContent(id)>
     	updateNav - <ani.updateNav()>
     	
*/
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
/*
   Function: ani.showContent(id)

   Shows .aniLeft and .aniRight content within section id.
      
     Parameters:
     
     	id - section id
     	
*/
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
/*
   Function: ani.hideOldContent(str)

   If old content exists - will hide .aniLeft and .aniRight content and fullview if shown.
      
     Parameters:
     
     	str - 'keepWidth' - if set will not re-animate ani.oldleft and ani.oldright widths or margins
     	
     Calls:
     
     	hideFullView - <ani.hideFullView(id)>
     	
*/
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
/*
   Function: ani.hideFullView(id)

   Hides content inside section's .fullView
      
     Parameters:
     
     	id - section id
     	
*/
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
/*
   Function: ani.showFullView(id)

   Shows content inside section's .fullView
      
     Parameters:
     
     	id - section id
     	
*/
	showFullView : function(id) {
		
		var d = $('#'+id+' .fullView');
		d.fadeIn(ani.options.speed);
		
		var c = $('#'+id+' .aniClose');
		c.fadeIn(ani.options.speed);
		
	},
/*
   Function: ani.wheelEvent(e)

   Detects wheel events.
     	
     Calls:
     
     	prevSection - <ani.prevSection()>
     	nextSection - <ani.nextSection()>
     	
*/
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
/*
   Function: ani.goSection(id, str)

   Main navigation function. Adds scroller if needed. Temporarily disables re-calling same function. Updates document.title if no str is set.
      
     Parameters:
     
     	id - section id
     	str - 'noHist' - if set will not update page history
     	
     Calls:
     
     	sectionUpdate - <ani.sectionUpdate(id)>
     	
*/
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
/*
   Function: ani.updateNav()

   Adds and removes class .navSelect to each a.nav
     	
*/
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
/*
   Function: ani.nextSection()

   Next section function.
     	
     Calls:
     
     	goSection - <ani.goSection(id, str)> - ani.curSection+1
     	
*/
	nextSection : function() {
		var l = ani.mainDiv.children().length-1;
		if(ani.curSection < l){  ani.goSection(ani.curSection+1); }
	},
/*
   Function: ani.prevSection()

   Previous section function.

     Calls:
     
     	goSection - <ani.goSection(id, str)>
     	
*/
	prevSection : function() {
		if(ani.curSection > 0){ ani.goSection(ani.curSection-1); }
	},
/*
   Function: ani.resetScroll()

   Allows ani.goSection to be called again.
   
   Sets:
   
		ani.scrollable - true
     	
*/
	resetScroll : function() {
		ani.scrollable = true;
	},
/*
   Function: ani.keyCheck(e)

   Used for arrow key navigation
   
     Calls:
     
     	nextSection - <ani.nextSection()>
     	prevSection - <ani.prevSection()>
     	
*/
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
/*
   Function: ani.contentShrink(id, str)

   Returns content to normal view height.
      
     Parameters:
     
     	id - section id
     	str - 'noMask' - if not set will not reset section mask width
     	
*/
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
/*
   Function: ani.contentClick(id)

   Use this for calling 'fullView' for section.
      
     Parameters:
     
     	id - section id
     	
     Calls:
     
     	hideOldContent - <ani.hideOldContent(str)>
     	showFullView - <ani.showFullView(id)>
     	
*/
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
