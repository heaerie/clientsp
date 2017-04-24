var ns= require("./heaeriedatatype.json" );
var sjson= require("./loginApi.json" );
var lgns = require("./logindatatype.json");
lgns.forEach(function(lgnsObj) {
	ns.push(lgnsObj);
});

expandDataType = function(sjson, ns) {
	var rtObj= new Array();
	sjson.forEach( function(sjsonObj) {
		var rpObj= {};
		var found= false;
		var dataTypeArr=  sjsonObj.dataType.split("."); 
		var dataObj={};
			if (dataTypeArr.length == 3) {
				dataObj= {
				"namespace" :  dataTypeArr[0]
				, "package" :  dataTypeArr[1]
				, "dataType" : dataTypeArr[2]
				};
			} else if (dataTypeArr.length ==2 ) {
				dataObj= {
				"namespace" :  "heaerie"
				, "package" :  dataTypeArr[0]
				, "dataType" : dataTypeArr[1]
				};
			} else {
				dataObj= {
				"namespace" :  "heaerie"
				, "package" :   "system"
				, "dataType" : dataTypeArr[0]
				};
			}
			if(hasChild(sjsonObj)) {
				var rtData	=	expandDataType(sjsonObj.childs, ns );
				rpObj=copyObject(sjsonObj,sjsonObj);
				rpObj.childs = rtData;
				found = true;
			} else {
				ns.forEach(function(nameSpaceObj) {
//				console.log(" nameSpaceObj.name  = %s , dataObj.namespace = %s ", nameSpaceObj.name, dataObj.namespace );
				if (nameSpaceObj.name == dataObj.namespace ) {
					if ( hasChild( nameSpaceObj)) {
							nameSpaceObj.childs.forEach( function(packageObj) {
								if ( dataObj.package  ==  packageObj.name )  {
									if( hasChild(packageObj)) {
										packageObj.childs.forEach( function(dataType) {
											if(dataType.name == dataObj.dataType) {
												rpObj=copyObject(sjsonObj,dataType);
												found = true;
											}
										});
									}
								}
							});
						}
					}
				});
			}
			if (found) {
				rtObj.push(rpObj);
			} else {
				rtObj.push(sjsonObj);
			}
		});
	return rtObj;
}

copyObject=function(sjsonObj,dataType) {
var obj =  {
	"group" :  sjsonObj.group
	,"name" :  sjsonObj.name
	,"label" :  sjsonObj.label
	,"task" :  sjsonObj.task
	,"desc" :  sjsonObj.desc
	,"htmlType" :  dataType.htmlType
	,"entitle" :  sjsonObj.entitle
	,"enttlname" :  sjsonObj.enttlname
	,"mndf" :  sjsonObj.mndf
	,"dataType" :  dataType.name
	,"cclass" :  dataType.cclass
	,"parent" :  sjsonObj.parent
	,"parentHtmlType" :  sjsonObj.parentHtmlType
	,"validate" :  dataType.validate
	,"dflt" :  sjsonObj.dflt
	,"min" :  dataType.min
	,"max" :  dataType.max
	,"tips" :  sjsonObj.tips
	,"onkeyup" : 'onKeyUp(this);'
	,"onchange" : 'onChange(this);'
	,"onkeydown" : 'onKeyDown(this);'
	,"onkeypress" : 'onKeyPress(this);'
	,"onclick" : 'onClick(this);'
	,"onblure" : 'onBlure(this);'
	,"listVal" :  dataType.listVal
	,"help" :  sjsonObj.help
	,"helpLink" :  dataType.helpLink
	,"xml" :  sjsonObj.xml
	,"xmlname" :  sjsonObj.xmlname
	,"Xpath" :  sjsonObj.Xpath
	,"maxCol" :  sjsonObj.maxCol
	,"col" :  sjsonObj.col
	,"childs" : []
	};
	if (hasChild(dataType)) {
		obj.childs.push(dataType.childs);
	}
	return obj;
}

hasChild=function(fieldObj) {
	if( Array.isArray(fieldObj.childs)) {
		if( fieldObj.childs.length == 0 ) {
			return false;
		} else {
			return true;
		}
	} else {
		return false;
	}
}

var exapandSchema=expandDataType(sjson, ns) ;
validateUssField= function(field) {

}

alert=function(str) {
	console.log(str);
}
//TODO: need to handle the structure inside structure.
// type struct node {
//       test node 
//        };

getJsonKeys = function(json)  {
	var keys = new Array();
	for(var key in json) {
		keys.push(key);	
	}
	return keys;
}

getJsonKeysFromSchema = function(sjson) {
	var skeys = new Array();
	sjson.forEach(function(sobj) {
		skeys.push(sobj.name)
	});
	return skeys;
}

hasValidKeys  = function(recKeys, recSchKeys) {
	var rtObj = null;
	recKeys.forEach(function(key) {
		if(!recSchKeys.some(function (schKey) { return schKey == key; })) {
			rtObj = new Error("Unkown Key: " + key + " is not defined on Schema Keys " + JSON.stringify(recSchKeys));
		}
	});
	return rtObj;

}

hasParent = function(schObj) {
	return (["PAGE", "COLLECTIONS", "CONTAINER"].some(function(elem) { console.log(elem + "==" + schObj.dataType); return elem==schObj.dataType;}));
};


valWithSch = function (rec, recSch) {

/* is valid Schema ?*/
/* is valid Json ?*/
//	console.error("rec= " + JSON.stringify(rec));
//	console.error("recSch= " + JSON.stringify(recSch));
	var recSchKeys = getJsonKeysFromSchema(recSch);
	for (var r=0; r<rec.length; r++) {
		for (var s =0; s<recSch.length; s++) {

		var value=rec[r][recSch[s].name];
		if (hasParent(recSch[s])) {
			if (typeof recSch[s].childs != "Array") {
				recSch[s].childs=new Array();
			}
			if (typeof value != "Array") {
				return new Error("Expected Array Obj for " + recSch[s].name);
			}
			
			var err=valWithSch(value, recSch[s].childs);
			if (err)  {
				return err;
			}
			var rtErr = hasValidKeys(getJsonKeys(rec[r]), recSchKeys);
			if (rtErr) {
				return rtErr;
			}
		
		} else  {
				if (value === undefined) {
					value=new String();
				}
				if (recSch[s].childs === undefined) {
					recSch[s].childs=new Array();
				}
				if (recSch[s].htmlType === undefined) {
					recSch[s].htmlType= new String();
				}
				if (recSch[s].dataType === undefined) {
					recSch[s].dataType = new String();
				}
				if (recSch[s].groupId === undefined) {
					recSch[s].groupId = new String();
				}
				if(recSch[s].mndf == "Y") {
					if (value == "") {
						return new Error(recSch[s].name + " is mandatory: [" + value +"]")
					}
				}
				switch (recSch[s].dataType) {
					case "DATE" : 
						re = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
						if((value != '') && (!value.match(re))) {
							return new Error(recSch[s].name + " has invalid " + recSch[s].dataType + " format: [" + value + "]");
						}
						break;
					case "TIME" :
						re = /^\d{1,2}:\d{2}([ap]m)?$/;
						if(value != '' && !value.match(re)) {
							return new Error(recSch[s].name + " has invalid " + recSch[s].dataType + " format: [" + value + "]");
						}
						break;
					case "NUMBER" :
						if (recSch[s].max != "unlimited") {
							re = RegExp("^[0-9.]{"+ recSch[s].min + "," + recSch[s].max + "}$");
							if(value != '' && !re.test(value)) {
								return new Error(recSch[s].name + " has invalid " + recSch[s].dataType + " format: [" + value + "]");
							}
						} else {
							re =/^[A-Za-z0-9_]$/;
							if(value != '' && !value.match(re)) {
								return new Error(recSch[s].name + " has invalid " + recSch[s].dataType + " format: [" + value + "]");
							}
						}
						break;
					case "VARCHAR" :
						if (recSch[s].max != "unlimited") {
							re = RegExp("^[A-Za-z0-9_\\s]{"+ recSch[s].min + "," + recSch[s].max + "}$");
							if(value != '' && !value.match(re)) {
								return new Error(recSch[s].name + " has invalid " + recSch[s].dataType + " format: [" + value + "]");
							}
						} else {
							re =/^[A-Za-z0-9_\s]+$/;
							if(typeof value == "object") {
								try {
									JSON.stringify(value);		
								} catch(e) {
									return new Error(recSch[s].name + " has invalid " + recSch[s].dataType + " format: [" + value + "]");
								}
							} else {
								if((value != "") && (!value.match(re))) {
									return new Error(recSch[s].name + " has invalid " + recSch[s].dataType + " format: [" + value + "]");
								}
							}
						} 
						break;
					case "LIST" :
					case "OPTION" :
						recSch[s].listVal
						if (value != '') {
							var inpStrArr= recSch[s].listVal.split('|');
							var chk=0;
							var values = new Array();
							inpStrArr.forEach(function(obj, index) { if (index%2 == 1) { values.push(obj)} });
							if (!values.some(function(elem) {  return elem == value; }))	 {
								return new Error(recSch[s].name + " has invalid " + recSch[s].dataType + " value : [" + value + "] expected: " + JSON.stringify(values));
							}
						}
					}
				}
			}
		}
		return null;
}

exports.valWithSch=valWithSch;
exports.validateUssField=validateUssField;
