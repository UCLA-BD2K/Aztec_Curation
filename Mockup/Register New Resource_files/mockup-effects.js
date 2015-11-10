var main = function(){
var buttonids = ["#resourcesbtn",
				"#publicationbtn",
				"#linkbtn",
				"#licensebtn",
				"#resourcetypebtn",
				"#biobtn",
				"#authorbtn",
				"#filebtn",
				"#toolbtn",
				"#dependencybtn",
				"#tagsbtn",
				"#maintainbtn"];
var faPlusids = ["#resourceShow",
				"#pubShow",
				"#linkShow",
				"#licenseShow",
				"#resourceTypeShow",
				"#bioShow",
				"#authorShow",
				"#fileShow",
				"#toolShow",
				"#dependencyShow",
				"#tagShow",
				"#maintainerShow"];
var divIDs = ["#resourceIntro",
			  "#pub",
			  "#lnk",
			  "#lns",
			  "#rT",
			  "#bd",
			  "#ai",
			  "#fT",
			  "#tls",
			  "#dpndncy",
			  "#tgs",
			  "#mtn"];

//Resource Styling
//var i = 0=
$.each(buttonids, function(i,val){
$(buttonids[i]).click(function(){
$(divIDs[i]).slideUp( "slow", function() {
    $(faPlusids[i]).css('visibility','visible');
    var level = Math.floor((100/12)*(i+1));
    var unit = "%"
    var quote = '\''
    var levelcss = quote+level+unit+quote;
    console.log(levelcss);
    $("#progBar").css('width', '10%');
  }); 
});

$(faPlusids[i]).click(function(){
$(divIDs[i]).slideDown( "slow", function() {
    $(faPlusids[i]).css('visibility','hidden');
  });
});	


});


}


$(document).ready(main);