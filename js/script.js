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
var data = {
	manager : new GradeDist(),
	gage    : gage	
};

$(document).ready( function(){	
    "use strict";
     console.log('Building Doc');
    setPageElements();

    //Set the form.submit options
    $('#form').submit(function(f){
	ga('send','event','search');
	f.preventDefault();
	var ids = validateform();
	if( ids != null) searchandpopulate(ids,data); 
    });

    $('#dept').autocomplete({
	source: data.manager.getDeptNames(),
	delay : 0
    });

    $('#directions').click(function(){

		$('#directions').remove();
		$('#comparebox').css('height',0);
	});    
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
    
    $('#dept').blur( function(){
    });

    console.log('Ready Function Complete');
});

function getPartialInst(){
	var did = data.manager.getDID($('#dept').val());
	$('#inst').autocomplete({
		source: (data.manager.getInstPartial($('#inst').val(), did)).slice(0,10),
		delay: 0
	});
}

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
    //Add gauge
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
	if(ids['did'] == null) return null;
    }
    
    if($('#inst').val() != ""){
        ga('send','event','instquery',$('#inst').val());
	ids['iid'] = data.manager.getIID($('#inst').val());
    }

    return ids;
}


function searchandpopulate(ids,data){
    years = fetchyears();
    result = data.manager.query($('#form').serialize()+
			    '&from='+years['from']+
			    '&to='+years['to']+
			    '&iid='+ids['iid']+
			    '&did='+ids['did']
			   );
    var appendthis = '';
    var sumstudents= 0;
    var curgpas = 0;
    var count = 0;
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
    
    var result = (curgpas/((.0+sumstudents))).toFixed(2);
    if(isNaN(result)){result = 0;}
    data.gage.refresh(result);

    setclassrows();
    $('#searchresults').trigger('update');
    var data = count+' results';

    if(curgpas.length == 500){
	data = data + ('<br/><em>(500 is the limit, please limit your result)</em>');
    }
    $('#resultcount').html(data);
}

/**Adds action to class row*/
function setclassrows(){
    $('.classrow').click(function(){
	if($(this).hasClass('selected')){
	    ga('send','event','compare','remove','frommain');
	    $(this).removeClass('selected');
	    $('#comp'+this.id).remove();	
	}else{
	    ga('send','event','compare','add','frommain');
	    $(this).addClass('selected');
	    $.ajax({
		type: "POST",
		url: "php/getGrades.php",
		data: "cid="+$(this).attr('id'),
		datatype: "json",
		success: function(grades){
		    var c = grades[0];
		    //make this prettier
			var details = '<tr id="comp'+c['cid']+'" class="gradecompare">'+
			'<td>'+c['NameShort']+'</td>'+
			'<td>'+c['number']+'</td>'+
			'<td>'+c['Section']+'</td>'+
			'<td>'+c['Year']+'</td>'+
			'<td>'+c['Semester']+'</td>'+
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
