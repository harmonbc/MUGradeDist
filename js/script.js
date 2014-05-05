/**Global gauge object*/
var gage = new JustGage({
    id:'avggpagage',
    value:0.0,
    min:0.0,
    max:4.0,
    title:'Average Gpa',
    levelColorsGradient: false,
    levelColors: [ "#FF1100", "#EEFF00", "#11FF00"],
    counter: true,
    label: 'GPA'
});

/**Container to hold the rdata*/
var data = {
    manager : new GradeDist(),
    gage    : gage	
};


/**This function is called when the page finishes loading
 * when the user first visits the site*/
$(document).ready( function(){	
    "use strict";
    //Make a call to initialize all form data
    setPageElements();
    
    //Set the form.submit options
    $('#form').submit(function(f){
	ga('send','event','search');
	//Disable search button during search
	$('#formsubmit').attr('disabled','disabled');
	f.preventDefault();
	var ids = validateform();
	if( ids != null) searchandpopulate(ids,data); 
    });
    
    //Set the autocomplete for the department
    $('#dept').autocomplete({
	source: data.manager.getDeptNames(),
	delay : 0
    });
    
    //This is the prompt box at the bottom,
    //This line removes the box when it is clicked on
    $('#directions').click(function(){
	$('#directions').remove();
	$('#comparebox').css('height',0);
    });
    
    //When a key is pressed in the instructor name box
    //trigger a event to attempt to autocomplete the rest
    //of the entry
    $('#inst').keyup(function(){
	var dept = $('#dept').val();
	var inst = $('#inst').val();
	
	if((inst.length > 2)){
	    console.log('Dept is empty');
	    $('#inst').autocomplete({
		source: data.manager.getPartialInst(inst,dept),
		delay:0
	    });
	}
    });
});


/**This method calls the datamanager to get a list of potential matches*/
function getPartialInst(){
    var did = data.manager.getDID($('#dept').val());
    $('#inst').autocomplete({
	source: (data.manager.getInstPartial($('#inst').val(), did)).slice(0,10),
	delay: 0
    });
}

/**Initializes the elements on the bar*/
function setPageElements(){
    //Creating the slider bar
    //Change this to dynamic
    $('#rangeslider').slider({
	range: true,
	max: 2014,
	min: 2000,
	values: [2007, 2014],
	slide: function( event, ui){
	    $('#from').html(ui.values[0]);
	    $('#to').html(ui.values[1]);
	}
    });
    $('#searchresults').tablesorter(); 
}

/**Fetches the year range from bar*/
function fetchyears(){
    var years = [];
    years['from'] = $('#from').html();
    years['to'] = $('#to').html();
    return years;
}

//Validates form data and fetches id nums if necessary
function validateform(){
    var ids = [];
    ids['iid'] = -1;
    ids['did'] = -1;
    
    if($('#dept').val() != ""){
	ids['did'] = data.manager.getDID($('#dept').val());
	//Should not handle wrong department
	if(ids['did'] == null){}//Throw Error
    }
    
    if($('#inst').val() != ""){
        ga('send','event','instquery',$('#inst').val());
        //Will do best effort for the Instructor ID
	ids['iid'] = data.manager.getIID($('#inst').val());
    }
    
    return ids;
}


/**This is the longest method, this is what happens when the
 * search button is clicked, it sends off data, and then populates
 * the sortable data with the results*/
function searchandpopulate(ids,data){
    years = fetchyears();
    //Get data from the form and send it to the datamanager query function
    result = data.manager.query($('#form').serialize()+
				'&from='+years['from']+
				'&to='+years['to']+
				'&iid='+ids['iid']+
				'&did='+ids['did']+
				'&sem='+$('#sem').val()
			       );
    var appendthis = '';
    var sumstudents= 0;
    var curgpas = 0;
    var count = 0;
    
    //For each line, add the appropreate tags, and do the math to calculate
    //the GPA
    $.each(result, function(index, e){
	line = processreturnrow(e);	
	appendthis  += line['appendthis'];
	
	if(!isNaN(line['weightedavg'])){
	    sumstudents += line['sumstudents'];
	    curgpas += line['weightedavg'];
	    count += 1;
	}
    });
    
    var res = $("#searchresults tbody");
    //Set the data
    res.html("");
    res.html(appendthis);
    
    //Set the data in the result box, and give the gauge the
    //new average gpa
    var result = (curgpas/((.0+sumstudents))).toFixed(2);
    if(isNaN(result)){result = 0;}
    data.gage.refresh(result);
    
    //Set the actions to be taken on the new class rows we just added
    setclassrows();
    $('#searchresults').trigger('update');
    var data = count+' results';
    
    if(curgpas.length == 500){
	data = data + ('<br/><em>(500 is the limit, please limit your result)</em>');
    }
    //Let the user know how many results came back
    $('#resultcount').html(data);
    //Reenable search
    $('#formsubmit').removeAttr('disabled');
}

/**Adds action to class row*/
function setclassrows(){
    $('.classrow').click(function(){
    	//If this row has been highlighted unselect it
	if($(this).hasClass('selected')){
	    ga('send','event','compare','remove','frommain');
	    $(this).removeClass('selected');
	    $('#comp'+this.id).remove();
           $('#searchresults').css('margin-bottom', function (index, curValue) {
                 return parseInt(curValue, 10) - 20 + 'px';
            });
	    $(this).find('td').each(function(){
                $(this).css('background-color','#FFFFFF');
            });

	}else{
	    ga('send','event','compare','add','frommain');
            $('#searchresults').css('margin-bottom', function (index, curValue) {
                 return parseInt(curValue, 10) + 20 + 'px';
             });
	    $(this).find('td').each(function(){
		$(this).css('background-color','#C8C8C8');
		});	    
	    //Get the more detailed information about the class and place it
	    //Into the bottom bar
	    $(this).addClass('selected');
	    var sem = [];
	    sem['10'] = 'Fall';
	    sem['20'] = 'Spring';
	    sem['30'] = 'Summer';

	   $.ajax({
		type: "POST",
		url: "php/getGrades.php",
		data: "cid="+$(this).attr('id'),
		datatype: "json",
		success: function(grades){
		    var c = grades[0];
		    //make this prettier
			var details = '<tr id="comp'+c['cid']+'" class="gradecompare">'+
			'<td>'+c['NameShort']+' '+c['number']+' '+c['Section']+'</td>'+
			'<td>'+c['name']+'</td>'+
			'<td>'+c['Year']+'</td>'+
			'<td>'+sem[c['Semester']]+'</td>'+
			'<td>'+c['ap']+'</td>'+
			'<td>'+c['a']+'</td>'+
			'<td>'+c['am']+'</td>'+
			'<td>'+c['bp']+'</td>'+
			'<td>'+c['b']+'</td>'+
			'<td>'+c['bm']+'</td>'+
			'<td>'+c['cp']+'</td>'+
			'<td>'+c['c']+'</td>'+
			'<td>'+c['cm']+'</td>'+
			'<td>'+c['dp']+'</td>'+
			'<td>'+c['d']+'</td>'+
			'<td>'+c['dm']+'</td>'+
			'<td>'+c['f']+'</td>'+
			'<td>'+c['x']+'</td>'+
			'<td>'+c['y']+'</td>'+
			'<td>'+c['w']+'</td>'+
			'<td>'+c['wp']+'</td>'+
			'<td>'+c['wf']+'</td>'+
			'<td>'+c['total']+'</td>'+
			'<td>'+c['finished']+'</td>'+
			'<td>'+c['avggpa']+'</td>'+
			'<td>'+c['Title']+'</td>'+
			'</tr>';
		    $('#gradeboxes tbody').append(details);
		    $('#comp'+c['cid']).click(function(){
			$('#'+this.id.substring(4)).removeClass('selected');
			$(this).remove();
			$('#'+this.id.substring(4)).find('td').each(function(){
                		$(this).css('background-color','#FFFFFF');
                        });
	                $('#searchresults').css('margin-bottom', function (index, curValue) {
                 		return parseInt(curValue, 10) + 20 + 'px';
                        });

			ga('send','event','compare','remove','frombottom');
		    });
		}
	    });
	}
    });
}


function processreturnrow(e){
    var returnset = [];
    
    var namesh = e['NameShort'];
    var sec = e['Section'];
    var year = e['Year'];
    var avggpa = e['avggpa'];
    var num = e['number'];
    var inst = e['name'];
    var title = e['Title'];
    var cid = e['cid'];
    
    if(e['avggpa'] > 0){
	returnset['weightedavg'] = e['avggpa']*e['finished'];
 	returnset['sumstudents'] = e['finished'];
	returnset['avggpa'] = e['avggpa'];
    }else{
	returnset['avggpa'] = 'Pass/Fail';
    }
    
    returnset['appendthis'] = '<tr id="'+cid+'" class="classrow"><td>'+
	e['NameShort']+'</td><td>'+
	e['number']+'</td><td>'+
	e['Section']+'</td><td>'+
	e['Year']+'</td><td>'+
	e['name']+'</td><td>'+
	e['Title']+'</td><td>'+
	returnset['avggpa']+'</td><td>'+
	'</tr>';
    return returnset;
}
