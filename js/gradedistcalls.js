function GradeDist(){
    var urls = {
	dt : {
	    JSON : "json"
	},
	
	t  : {
	    GET : "GET",
	    POST: "POST"
	},
	getInst : "php/getInst",
	getInstInDept : "php/getInstByDept.php",
	getIID : "php/getIID.php",
	getDept: "php/getDepts.php",
	getDID : "php/getDID.php",
	getClasses: "php/getClasses.php",
	getPartialInst: "php/getInstPartial.php"
    };

    this.getPartialInst = function(partname, did){
	var someinst = [];
	did = this.getDID(did);
	console.log(partname);
	$.ajax({
	    type: urls.t.GET,
	    url: urls.getPartialInst,
	    data: {partial : partname,did: did},
	    dataType: urls.dt.JSON,
	    success: function(data){
		console.log(data);
		$.each(data, function(index,element){
		    someinst.push(element.name);
		});
	    }
	});					
	return someinst;
    };

    this.getAllInst = function(){
	if(this.allinst.length > 0) return this.allinst;
	var allinst = [];
	$.ajax({
	    type: urls.t.POST,
	    url: urls.getInst,
	    dataType: urls.dt.JSON,
	    success: function(data){
		$.each(data, function(index, element){
		    allinst.push(element.name);
		});
	    }
	});
	data.allinst = allinst;
	return this.allinst;
    };
    
    this.getInstInDept = function(did){
	var instsindept = [];
	$.ajax({
            type: urls.t.GET,
            url:  urls.getInstInDept,
            contentType: urls.dt.JSON,
            data: {dept:did},
            success: function (insts){
                $.each(insts, function(index, element){
                    instsindept.push(element['name']);
                });
            }
        });
	return instsindept;
    };

    this.getIID = function(name){
	var iid = -1;
	$.ajax({
	    type:urls.t.GET,
	    url: urls.getIID,
	    async: false,
	    data:$('#form').serialize(),
	    contentType:urls.dt.JSON,
	    success: function(data){
		if(data.length > 0){
		    iid = data[0]['iid'];
		}
	    }
	});
	return iid;
    };

    this.getDeptNames = function(){
	var deptlist = [];
	$.ajax({
	    type: urls.t.POST,
	    url: urls.getDept,
	    async: false,
	    dataType: urls.dt.JSON,
	    success:function(data){
		$.each(data, function(index, element){
		    deptlist.push(element.NameShort);		    
		});
	    }
	});
	return deptlist;
    };
    
    this.getDID = function(nameShort){
	var did = -1;
	$.ajax({
            type: urls.t.GET,
            url: urls.getDID,
	    async: false,
            contentType: urls.dt.JSON,
            data: {dept:nameShort},
            success: function(data){
                if(data.length == 0){
                    return null;
                }else{
		    did = data[0]['did'];
		}
	    }
	});
	return did;
    };
    
    this.query = function(params){
	var result;
	$.ajax({
	    type:urls.t.GET,
	    async: false,
	    url:urls.getClasses,
	    contentType:urls.dt.JSON,
	    data: params,
	    success: function(data){
		if(data.length != 0){
		    result=data;
		}
	    }
	});
	return result;
    };
    
}
