$(document).ready( function(){
	
	"use strict";
	//Creating the slider bar
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

    //Enable table sortering
    $('#searchresults').tablesorter(); 
    var curresults = [];
    //Create the gage
    var gage = new JustGage({
	id:'gradegage',
        value:0.0,
	min:0.0,
	max:4.0,
	title:'Average Gpa',
	levelColorsGradient: false,
	levelColors: [ "#FF1100", "#EEFF00", "#11FF00"],
	counter: true,
	label: 'GPA'
    });

    //Set the form.submit options
    $('#form').submit(function(f){
	ga('send','event','button','click','query');
	curresults = [];
	f.preventDefault();
	var curgpas=[];	
	var from = $('#from').html();
	var to = $('#to').html();
	var res = $('#searchresults tbody');
	var appendthis = '';	
	var did = -1;
	var iid = -1;

	//Validation and Stuff
	//First we get the department ID if it is needed
	if($('#dept').val() != ""){
		ga('send','event','deptquery',$('#dept').val());
		console.log("Department Detected");
		$.ajax({
		    type:'GET',
		    url:'php/getDID.php',
		    contentType:'application/json',
		    data:$('#form').serialize(),
		    async: false,
		    success: function(data){
			if(data.length > 0){
				$("#depthelp").html("");
				$("#depthelp").removeClass("error");
		    		did = data[0]['did'];
				console.log(did);
			}else{
				//Will error cannot search with invalid dept
				$("#depthelp").html("Invalid Department");
				$("#depthelp").addClass("error");
				return;
			}
		  }
	   });
	}

	if($('#inst').val() != ""){

                ga('send','event','instquery',$('#inst').val());

		$.ajax({
			type:'GET',
			url:'php/getIID.php',
			async: false,
			data:$('#form').serialize(),
			contentType:'application/json',
			success: function(data){
				if(data.length > 0){
				    iid = data[0]['iid'];
				}
			}
		});
	}

	ga('send','pageview','/php/getClasses.php');
	$.ajax({
	    type:'GET',
	    url:'php/getClasses.php',
	    contentType:'application/json',
	    data: $('#form').serialize()+'&from='+from+'&to='+to+'&iid='+iid+'&did='+did,
	    success: function(data){
		
		var i=0;
		var sumstudents=0;

		$.each(data, function(index, e){
		    var namesh = e['NameShort'];
		    var sec = e['Section'];
		    var year = e['Year'];
		    var avggpa = e['avggpa'];
		    var num = e['number'];
		    var inst = e['name'];
		    var title = e['Title'];
		    var cid = e['cid'];

		    if(e['avggpa'] > 0){
		    	curgpas[i] = e['avggpa']*e['finished'];
 		    	sumstudents+=e['finished'];
		    }else{
			i--;
			avggpa = 'Pass/Fail';
		    }

		    appendthis = appendthis+'<tr id="'+cid+'" class="classrow"><td>'+
			namesh+'</td><td>'+
			num+'</td><td>'+
			sec+'</td><td>'+
			year+'</td><td>'+
			inst+'</td><td>'+
			title+'</td><td>'+
			avggpa+'</td><td>'+
			'</tr>';
		    i++;
		});

		res.html("");
		res.html(appendthis);
		var sum =0;
		for(var i=0; i<curgpas.length;i++){
			sum+= curgpas[i];
		}
		console.log(sum+'---'+sumstudents);
		var result = (sum/sumstudents).toFixed(2);
		if(isNaN(result)){result = 0;}
		gage.refresh(result);

		$('#searchresults').trigger('update');
		var data = curgpas.length+' results';
		if(curgpas.length == 500){
			data = data + ('<br/><em>(500 is the limit, please limit your result)</em>');
		}
		$('#resultcount').html(data);


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
	});
	
	var alldepts = [];
	var somedepts = [];
	var allinst = [];
	var someinst = [];
	var someclass = [];
	
	$.ajax({
	    type: "POST",
	    url: "php/getDepts.php",
	    dataType: "json",
	    success: function(data){
		$.each(data, function(index, element){
		    alldepts.push(element.NameShort);
		});
		$('#dept').autocomplete({
		    source: alldepts,
		    delay: 0
		});
	    }
	});
	
	$.ajax({
	    type: "POST",
	    url: "php/getInst.php",
	    dataType: "json",
	    success: function(data){
		$.each(data, function(index, element){
		    allinst.push(element.name);
		});

		$('#inst').autocomplete({
		    source: allinst,
		    delay:0
		});
	    }
	});
	
	$('#dept').blur( function(){
	    console.log("dept blur");
	    var value = $('#dept').val();
	    if ($.inArray(value, alldepts) > -1){
		$.ajax({
		    type: 'GET',
		    url: 'php/getDID.php',
		    contentType: 'application/json',
		    data: {dept:value},
		    success: function(data){
			if(data.length == 0){
				alert("Invalid Department");
				return;
			}
			console.log(data);

	                $.ajax({
         	           type: 'GET',
                	    url:  'php/getInstByDept.php',
	                    contentType: 'application/json',
	                    data: {'dept':data[0]['did']},
	                    success: function (insts){
	                        someinst = [];
	                        $.each(insts, function(index, element){
	                            someinst.push(element['name']);
        	                });
	                        $('#inst').autocomplete({
	                            source:someinst,
	                            delay:0
	                        });
                    		}
                	});	
		   }
		});
		}
	});
    });
});

