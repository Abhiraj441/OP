/*--------------------------------------------------------------------------------
Youmax BIZ v2.1 by Jake H. from CodeHandling
https://codecanyon.net/item/youmax-grow-your-youtube-and-vimeo-business/9989505
---------------------------------------------------------------------------------*/


/*------------------------------------------------------------------
[Table of contents]

1. Youmax Settings
2. DOM Initialization 
3. Options Initialization
4. Source Validation
5. Getters
    5.1 Channel Details
    5.2 Channel Playlists
    5.3 Playlist Videos
    5.4 Video Statistics
6. Setters
    6.1 Video Objects
    6.2 Playlist Objects
    6.3 Statistic Setters
7. Display List
8. Video Display Mechanisms
8. Sorting Handlers
9. Tab Handlers
9. Animation Handler
10.Load More Handler
12.Youmax Display Handler
11.Resize Handler
12.Utility Functions 
13.Youmax Main Function
-------------------------------------------------------------------*/


(function($) {

	"use strict";

	var settings = {

		apiKey					:"AIzaSyAlhAqP5RS7Gxwg_0r_rh9jOv_5WfaJgXw",	
		channelLinkForHeader	:"https://www.youtube.com/user/yogahousem",	
		tabs:[
            {
                name:"Uploads",
                type:"youtube-channel-uploads",
                link:"https://www.youtube.com/user/yogahousem"
            }
		],
		maxResults				:"10",
		videoDisplayMode		:"popup",										
		minimumViewsPerDayForTrendingVideos:"5",							
		displayFirstVideoOnLoad	:false,
		defaultSortOrder 		:"recent-first",
		youmaxDisplayMode		:"grid", 
        
        youmaxBackgroundColor   :"#ECEFF1",
        itemBackgroundColor     :"#fbfbfb",
        headerColor              :"rgb(0, 147, 165)",
        descriptionColor        :"#686868",
        viewsColor              :"#6f6f6f",
        controlsTextColor       :"black",
        titleFontFamily         :"Open Sans",           
        generalFontFamily       :"Roboto Condensed",
		
		offerBackgroundColor    :"#fbfbfb",
        offerTextColor          :"#686868",
        offerHighlightColor     :"#FFC107",
        
        titleFontSize           :"0.9",
        titleFontWeight         :"normal",
        descriptionFontSize     :"0.85",
        viewsDateFontSize       :"0.75",
        baseFontSize            :"16px", 
        
        offerTitleFontSize      :"1.3",
        offerDescriptionFontSize:"0.85",
        offerButtonFontSize     :"1",
        
        responsiveBreakpoints	:[600,900,2000,2500],
        gridThumbnailType		:"full",
        dateFormat				:"relative",
        loadMoreText            :"<i class='fa fa-plus'></i>&nbsp;&nbsp;Show me more videos..",
        ctaText                 :"<i class='fa fa-envelope'></i>&nbsp;&nbsp;Get me a consultation..",
		ctaLink                 :"http://www.healthbyscience.co.uk/get-started-now/",
		
		/*
		offerTitle              :"Christmas Offer",
        offerDescription        :"50% Off on all Courses till December 31!",
        offerButtonText         :"Learn More",
        offerLink               :"http://codehandling.com",

        callouts 				:[{}],
        calloutType				:"list",
        */
                
		videoCache				:[],
		aspectRatio				:360/640,
		pageToken				:null,
		nextPageToken			:null,
		currentPageToken		:null,
		previousPageToken		:null,
		clearListOnDisplay		:true,
		channelIdForSearch		:null,
		searchFlag				:false

	},

	init = function($youmaxPro) {
	
		var youmaxWrapperStart = "<div class='yl-font-controller'>"
		var youmaxWrapperEnd = "</div>"
		var listWrapperStart = "<div class='yl-wrapper'>";
		var listWrapperEnd = "</div>";
		var channelHeader = "<div class='yl-header'></div>"
		
		var gridListSwitch = "<div class='yl-switch' title='Grid or List View' data-view='double-list'><i class='fa fa-bars'></i></div>";
		var listHeader = "<div class='yl-list-title'><div class='yl-tab-container'><i class='fa fa-bars'></i></div><select id='yl-sort-order'><option value='popular-first' selected>Popular first</option><option value='recent-first'>Recent first</option></select>"+gridListSwitch+"</div>";
		
		var inlineContainer = "<div class='yl-inline-container'></div>";
		var listContainer = "<div class='yl-item-container'></div>";
		var loadMoreButton = "<div class='yl-load-more-button'>"+settings.loadMoreText+"</div>";
		var previousButton = "<div class='yl-previous-button'>"+settings.previousButtonText+"</div>";
		var nextButton = "<div class='yl-next-button'>"+settings.nextButtonText+"</div>";
		var ctaButton = "";
		var calloutContainer = "<div class='yl-callout-container'></div>";
		var loadingMechanism = "";

		if(settings.ctaLink!=null) {
			ctaButton = "<a href='"+settings.ctaLink+"' target='_blank'><div class='yl-cta-button'>"+settings.ctaText+"</div></a>";
		}

		if(settings.loadingMechanism=="load-more") {
			loadingMechanism = loadMoreButton;
		} else {
			loadingMechanism = previousButton + nextButton;
		}
		
		$youmaxPro.empty().append(youmaxWrapperStart+channelHeader+listWrapperStart+listHeader+inlineContainer+listContainer+loadingMechanism+ctaButton+calloutContainer+listWrapperEnd+youmaxWrapperEnd);
		showLoader($youmaxPro);
	},


    doOptions = function($youmaxPro){

    	var customCSS = "";
    	var headerColor,lightHeaderColor;

    	clearSettings();
    	settings.minimumViewsPerDayForTrendingVideos = parseInt(settings.minimumViewsPerDayForTrendingVideos,10);

    	//set date format
    	if(settings.dateFormat=="relative") {
    		convertDate = convertToRelativeDate;
    	} else if(settings.dateFormat=="specific") {
    		convertDate = convertToSpecificDate;
    	}

    	//set view - grid|list|double-list
    	handleYoumaxDisplay($youmaxPro);


    	//Youmax Background Color
    	customCSS += ".youmax-pro {background-color: "+settings.youmaxBackgroundColor+";}";
    	customCSS += ".yl-load-more-button:hover {background: linear-gradient(to right,"+settings.youmaxBackgroundColor+","+settings.itemBackgroundColor+" 30%);}"

    	//Item Background Color
    	customCSS += ".yl-list-title select, .yl-item, .yl-load-more-button, .yl-previous-button, .yl-next-button .yl-channel-search {background-color: "+settings.itemBackgroundColor+";}"

    	//Views Color
    	customCSS += customCSS += ".yl-view-bucket {color: "+settings.viewsColor+"; border-color: "+settings.viewsColor+";}";
    	customCSS += ".yl-date-bucket{color: "+settings.viewsColor+";}";
    	customCSS += ".yl-grid .yl-view-string{color: "+settings.viewsColor+";}";
		customCSS += ".yl-selected-tab:after{background-color:"+settings.viewsColor+";}";

    	//Description Color
    	customCSS += ".yl-description, .yl-item, .yl-loader, .yl-list-title, .yl-list-title span {color:"+settings.descriptionColor+";}";

    	//Header Color
	   	customCSS += ".yl-view-bucket-seen {background-color: "+settings.headerColor+";border-color: "+settings.headerColor+"; color:white;}";
	   	customCSS += ".yl-grid .yl-view-bucket-seen {color: "+settings.headerColor+"; background-color:inherit;}";
    	customCSS += ".yl-loader {border-color: "+settings.headerColor+";}";
    	customCSS += ".yl-load-more-button,.yl-previous-button {box-shadow: 0.125em 0.3125em 0.3125em -0.125em rgba(0,0,0,0.2), -0.2em 0px 0px 0px "+settings.headerColor+";}";
    	customCSS += ".yl-list-title select{box-shadow: 0.125em 0.3125em 0.3125em -0.125em rgba(0,0,0,0.2), -0.2em 0px 0px 0px "+settings.headerColor+";}";
    	customCSS += ".yl-header,.yl-cta-button{background-color:"+settings.headerColor+"; color:"+settings.itemBackgroundColor+";}";

    	customCSS += ".yl-description a, .yp-popup-description a {color: "+settings.headerColor+";}";
    	customCSS += ".yp-share:hover {background-color: "+settings.headerColor+";}";

    	//Title Color
    	customCSS += ".yl-title, .yl-views-per-day {color: "+settings.titleColor+";}";

    	
    	//customCSS += ".yl-tab-container{box-shadow: -0.2em 0px 0px 0px "+settings.viewsColor+";}";
    	

    	//Controld Text Color
    	customCSS += ".yl-list-title select, .yl-load-more-button, .yl-previous-button, .yl-next-button, .yl-channel-search {color:"+settings.controlsTextColor+";}";
		customCSS += ".yl-tab-container{color: "+settings.controlsTextColor+";}";

		//Offer Color
		customCSS += ".yl-callout-buy-button, .yl-callout-preview-button, .yl-offer-button{background-color:"+settings.offerHighlightColor+"; color:"+settings.offerBackgroundColor+";}";
    	customCSS += ".yl-callout,.yl-offer{box-shadow: 0px 0px 13px 2px rgba(0,0,0,0.2), 0.2em 0px 0px 0px "+settings.offerHighlightColor+";}";
    	customCSS += ".yl-grid-callouts .yl-callout{box-shadow: 0px 0px 13px 2px rgba(0,0,0,0.2);}";
    	customCSS += ".yl-callout-title,.yl-offer-title {color: "+settings.offerTextColor+";}";
		customCSS += ".yl-callout-description,.yl-offer-description {color:"+settings.offerTextColor+";}";
		customCSS += ".yl-callout-right,.yl-offer {background-color: "+settings.offerBackgroundColor+";}"


    	headerColor = settings.headerColor;
    	if(headerColor.indexOf("rgb")!=-1) {
    		//convert rgb format to rgba format
    		lightHeaderColor = headerColor.substring(0,headerColor.length-1) + ",0.5)";
			lightHeaderColor = lightHeaderColor.replace("rgb","rgba");
			customCSS += ".yl-views-per-day{border-color: "+lightHeaderColor+";}";
			customCSS += ".yl-load-more-button:hover {background: linear-gradient(to right,"+lightHeaderColor+","+settings.itemBackgroundColor+" 20%);}"
			customCSS += ".yl-loading {background: "+lightHeaderColor+" !important;}";
    	}



    	//font size styles
    	customCSS += ".yl-title {font-size:"+settings.titleFontSize+"em !important; font-weight:"+settings.titleFontWeight+" !important;}";
    	customCSS += ".yl-description {font-size:"+settings.descriptionFontSize+"em !important;}";
    	customCSS += ".yl-date-bucket,.yl-view-string {font-size:"+settings.viewsDateFontSize+"em !important;}";
    	customCSS += ".youmax-pro,.mfp-container{font-size: "+settings.baseFontSize+";}";
    	
    	//offer font sizes
    	customCSS += ".yl-offer-title,.yl-callout-title {font-size:"+settings.offerTitleFontSize+"em !important;}";
    	customCSS += ".yl-offer-description, .yl-callout-description {font-size:"+settings.offerDescriptionFontSize+"em !important;}";
    	customCSS += ".yl-offer-button, .yl-callout-buy-button, .yl-callout-preview-button {font-size:"+settings.offerButtonFontSize+"em !important;}";




    	//font-family
    	customCSS += ".yl-item,.yl-callout,.yl-offer{font-family:"+settings.generalFontFamily+";}";
    	customCSS += ".yl-title,.yl-offer-title,.yl-callout-title {font-family:"+settings.titleFontFamily+";}";


    	//remove styles if already existing
    	$(".youmax-added-styles").remove();

    	//add new styles
		$("body").append("<style class='youmax-added-styles'>"+customCSS+"</style>");

    },

    clearSettings = function(){

    	settings.videoCache = [];
    	settings.nextPageToken = null;
    	settings.clearListOnDisplay = true;
    	settings.searchFlag = false;

    },


    initHeader = function($youmaxPro){

    	var identifierJSON;
    	identifierJSON = sanitizeLink("youtube-channel-uploads",settings.channelLinkForHeader);

    	if(identifierJSON.identifier=="error") {
			return;
		}

		getChannelDetails(identifierJSON.identifierType,identifierJSON.identifier,null,$youmaxPro);
    
    },

    displayHeader = function(channelDetails,$youmaxPro){

    	var channelId = channelDetails.items[0].id;
    	var channelName = channelDetails.items[0].snippet.localized.title;
    	var channelLink = "//www.youtube.com/channel/"+channelId;
    	var channelThumbnail = channelDetails.items[0].snippet.thumbnails.default.url;

    	var $youmaxHeader = $youmaxPro.find(".yl-header");

    	var channelThumbnailHTML = "<div class='yl-channel-thumbnail'><a href='"+channelLink+"' target='_blank'><img src='"+channelThumbnail+"' /></a></div>";
    	var channelDetailsHTML = "<div class='yl-channel-details'><div class='yl-channel-name'><a href='"+channelLink+"' target='_blank'>"+channelName+"</a></div><div class='yl-subscribe'><div class='g-ytsubscribe' data-channelid='"+channelId+"' data-layout='default' data-count='default'></div></div></div>";
    	var channelSearchHTML = "<div class='yl-channel-search'><input class='yl-channel-search-input' type='text' placeholder='search' /><i class='fa fa-search'></i></div>";

    	$youmaxHeader.append(channelThumbnailHTML+channelDetailsHTML+channelSearchHTML);

    	settings.channelIdForSearch = channelId;

		renderSubscribeButton();

    },

	
	//display youtube subscribe button
	renderSubscribeButton = function() {
	
		$.ajaxSetup({
		  cache: true
		});
		
		$.getScript("https://apis.google.com/js/platform.js")
		.done(function( script, textStatus ) {

		})
		.fail(function( jqxhr, settings, exception ) {

		});
		
	},
	


	createTabs = function($youmaxPro) {

		var identifierJSON,source,name,link,selected,channelId,channelUser,playlistId,tabId;
		var $youmaxTabContainer = $youmaxPro.find(".yl-tab-container");

		for(var i=0; i<settings.tabs.length; i++) {

			source = settings.tabs[i].type;
			name = settings.tabs[i].name;
			link = settings.tabs[i].link;

			identifierJSON = sanitizeLink(source,link);

			//skip Tab in case of error
			if(identifierJSON.identifier=="error") {
				continue;
			}

			tabId = source + "-" + identifierJSON.identifier;
			$youmaxTabContainer.append("<div class='yl-tab' id='"+tabId+"'>"+name+"</div>");


			if(source=="youtube-channel-uploads") {

				//update the tab with uploads's playlist id
				getChannelDetails(identifierJSON.identifierType,identifierJSON.identifier,tabId,$youmaxPro);
					

			} else if(source=="youtube-channel-playlists") {

				if(identifierJSON.identifierType=="youtube-channel-user") {

					//update the tab with channel id
					getChannelDetails(identifierJSON.identifierType,identifierJSON.identifier,tabId,$youmaxPro);

				} else {

					//load videos if default Tab
					if(settings.defaultTab==name) {
						$youmaxPro.find("#"+tabId).click();
					}					

				}

			} else if(source=="youtube-playlist-videos") {
				
				//load videos if default Tab
				if(settings.defaultTab==name) {
					$youmaxPro.find("#"+tabId).click();
				}

			} else if(source=="vimeo-user-videos") {
				
				//load videos if default Tab
				if(settings.defaultTab==name) {
					$youmaxPro.find("#"+tabId).click();
				}

			}
			
		} //for loop on tabs ends

		
	},

	sanitizeLink = function(source,link) {

		var sanityIndex,channelId,channelUser,playlistId,userName;
		var identifierJSON = {
			identifier 			:"",
			identifierType		:""
		};

		//remove trailing slashes
		link = link.replace(/\/$/, "");
		//remove "/videos" from the end of URL
		link = link.replace("/videos","");
		//remove "/playlists" from the end of URL
		link = link.replace("/playlists","");


		if(source=="youtube-channel-uploads" || source=="youtube-channel-playlists") {

			sanityIndex = link.indexOf("/user/");
			if(sanityIndex==-1) {
				
				sanityIndex = link.indexOf("/channel/");

				if(sanityIndex==-1) {

					alert("\n\nChannel Link should be of the format: \nhttps://www.youtube.com/channel/UComP_epzeKzvBX156r6pm1Q \nOR\nhttps://www.youtube.com/user/designmilk\n\n");
					identifierJSON.identifierType = "youtube-channel-id";
					identifierJSON.identifier = "error";

				} else {

					channelId = link.substring(sanityIndex+9);
					identifierJSON.identifierType = "youtube-channel-id";
					identifierJSON.identifier = channelId;
					
				}

			} else {

				channelUser = link.substring(sanityIndex+6);
				identifierJSON.identifierType = "youtube-channel-user";				
				identifierJSON.identifier = channelUser;

			}


		} else if(source=="youtube-playlist-videos") {
			
			identifierJSON.identifierType = "youtube-playlist-id";

			sanityIndex = link.indexOf("list=");
			if(sanityIndex==-1) {
				alert("\n\nPlaylist Link should be of the format: \nhttps://www.youtube.com/playlist?list=PL6_h4dV9kuuIOBDKgxu3q9DpvvJFZ6fB5\n\n");
				identifierJSON.identifier = "error";
			} else {			
				playlistId = link.substring(sanityIndex+5);
				identifierJSON.identifier = playlistId;
			}
			

		} else if(source=="vimeo-user-videos") {

			identifierJSON.identifierType = "vimeo-user";

			sanityIndex = link.indexOf("vimeo.com/");
			if(sanityIndex==-1) {
				alert("\n\nVimeo User Link should be of the format: \nhttps://vimeo.com/user123\n\n");
				identifierJSON.identifier = "error";
			} else {			
				userName = link.substring(sanityIndex+10);
				identifierJSON.identifier = userName;
			}

		}

		return identifierJSON;



	},

	getChannelDetails = function(channelType,channelIdentifier,tabId,$youmaxPro) {

		var apiURL = "";

		if(channelType=="youtube-channel-user") {
			apiURL = "https://www.googleapis.com/youtube/v3/channels?part=contentDetails%2Csnippet&forUsername="+channelIdentifier+"&key="+settings.apiKey;	
		} else if(channelType=="youtube-channel-id") { 
			apiURL = "https://www.googleapis.com/youtube/v3/channels?part=contentDetails%2Csnippet&id="+channelIdentifier+"&key="+settings.apiKey;	
		}
		

		$.ajax({
			url: apiURL,
			type: "GET",
			async: true,
			cache: true,
			dataType: 'json',
			success: function(response) {
				
				if(null==tabId) {
					displayHeader(response,$youmaxPro);
				} else {
					updateTabs(tabId,response,$youmaxPro);	
				}
				
			},
			error: function(html) { 
				
				
			}
		});

	},


	getChannelPlaylists = function(channelId,$youmaxPro) {

		var apiURL, videoArray, pageTokenUrl = "";

		if(settings.nextPageToken!=null) {
			pageTokenUrl = "&pageToken="+settings.nextPageToken;
		}

		apiURL = "https://www.googleapis.com/youtube/v3/playlists?part=contentDetails%2Csnippet&channelId="+channelId+"&maxResults="+settings.maxResults+pageTokenUrl+"&key="+settings.apiKey;
			
		$.ajax({
			url: apiURL,
			type: "GET",
			async: true,
			cache: true,
			dataType: 'json',
			success: function(response) {
				videoArray = createPlaylistObjects(response.items,$youmaxPro);				
				handleToken("youtube",response.nextPageToken,$youmaxPro);
				displayItems(videoArray,$youmaxPro);
				videoDisplayMechanism($youmaxPro);
			},
			error: function(html) { 
				
				
			}
		});

	},

	getPlaylistVideos = function(playlistId,$youmaxPro) {
		
		var apiURL, pageTokenUrl = "";

		if(settings.nextPageToken!=null) {
			pageTokenUrl = "&pageToken="+settings.nextPageToken;
		}

		apiURL = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId="+playlistId+"&maxResults="+settings.maxResults+pageTokenUrl+"&key="+settings.apiKey;


		$.ajax({
			url: apiURL,
			type: "GET",
			async: true,
			cache: true,
			dataType: 'json',
			success: function(response) {
				createVideoObjects(response.items,$youmaxPro);
				handleToken("youtube",response.nextPageToken,$youmaxPro);
			},
			error: function(html) { 
				
				
			}
		});			
	},

	getSearchVideos = function(searchText,$youmaxPro){

		var apiURL, pageTokenUrl = "";

		if(settings.nextPageToken!=null) {
			pageTokenUrl = "&pageToken="+settings.nextPageToken;
		}


		apiURL = "https://www.googleapis.com/youtube/v3/search?part=snippet&q="+searchText+"&order=relevance&channelId="+settings.channelIdForSearch+"&type=video&maxResults="+settings.maxResults+pageTokenUrl+"&key="+settings.apiKey;


		$.ajax({
			url: apiURL,
			type: "GET",
			async: true,
			cache: true,
			dataType: 'json',
			success: function(response) {
				createSearchVideoObjects(response.items,$youmaxPro);
				handleToken("youtube",response.nextPageToken,$youmaxPro);
			},
			error: function(html) { 
				
				
			}
		});	

	},

	
	getVimeoUserVideos = function (userId,$youmaxPro) {

		var apiURL, pageTokenUrl = "";
		var videoArray;

		if(settings.nextPageToken!=null) {
			pageTokenUrl = "&"+settings.nextPageToken;
		}

		//apiURL = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId="+playlistId+"&maxResults="+settings.maxResults+pageTokenUrl+"&key="+settings.apiKey;

		apiURL = "https://api.vimeo.com/users/"+userId+"/videos?access_token="+settings.vimeoAccessToken+"&per_page="+settings.maxResults+pageTokenUrl;


		$.ajax({
			url: apiURL,
			type: "GET",
			async: true,
			cache: true,
			dataType: 'json',
			success: function(response) {
				videoArray = createVimeoVideoObjects(response.data,$youmaxPro);
				handleToken("vimeo",response.paging.next,$youmaxPro);
				displayItems(videoArray,$youmaxPro);
				videoDisplayMechanism($youmaxPro);
			},
			error: function(html) { 
				
				
			}
		});

	},



	handleToken = function(network,token,$youmaxPro) {


		if(token==null) {
			//$youmaxPro.find('.yl-load-more-button').html("All Done");
			settings.nextPageToken = null;
			return;
		}

		$youmaxPro.find(".yl-loading").removeClass("yl-loading");

		//token is not null.. next page is present
		if(network=="vimeo") {
			token = token.substring(token.lastIndexOf("&")+1);	
			settings.nextPageToken = token;
		} else if(network="youtube") {
			settings.nextPageToken = token;	
		}

	},


	getVideoStatistics = function(videoIdArray,videoArray,$youmaxPro) {

		var apiURL = "https://www.googleapis.com/youtube/v3/videos?part=statistics%2CcontentDetails%2Csnippet&id="+videoIdArray+"&key="+settings.apiKey;
		var videoArray;

		$.ajax({
			url: apiURL,
			type: "GET",
			async: true,
			cache: true,
			dataType: 'json',
			success: function(response) {
				videoArray = addStatisticsToVideos(response.items,videoArray);
				displayItems(videoArray,$youmaxPro);
				videoDisplayMechanism($youmaxPro);
			},
			error: function(html) { 
				
				
			}
		});			
	},


    createVideoObjects = function(itemArray,$youmaxPro) {

    	var videoIdArray = [], videoArray = [];
    	var proSnippet;

    	for(var i=0; i<itemArray.length; i++) {
    		proSnippet = new Object();
    		proSnippet.image = itemArray[i].snippet.thumbnails.medium.url;
    		proSnippet.title = itemArray[i].snippet.title;
    		proSnippet.description = itemArray[i].snippet.description;
    		proSnippet.playlistId = itemArray[i].snippet.playlistId;
    		proSnippet.videoId = itemArray[i].snippet.resourceId.videoId;
			proSnippet.link = "https://www.youtube.com/watch?v="+proSnippet.videoId+"&list="+proSnippet.playlistId;

			//TODO: Date will be added for uploads in next version
			//proSnippet.date = itemArray[i].snippet.publishedAt;
			//proSnippet.formattedDate = convertDate(proSnippet.date);
			
			videoArray.push(proSnippet);
			videoIdArray.push(proSnippet.videoId);
    	}

    	//get video stats
    	getVideoStatistics(videoIdArray,videoArray,$youmaxPro);    	

    },

    createVimeoVideoObjects = function(itemArray,$youmaxPro) {

    	var videoIdArray = [], videoArray = [];
    	var proSnippet;
    	var now = new Date().getTime();
		var views,viewsPerDay,duration;

    	for(var i=0; i<itemArray.length; i++) {
    		proSnippet = new Object();
    		proSnippet.image = itemArray[i].pictures.sizes[2].link;
    		proSnippet.title = itemArray[i].name;
    		proSnippet.description = itemArray[i].description;
    		if(null==proSnippet.description) {
    			proSnippet.description = "";
    		}
			
			//link
			proSnippet.link = itemArray[i].link;
    		proSnippet.videoId = proSnippet.link.substring(proSnippet.link.indexOf("/",15)+1);

			//views
			views = itemArray[i].stats.plays;
			proSnippet.views = views;
    		
    		//date
    		proSnippet.date = itemArray[i].release_time;
			proSnippet.formattedDate = convertDate(proSnippet.date);

			//calculate view per day to define trend
			viewsPerDay = (views)/((now - new Date(proSnippet.date).getTime())/1000/60/60/24);
			proSnippet.viewsPerDay = viewsPerDay;
			
			//convert views
			views = convertViews(views);
			proSnippet.commaSeparatedViews = views;

			//duration
			duration = convertVimeoDuration(itemArray[i].duration);
			proSnippet.duration = duration;
			
			videoArray.push(proSnippet);
    	}  	

		settings.currentCacheBlockStart = settings.videoCache.length;
    	settings.videoCache = settings.videoCache.concat(videoArray);
    	settings.currentCacheBlockEnd = settings.videoCache.length;

    	return videoArray;

    },


    createSearchVideoObjects = function(itemArray,$youmaxPro) {

    	var videoIdArray = [], videoArray = [];
    	var proSnippet;

    	for(var i=0; i<itemArray.length; i++) {
    		proSnippet = new Object();
    		proSnippet.image = itemArray[i].snippet.thumbnails.medium.url;
    		proSnippet.title = itemArray[i].snippet.title;
    		proSnippet.description = itemArray[i].snippet.description;
    		proSnippet.playlistId = null;
    		proSnippet.videoId = itemArray[i].id.videoId;
			proSnippet.link = "//www.youtube.com/watch?v="+proSnippet.videoId;

			//TODO: Date will be added for uploads in next version
			//proSnippet.date = itemArray[i].snippet.publishedAt;
			//proSnippet.formattedDate = convertDate(proSnippet.date);
			
			videoArray.push(proSnippet);
			videoIdArray.push(proSnippet.videoId);
    	}

    	//get video stats
    	getVideoStatistics(videoIdArray,videoArray,$youmaxPro);    	

    },


    createPlaylistObjects = function(itemArray,$youmaxPro) {

    	var videoIdArray = [], videoArray = [];
    	var proSnippet;

    	for(var i=0; i<itemArray.length; i++) {
    		proSnippet = new Object();
    		proSnippet.isPlaylist = true;
    		proSnippet.image = itemArray[i].snippet.thumbnails.medium.url;
    		proSnippet.title = itemArray[i].snippet.title;
    		proSnippet.description = itemArray[i].snippet.description;
    		proSnippet.playlistId = itemArray[i].id;
    		proSnippet.videoId = itemArray[i].id;
			proSnippet.link = "//www.youtube.com/playlist?list="+proSnippet.playlistId;

			
			proSnippet.date = itemArray[i].snippet.publishedAt;
			proSnippet.formattedDate = convertDate(proSnippet.date);

			//adding number of videos in a playlist inside the "commaSeparatedViews" variable
			proSnippet.itemCount = itemArray[i].contentDetails.itemCount;
			if(itemArray[i].contentDetails.itemCount <= 0) {
				//skip the playlist with 0 videos
				continue;
			}

			proSnippet.viewsPerDay = 0;
			
			videoArray.push(proSnippet);
			videoIdArray.push(proSnippet.videoId);
    	}

    	settings.videoCache = settings.videoCache.concat(videoArray);    
    	return videoArray;	

    },



    addStatisticsToVideos = function(statisticArray,videoArray,$youmaxPro) {

		var now = new Date().getTime();
		var views,viewsPerDay,duration;

    	for(var i=0; i<statisticArray.length; i++) {
    		views = statisticArray[i].statistics.viewCount;
			videoArray[i].views = views;
    		videoArray[i].date = statisticArray[i].snippet.publishedAt;
			videoArray[i].formattedDate = convertDate(videoArray[i].date);

			//calculate view per day to define trend
			viewsPerDay = (views)/((now - new Date(videoArray[i].date).getTime())/1000/60/60/24);
			videoArray[i].viewsPerDay = viewsPerDay;
			
			//convert views
			views = convertViews(views);
			videoArray[i].commaSeparatedViews = views;

			duration = convertDuration(statisticArray[i].contentDetails.duration);
			videoArray[i].duration = duration;


    	}

    	settings.currentCacheBlockStart = settings.videoCache.length;
    	settings.videoCache = settings.videoCache.concat(videoArray);
    	settings.currentCacheBlockEnd = settings.videoCache.length;

    	return videoArray;

    },

    updateTabs = function(tabId,channelDetails,$youmaxPro){

    	var $youmaxTab = $youmaxPro.find("#"+tabId);
    	var uploadsPlaylistId = channelDetails.items[0].contentDetails.relatedPlaylists.uploads;
    	var channelId = channelDetails.items[0].id;
    	var finalTabId;

    	if(tabId.indexOf("youtube-channel-uploads")!=-1) {
    		finalTabId = "youtube-channel-uploads-"+uploadsPlaylistId;
    		$youmaxTab.attr("id",finalTabId);
    	} else if(tabId.indexOf("youtube-channel-playlists")!=-1) {
    		finalTabId = "youtube-channel-playlists-"+channelId;
    		$youmaxTab.attr("id",finalTabId);
    	}

    	if(settings.defaultTab==$youmaxTab.text()) {
			$youmaxPro.find("#"+finalTabId).click();
		}

    },


	displayItems = function(videoArray,$youmaxPro) {

		var viewboxHTML, dateboxHTML, trendBoxHTML, itemboxHTML, durationHTML, viewStringHTML, sortOrder, containerHTML="";
		var image, views, viewsPerDay, title, description, date, link, id, popupLink, duration, viewsText, isPlaylist, itemCount;
		var sortOrder = $youmaxPro.find("#yl-sort-order").val();
		var $youmaxContainer = $youmaxPro.find(".yl-item-container");
		var list = videoArray;		
		//list = settings.videoCache
		
		if(settings.searchFlag) {
			sortOrder = "relevenace";
			//do not sort when user searches
		}

		if(sortOrder=="popular-first") {
			list.sort(popularFirstComparator);
		} else if(sortOrder=="recent-first") {
			list.sort(latestFirstComparator);
		}

		if(settings.clearListOnDisplay) {
			clearList($youmaxPro);
		}

		for(var count=0; count<list.length; count++) {	
			
            image = list[count].image;
			views = list[count].commaSeparatedViews;
			viewsPerDay = list[count].viewsPerDay;
			title = list[count].title;
			description = list[count].description;
			date = list[count].formattedDate;
            link = list[count].link;
            id = list[count].videoId;
            popupLink = "//www.youtube.com/watch?v="+id;
            duration = list[count].duration;            
            isPlaylist = list[count].isPlaylist;
            itemCount = list[count].itemCount;

            description = processDescription(description);


            if(isPlaylist) {
            	viewsText = itemCount + " <span>videos</span>";
            } else {
            	viewsText = views + " <span>views</span>";
            }

			if(viewsPerDay>settings.minimumViewsPerDayForTrendingVideos) {
				trendBoxHTML = "<div class='yl-views-per-day'><i class='fa fa-bolt'></i></div>";
			} else {
				trendBoxHTML = "";
			}

			if(null!=duration) {
				durationHTML = "<div class='yl-duration'><i class='fa fa-play'></i>&nbsp;"+duration+"</div>";
			} else {
				durationHTML = "";
			}

			//viewboxHTML = "<div class='yl-view-bucket' data-views='"+views+"'><div class='yl-view-wrapper'><div class='yl-view-icon'><div class='triangle-with-shadow'></div></div><div class='yl-view-count'>"+viewsFancy+"</div></div></div>";

			viewboxHTML = "<div class='yl-view-bucket' data-views='"+views+"'><div class='yl-view-wrapper'><div class='yl-view-count'>"+viewsText+"</div></div></div>";


			viewStringHTML = "<div class='yl-view-string'>"+viewsText+"</div>";
		
			dateboxHTML = "<div class='yl-date-bucket'>"+date+"</div>";

			itemboxHTML = "<div class='yl-item' id='"+id+"'><div class='yl-focus' href='"+popupLink+"' data-link='"+link+"'><div class='yl-thumbnail'><img src='"+image+"''>"+durationHTML+"</div><br/>"+viewboxHTML+"</div><div class='yl-text'><div class='yl-title-description-wrapper'><div class='yl-title'>"+title+"</div><div class='yl-description'>"+description+"</div></div>"+"<div class='yl-separator-for-grid'></div>"+viewStringHTML+dateboxHTML+trendBoxHTML+"</div></div>";

			containerHTML += "<div class='yl-item-wrapper'>"+itemboxHTML+"</div>";

		}

		$youmaxContainer.append(containerHTML);

	},

	displayPopupData = function($baseElement,$youmaxPro) {

		var popupTitleHTML,popupDescriptionHTML,facebookShareHTML,twitterShareHTML,googleShareHTML;
		var title, description, link;
		var $popupBox;

		setTimeout(function(){

			$popupBox = $(".yp-popup-details");

			title = $baseElement.find(".yl-title").html();
			description = $baseElement.find(".yl-description").html();
			description = description.replace(/\n/g,"<br>");
			link = $baseElement.find(".yl-focus").data("link");
			link = encodeURIComponent(link);

			popupTitleHTML = "<div class='yp-popup-title'>"+title+"</div>";
			popupDescriptionHTML = "<div class='yp-popup-description'>"+description+"</div>";
			facebookShareHTML = "<div onclick=\"window.open('https://www.facebook.com/sharer.php?u="+link+"','facebook','width=500,height=350');\" class='yp-share'><i class='fa fa-facebook'></i></div>";
			twitterShareHTML = "<div onclick=\"window.open('https://twitter.com/share?text="+title+"&url="+link+"','facebook','width=500,height=350');\" class='yp-share'><i class='fa fa-twitter'></i></div>";
			googleShareHTML = "<div onclick=\"window.open('https://plus.google.com/share?url="+link+"','facebook','width=500,height=350');\" class='yp-share'><i class='fa fa-google'></i></div>";

			//<a target='_blank' href='https://www.facebook.com/sharer.php?u="+link+"'>
			$popupBox.empty();

			$popupBox.append("<div class='yp-left-section'>"+facebookShareHTML+twitterShareHTML+googleShareHTML+"</div>"+"<div class='yp-right-section'>"+popupTitleHTML+popupDescriptionHTML+"</div>");


		}, 100);
		
	},

	clearList = function($youmaxPro) {
		$youmaxPro.find(".yl-item-container").empty();
	},

    videoDisplayMechanism = function($youmaxPro){

    	if(settings.videoDisplayMode=="popup") {
			registerPopup($youmaxPro);	
		} else if(settings.videoDisplayMode=="inline") {
			registerInlineEmbed($youmaxPro);	
		} else {
			registerLinkToYouTube($youmaxPro);
		}

    },

    registerPopup = function($youmaxPro) {

    	var currentTabId, playlistId, embedURL = "";
    	var autoPlayString = settings.autoPlay ? "&autoplay=1" : "&autoplay=0";

    	//get selected tab and handle the tab click
		currentTabId = $youmaxPro.find(".yl-selected-tab").attr("id");
		playlistId = currentTabId.substring(currentTabId.indexOf("-",20)+1);

    	if(currentTabId.indexOf("vimeo")!=-1) {
    		embedURL = "//player.vimeo.com/video/%id%?badge=0&autopause=0&player_id=0"+autoPlayString;
    	} else if(currentTabId.indexOf("youtube-channel-playlists")!=-1) {
    		embedURL = "//www.youtube.com/embed?listType=playlist&list=%id%&rel=0"+autoPlayString;
    	} else {
    		embedURL = "//www.youtube.com/embed/%id%?listType=playlist&list="+playlistId+"&rel=0"+autoPlayString;
    	}

    	$youmaxPro.find(".yl-focus").magnificPopup({
    		gallery: {
		      enabled: true
		    },
    		type:'iframe',
    		iframe:{
    			
    			markup:
    				'<div class="mfp-iframe-scaler">'+
						'<button title="Close (Esc)" type="button" class="mfp-close">×</button>'+
						'<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>'+
						'<div class="yp-popup-details"></div>'+
					'</div>'+
					'<div class="mfp-preloader">Loading...</div>',

    			patterns: {
					youtube: {
						src: embedURL
					},
					vimeo : {
						src: embedURL
					}
				}
    		},

    		alignTop: true,
    		
    		callbacks: {
				change: function() {
						
					// Triggers each time when content of popup changes
					var $baseElement = $(this.currItem.el[0].offsetParent);
					displayPopupData($baseElement,$youmaxPro);
					
				}			
			}
    	});

    },

	popupWindow = function(url,windowName) {
       	alert("popupWindow");
       	var newwindow = window.open(url,windowName,'height=200,width=150');

       	if (window.focus) {
       		newwindow.focus();
       	}
       	
       	return false;
    },

	registerInlineEmbed = function($youmaxPro) {

		//get selected tab and handle the tab click
		var currentTabId = $youmaxPro.find(".yl-selected-tab").attr("id");
		var playlistId = currentTabId.substring(currentTabId.indexOf("-",20)+1);

    	$youmaxPro.on("click",".yl-focus", function(){

	    	var embedURL = "";
	    	var id = $(this).parents(".yl-item").attr("id");
	    	var $youmaxInlineContainer = $youmaxPro.find(".yl-inline-container");
	    	var autoPlayString = settings.autoPlay ? "&autoplay=1" : "&autoplay=0";
	    	
	    	if(currentTabId.indexOf("vimeo")!=-1) {
    			embedURL = "//player.vimeo.com/video/"+id+"?badge=0&autopause=0&player_id=0"+autoPlayString;
    		} else if(currentTabId.indexOf("youtube-channel-playlists")!=-1) {
	    		embedURL = "//www.youtube.com/embed?listType=playlist&list="+id+"&rel=0"+autoPlayString;
	    	} else {
	    		embedURL = "//www.youtube.com/embed/"+id+"?listType=playlist&list="+playlistId+"&rel=0"+autoPlayString;
	    	}

    		$youmaxInlineContainer.html('<div class="fluid-width-video-wrapper" style="padding-top:'+(settings.aspectRatio*100)+'%;"><iframe class="yl-inline-iframe" src="'+embedURL+'" frameborder="0" allowfullscreen></iframe></div>').show();

    		$('html, body').animate({scrollTop: $youmaxInlineContainer.offset().top - 150},'slow');

    	});

    	if(settings.displayFirstVideoOnLoad) {
    		$youmaxPro.find(".yl-focus:first").click();
    	}

    },

    registerLinkToYouTube = function($youmaxPro) {

    	$youmaxPro.find(".yl-focus").each(function(i,v){
    		var $focusElement = $(v);
    		var link = $focusElement.data("link");
    		$focusElement.wrap("<a href='"+link+"' target='_blank'></a>");
    	});

    },

	popularFirstComparator = function(a,b) {
		return b.views - a.views;
	},

	latestFirstComparator = function(a,b) {
		return (new Date(b.date).getTime()) - (new Date(a.date).getTime());
	},	

	handleSortOrders = function($youmaxPro) {
		
		var seenVideos = [];
		
		$('#yl-sort-order').change(function() {
	        seenVideos = saveSeenVideos($youmaxPro);
			showLoader($youmaxPro);
			//not needed as list is cleared in show loader
			//clearList($youmaxPro);

			//remove search flag as sorting needs to be done
			settings.searchFlag = false;
			
			displayItems(settings.videoCache,$youmaxPro);
	        highlightSeenVideos(seenVideos,$youmaxPro);
			videoDisplayMechanism($youmaxPro);
		});

		$youmaxPro.find("#yl-sort-order").val(settings.defaultSortOrder);
	
	},

	handleGridListSwitch = function ($youmaxPro) {

		var $viewSwitch = $youmaxPro.find(".yl-switch");
		var requiredView;

		$viewSwitch.click(function(){

			requiredView = $viewSwitch.data("view");
			settings.youmaxDisplayMode = requiredView;
			$youmaxPro.removeClass().addClass("youmax-pro");
			handleYoumaxDisplay($youmaxPro);
			
			if(requiredView=="double-list") {
				$viewSwitch.find("i").removeClass("fa-bars").addClass("fa-th-large")
				$viewSwitch.data("view","grid");
			} else {
				$viewSwitch.find("i").addClass("fa-bars").removeClass("fa-th-large")
				$viewSwitch.data("view","double-list");
			}

		});

	},

	handleTabs = function ($youmaxPro) {
		$youmaxPro.on("click",".yl-tab",function() {

			var $tab = $(this);
	    	clearSettings();
	    	showLoader($youmaxPro);

	    	//add selected tab class to current tab
	    	$youmaxPro.find(".yl-tab").removeClass("yl-selected-tab");
	    	$tab.addClass("yl-selected-tab");

			displayTabItems($youmaxPro);

		});
	},

    displayTabItems = function($youmaxPro) {

    	//get selected tab and handle the tab click
		var tabId = $youmaxPro.find(".yl-selected-tab").attr("id");
    	var identifier = tabId.substring(tabId.indexOf("-",17)+1);

    	if(tabId.indexOf("youtube-channel-uploads")!=-1) {
    		getPlaylistVideos(identifier,$youmaxPro);
    	} else if(tabId.indexOf("youtube-channel-playlists")!=-1) {
    		getChannelPlaylists(identifier,$youmaxPro);
    	} else if(tabId.indexOf("youtube-playlist-videos")!=-1) {
    		getPlaylistVideos(identifier,$youmaxPro);
    	} else if(tabId.indexOf("vimeo-user-videos")!=-1) {
    		getVimeoUserVideos(identifier,$youmaxPro);
    	} 

    },

    handleSearch = function($youmaxPro) {

    	var searchText;

    	$youmaxPro.on('keyup','.yl-channel-search-input', function (e) {
			if (e.keyCode == 13) {
			
				clearSettings();	    		
	    		showLoader($youmaxPro);
				displaySearchItems($youmaxPro);
				
				return false;
			}
		});

    },

    displaySearchItems = function($youmaxPro) {

    	var searchText;

		//set search flag as sorting needs to be doen on relevance
		settings.searchFlag = true;

		searchText = $youmaxPro.find('.yl-channel-search-input').val().replace(/ /g,"%20");
    	getSearchVideos(searchText,$youmaxPro);

    },


	handleAnimations = function($youmaxPro) {

		$youmaxPro.on("mouseenter",".yl-focus",function() {
			$(this).find(".triangle-with-shadow").addClass("triangle-with-hover");
		});

		$youmaxPro.on("mouseleave",".yl-focus",function() {
			$(this).find(".triangle-with-shadow").removeClass("triangle-with-hover");
		});


		$youmaxPro.on("click",".yl-focus",function() {
			$(this).find(".yl-view-bucket").addClass("yl-view-bucket-seen");
			$(this).find(".triangle-with-shadow").removeClass("triangle-with-hover");
		});

	},

	handleLoadingMechanism = function($youmaxPro) {

		//remove first video auto load flag
		settings.displayFirstVideoOnLoad = false;

		//Load More button handler
		$youmaxPro.on('click','.yl-load-more-button', function(){

			$(this).addClass("yl-loading");

			//do not clear list during load mores
			settings.clearListOnDisplay = false;

			checkCache("next",$youmaxPro);

		});

		//Next Button Handler
		$youmaxPro.on('click','.yl-next-button', function(){

			$(this).addClass("yl-loading");

			//Clear list during load mores
			settings.clearListOnDisplay = true;

			//fade out the current items
			$youmaxPro.find(".yl-item").addClass("yl-fading");

			checkCache("next",$youmaxPro);

		});

		//Previous Button Handler
		$youmaxPro.on('click','.yl-previous-button', function(){

			$(this).addClass("yl-loading");

			//fade out the current items
			$youmaxPro.find(".yl-item").addClass("yl-fading");

			//Clear list during load mores
			settings.clearListOnDisplay = true;

			checkCache("previous",$youmaxPro);

		});


	},

	checkCache = function(direction,$youmaxPro) {

		var newCacheBlockStart, newCacheBlockEnd, videoArray, maxResults;
		maxResults = parseInt(settings.maxResults,10);

		if(direction=="previous") {

			//for previous navigation
			newCacheBlockStart = settings.currentCacheBlockStart - maxResults;
			newCacheBlockEnd = settings.currentCacheBlockStart;

			
			if(newCacheBlockStart<0) {
				newCacheBlockStart = 0;
			}

			if(newCacheBlockEnd<=0) {
				$youmaxPro.find(".yl-loading").removeClass("yl-loading");
				$youmaxPro.find(".yl-item").removeClass("yl-fading");
				return;
			}

		
		} else if(direction=="next") {

			//for next navigation
			newCacheBlockStart = settings.currentCacheBlockEnd;
			newCacheBlockEnd = newCacheBlockStart + maxResults;

			if(newCacheBlockEnd>settings.videoCache.length) {
				newCacheBlockEnd = settings.videoCache.length;
			}

			if(newCacheBlockStart>=settings.videoCache.length) {
				showMoreVideosHandler($youmaxPro);
				return;
			}			

		}

		settings.currentCacheBlockStart = newCacheBlockStart;
		settings.currentCacheBlockEnd = newCacheBlockEnd;

		videoArray = settings.videoCache.slice(newCacheBlockStart, newCacheBlockEnd);
		displayItems(videoArray,$youmaxPro);

		$youmaxPro.find(".yl-loading").removeClass("yl-loading");


	},

	showMoreVideosHandler = function($youmaxPro) {

		//do nothing if next token is not present
		if(settings.nextPageToken==null) {
			$youmaxPro.find(".yl-loading").removeClass("yl-loading");
			$youmaxPro.find(".yl-item").removeClass("yl-fading");
			return;
		}

		if(settings.searchFlag) {
			displaySearchItems($youmaxPro);
		} else {
			displayTabItems($youmaxPro);	
		}

	},

	handleYoumaxDisplay = function($youmaxPro) {

		if(settings.youmaxDisplayMode=="double-list") {
			if($youmaxPro.width()<settings.responsiveBreakpoints[0]) {
				$youmaxPro.addClass("yl-grid").removeClass("yl-double-list").removeClass("yl-list");
			}  else if($youmaxPro.width()<settings.responsiveBreakpoints[1]) {
				$youmaxPro.removeClass("yl-double-list").removeClass("yl-grid").addClass("yl-list");
			} else if($youmaxPro.width()>=settings.responsiveBreakpoints[1]) {
	    		$youmaxPro.addClass("yl-double-list").removeClass("yl-grid").removeClass("yl-list");
	    	}  
		}

		if(settings.youmaxDisplayMode=="list") {
			if($youmaxPro.width()<settings.responsiveBreakpoints[0]) {
				$youmaxPro.addClass("yl-grid");
			} else {
				$youmaxPro.removeClass("yl-grid");
			}
		}

		if(settings.youmaxDisplayMode=="grid") {
    		$youmaxPro.addClass("yl-grid");
    		if($youmaxPro.width()<settings.responsiveBreakpoints[0]) {
    			$youmaxPro.addClass("yl-1-col-grid").removeClass("yl-2-col-grid yl-3-col-grid yl-4-col-grid yl-4-col-grid");
    		} else if($youmaxPro.width()<settings.responsiveBreakpoints[1]) {
    			$youmaxPro.addClass("yl-2-col-grid").removeClass("yl-1-col-grid yl-3-col-grid yl-4-col-grid yl-5-col-grid");
    		} else if($youmaxPro.width()<settings.responsiveBreakpoints[2]) {
    			$youmaxPro.addClass("yl-3-col-grid").removeClass("yl-1-col-grid yl-2-col-grid yl-4-col-grid yl-5-col-grid");
    		} else if($youmaxPro.width()<settings.responsiveBreakpoints[3]) {
    			$youmaxPro.addClass("yl-4-col-grid").removeClass("yl-1-col-grid yl-2-col-grid yl-3-col-grid yl-5-col-grid");
    		} else {
    			$youmaxPro.addClass("yl-5-col-grid").removeClass("yl-1-col-grid yl-2-col-grid yl-3-col-grid yl-4-col-grid");
    		}

    		//set thumbnail type - simple|full
	    	if(settings.gridThumbnailType=="simple") {
	    		$youmaxPro.addClass("yl-simple-thumbnails")
	    	} else if(settings.gridThumbnailType=="neat") {
	    		$youmaxPro.addClass("yl-neat-thumbnails")
	    	}
    	}

    	//set callout View - grid|list|double-list
    	if(settings.calloutType=="list") {
    		$youmaxPro.addClass("yl-list-callouts");
    	} else if(settings.calloutType=="grid") {
    		$youmaxPro.addClass("yl-grid-callouts");
    	} else if(settings.calloutType=="double-list") {
    		$youmaxPro.addClass("yl-double-list-callouts");
    	} 

	},

	handleResize = function($youmaxPro){

		$(window).resize(function() {
			handleYoumaxDisplay($youmaxPro);
		});

	},

	handleCallouts = function($youmaxPro) {

		var calloutList = settings.callouts;
		var $calloutContainer = $youmaxPro.find(".yl-callout-container");
		var calloutImageHTML, calloutTextHTML, calloutBuyButtonHTML, calloutPreviewButtonHTML;

		if(null==calloutList || calloutList.length==0) {
			return;
		}

		for(var i=0; i<calloutList.length; i++) {
			
			calloutImageHTML = "<a target='_blank' class='yl-callout-buy-link' href='"+calloutList[i].buyButtonLink+"'><img src='"+calloutList[i].image+"'></a>";

			calloutTextHTML = "<div class='yl-callout-title'>"+calloutList[i].title+"</div><div class='yl-callout-description'>"+calloutList[i].description+"</div>";

			calloutBuyButtonHTML = "<a target='_blank' class='yl-callout-buy-link' href='"+calloutList[i].buyButtonLink+"'><div class='yl-callout-buy-button'>"+calloutList[i].buyButtonText+"</div></a>";

			calloutPreviewButtonHTML = "<a target='_blank' class='yl-callout-preview-link' href='"+calloutList[i].previewButtonLink+"'><div class='yl-callout-preview-button' title='preview'><i class='fa "+calloutList[i].previewButtonIcon+"'></i></div></a>";

			$calloutContainer.append("<div class='yl-callout'><div class='yl-callout-left'>"+calloutImageHTML+"</div><div class='yl-callout-right'>"+calloutTextHTML+calloutPreviewButtonHTML+calloutBuyButtonHTML+"</div></div>");
		}
		

	},

	handleOffers = function($youmaxPro) {

		if(null!=settings.offerLink) {
			//offer present
			$youmaxPro.addClass("yl-offer-enabled");
			$youmaxPro.find(".yl-header").append("<a target='_blank' href='"+settings.offerLink+"'><div class='yl-offer'><div class='yl-offer-title'>"+settings.offerTitle+"</div><div class='yl-offer-description'>"+settings.offerDescription+"</div><div class='yl-offer-button'>"+settings.offerButtonText+"</div></div></a>");
		}

	},

	showLoader = function($youmaxPro) {

		$youmaxPro.find(".yl-inline-container").empty();
		$youmaxPro.find(".yl-item-container").empty().append("<div class='yl-loader'>Youmax<br><span>is loading..</span></div>");
	},


    saveSeenVideos = function($youmaxPro) {
        
        var seenVideos = [];

        $youmaxPro.find(".yl-seen").each(function(){
            seenVideos.push($(this).attr("id"));
        });

        return seenVideos;
    },

    highlightSeenVideos = function(seenVideos,$youmaxPro) {
        
        for(var k=seenVideos.length;k>=0;k--) {
            $youmaxPro.find("#"+seenVideos[k]).addClass("yl-seen");
        }
        
    },

    convertViews = function(views) {
    			
		var commaSeparatedViews = "";
		views = ""+views;
		
		while(views.length>0) {
			if(views.length > 3) {
				commaSeparatedViews = ","+views.substring(views.length-3)+commaSeparatedViews;
				views = views.substring(0,views.length-3);
			} else {
				commaSeparatedViews = views + commaSeparatedViews;
				break;
			}
		}
		
		return commaSeparatedViews;
    },

    convertDate = convertToSpecificDate,

	convertToSpecificDate = function(date) {
		//date incoming format "2016-08-26T21:48:14.000Z"
		var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
		var innerDate = date.substring(0,date.indexOf("T"));
		var splitDate = innerDate.split("-");
		//var returnDate = splitDate[2]+"-"+months[splitDate[1]-1]+"-"+splitDate[0];
		var returnDate = "<div class='yl-date'>"+splitDate[2]+"</div><div class='yl-month'>"+months[splitDate[1]-1]+"</div><div class='yl-year'>"+splitDate[0]+"</div>";

		//date outgoing format "26 Aug 2016"
		return returnDate;
	},

	//utility function to display time
	convertDuration = function(videoDuration) {
		
		var duration,returnDuration;
		videoDuration = videoDuration.replace('PT','').replace('S','').replace('M',':').replace('H',':');
		
		var videoDurationSplit = videoDuration.split(':');
		returnDuration = videoDurationSplit[0];
		for(var i=1; i<videoDurationSplit.length; i++) {
			duration = videoDurationSplit[i];
			if(duration=="") {
				returnDuration+=":00";
			} else {
				duration = parseInt(duration,10);
				if(duration<10) {
					returnDuration+=":0"+duration;
				} else {
					returnDuration+=":"+duration;
				}
			}
		}
		if(videoDurationSplit.length==1) {
			returnDuration="0:"+returnDuration;
		}
		return returnDuration;
		
	},

	//utility function to display time
	convertVimeoDuration = function(videoDuration) {

		var hours,min,sec;
		min = parseInt(videoDuration/60,10);
		sec = videoDuration - (min*60);
		
		if(sec<10) {
			sec="0"+sec;
		}
		
		if(min>=60) {
			hours = parseInt(min/60,10);
			min = min - (hours*60);
			
			if(min<10) {
				min="0"+min;
			}
			
			return hours+":"+min+":"+sec;
		} else {
			return min+":"+sec;
		}
	
	},


	convertToRelativeDate = function (timestamp) {
	
		var dateDiffMS, dateDiffHR, dateDiffDY, dateDiffMH, dateDiffYR;
		if(null==timestamp||timestamp==""||timestamp=="undefined")
			return "?";
		
		dateDiffMS = Math.abs(new Date() - new Date(timestamp));
		
		dateDiffHR = dateDiffMS/1000/60/60;
		if(dateDiffHR>24) {
			dateDiffDY = dateDiffHR/24;
			if(dateDiffDY>30) {
				dateDiffMH = dateDiffDY/30;
				if(dateDiffMH>12) {
					dateDiffYR = dateDiffMH/12;
					dateDiffYR = Math.round(dateDiffYR);
					if(dateDiffYR<=1) {
						return dateDiffYR+" <span>year ago</span>";
					} else {
						return dateDiffYR+" <span>years ago</span>";
					}						
				} else {
					dateDiffMH = Math.round(dateDiffMH);
					if(dateDiffMH<=1) {
						return dateDiffMH+" <span>month ago</span>";
					} else {
						return dateDiffMH+" <span>months ago</span>";
					}						
				}
			} else {
				dateDiffDY = Math.round(dateDiffDY);
				if(dateDiffDY<=1) {
					return dateDiffDY+" <span>day ago</span>";
				} else {
					return dateDiffDY+" <span>days ago</span>";
				}
			}
		} else {
			dateDiffHR = Math.round(dateDiffHR);
			if(dateDiffHR<1) {
				return youmax_translator_text.now;
			}else if(dateDiffHR==1) {
				return dateDiffHR+" <span>hour ago</span>";
			} else {
				return dateDiffHR+" <span>hours ago</span>";
			}
		}		

	
	},

	processDescription = function(description) {
	
		var spotArray,replaceLink;

		description = description.replace(/"/g, "'");
		
		spotArray = description.match(/(http(s)*:\/\/|www\.).+?(\s|\n|$)/g);

		if(null!=spotArray) {
			for(var i=0;i<spotArray.length;i++) {
				spotArray[i] = spotArray[i].trim();
				description = description.replace(spotArray[i],"~~"+i+"~~");
			}

			for(var i=0;i<spotArray.length;i++) {

				if(spotArray[i].indexOf("www.")==0) {
					replaceLink = "http://"+spotArray[i];
				} else {
					replaceLink = spotArray[i];
				}
				description = description.replace("~~"+i+"~~","<a target='_blank' href='"+replaceLink+"' class='famax-link'>"+spotArray[i]+"</a>");
			}
		}
		
		return description;					
	};


	$.fn.youmaxPro=function(options) {

		var $youmaxPro=this;
		settings = $.extend(settings,options);

		init($youmaxPro);
		doOptions($youmaxPro);
		initHeader($youmaxPro);
		handleTabs($youmaxPro);
		createTabs($youmaxPro);
		handleSearch($youmaxPro);
		handleSortOrders($youmaxPro);
		handleGridListSwitch($youmaxPro);
		handleAnimations($youmaxPro);
		handleLoadingMechanism($youmaxPro);
		handleResize($youmaxPro);
		handleCallouts($youmaxPro);
		handleOffers($youmaxPro);
		
		return this;

	}


})(jQuery);