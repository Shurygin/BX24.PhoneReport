Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
}); 
let clickEvent = new Event("click");
let blurEvent = new Event("blur");
let dblclickEvent = new Event("dblclick");
let focusEvent = new Event("focus");
let changeEvent = new Event("change");
let unknownCalls=[],contactCalls=[],contactList=[],companyList=[],companyCalls=[];
let nullCount=0,rowNumber=1,subRowNumber=1,companyNumber=0,filteredUser=0;
let row="",callTime="";
let filterBeginTime,filterEndTime,filterMinTime,filterMaxTime;
$(document).ready(function(){
    let l,k,i,count=0;
    let employes=[];      
    let local = new Date();
    let past = new Date(2592000000);
    let pastTime = new Date(local-past);
    $('#filterEndTime').attr( "value", `${local.toDateInputValue()}T23:59`);
    $('#filterBeginTime').attr( "value", `${pastTime.toDateInputValue()}T00:00`); 
    BX24.callMethod('user.get', {}, function(result){
         for (i =0;i<50;i++){             
             if(result.answer.result[i]!=undefined){
                 if (result.answer.result[i].LAST_NAME!=""&&result.answer.result[i].LAST_NAME!=null&&result.answer.result[i].ACTIVE==true){
                    employes.push(result.data()[i].LAST_NAME);                                   
                }
             }                
         } 
         if (result.more()){               
             result.next();
         } else {
             for (i =0;i<50;i++){                 
                 if(result.answer.result[i]!=undefined){
                     if (result.answer.result[i].LAST_NAME!=""&&result.answer.result[i].LAST_NAME!=null&&result.answer.result[i].ACTIVE==true&&result.answer.result[i]!=undefined){
                        employes.push(result.data()[i].LAST_NAME);
                        employes.sort();
                        elemForDispatch.dispatchEvent(clickEvent);
                     }
                 }             
            }              
         }  
     });
    /*генерация списка сотрудников one стоит, чтобы не выполнялась лишний раз*/
    $('#elemForDispatch').one('click',function(){                        
        l = employes.length;
        for (k=0;k<l;k++){
            $('#filterUsersList').append(`<option value = "${employes[k]}">${employes[k]}</option>`);        
        } 
    });
    /*действия при клике, обнуление данных, перестроение таблицы, получение данных для фильтра, получение ИД пользователя*/
    $('#filterButton').click(function(){
        nullCount=0,rowNumber=1,companyNumber=0,filteredUser=0;
        unknownCalls=[],contactCalls=[];
        $('.mainTableHeader').next().html('<table id="mainTable"  width="100%" class="mainTable table table-bordered table-hover filterTable"><tr id="tableHead" class="tableHead labelRow success"><td class="tableNumber">№</td><td id="tableTaskName">Компания</td><td id="tableDeadline">Количество звонков</td><td id="tableDeadline">Контакт</td><td id="tableClosedDate">Дата начала разговора</td><td id="tableClosedDate">Продолжительность звонка</td><td id="tableClosedDate">Тип звонка</td></tr> </table>'); 
       filterBeginTime= new Date($('#filterBeginTime').val());
       filterEndTime= new Date($('#filterEndTime').val());
       filterMinTime=$('#filterMinTime').val();
       filterMaxTime=$('#filterMaxTime').val();
    /*Проверка валидности даты*/
       if (filterEndTime<filterBeginTime|| filterBeginTime== "Invalid Date"||filterEndTime== "Invalid Date"){
            alert("Введите корректное время");
        } 
    /*Получение ИД выбранного пользователя*/
        BX24.callMethod('user.get', {"LAST_NAME": `${$('#filterUsersList').val()}`}, function(result){
            filteredUser=result.data()[0].ID;            
            elemForDispatch.dispatchEvent(blurEvent);
        });
    }); 
    /*поиск звонков по фильтру и разбитие их в массивы, поиск лидов, контактов и компаний*/
    $('#elemForDispatch').blur(function(){
        BX24.callMethod('voximplant.statistic.get',
            {
            "FILTER": {">CALL_DURATION":filterMinTime,"<CALL_DURATION":filterMaxTime,"PORTAL_USER_ID":filteredUser,">CALL_START_DATE":filterBeginTime,"<CALL_START_DATE":filterEndTime
                    }
            },function(result){
            if(result.error()) {
                console.error(result.error());
            }else {                        
                for (i=0;i<50;i++){
                    if(result.data()[i]!=undefined){                                
                        if (result.data()[i].CRM_ENTITY_TYPE=="CONTACT"){
                            
                            contactCalls.push(result.data()[i]);
                        } else{
                            nullCount++;
                            unknownCalls.push(result.data()[i]);                                    
                        }  
                    }                                                    
                }                        
                if (result.more()){               
                    result.next();
                } else {                     
                    if (contactList.length>0&&companyList.length>0){
                         elemForDispatch.dispatchEvent(focusEvent);
                    } else {
                        elemForDispatch.dispatchEvent(dblclickEvent);
                    }
                    row=`<tr class="${companyNumber}"><td>${rowNumber}</td><td class="detailsForCalls">Не закреплены</td><td>${nullCount}</td></tr>`;                
                    $('#mainTable').children().children().last().after(row);
                    rowNumber++;
                    companyNumber++; 
                }
            }                        
        });
            
    }); 
    /*Поиск компаний и контактов*/
    $('#elemForDispatch').one('change',function(){
       BX24.callMethod("crm.contact.list",{select: [ "ID",  "LAST_NAME","COMPANY_ID","PHONE" ]},function(result){
            if(result.error()){
               console.error(result.error()); 
            }else{
                result.data().forEach(function(contact,i){
                    contactList.push(contact);
                });	
                if(result.more()&&contactList.length%2000==0){
                    setTimeout(function(){
                        console.log("Contacts: "+contactList.length);
                        result.next(); 
                    },1000);
                } else if(result.more()){
                    result.next();
                } else{
                    console.log("contacts found"); 
                    elemForDispatch.dispatchEvent(focusEvent);
                }																
            }
        });
    }); 
    $('#elemForDispatch').one('dblclick',function(){  
           BX24.callMethod("crm.company.list", { select: [ "ID", "TITLE" ]	},function(result){
				if(result.error()){
                    console.error(result.error());
                }else {                    
					result.data().forEach(function(company,i){
                        companyList.push(company);
                    });			
					if(result.more()&&companyList.length%100==0){
                        setTimeout(function(){
                            console.log("Companyes: "+companyList.length);
                            result.next(); 
                        },500);
                    } else if(result.more()) {
                        result.next();
                    } else{
                         console.log("companyes found");
                        elemForDispatch.dispatchEvent(changeEvent); 
                    }
				}
			}
		);
    });
    $('#elemForDispatch').focus(function(){  
        if (contactCalls.length>0){
            console.log(contactCalls.length);
            contactCalls.forEach(function(call,i){
                contactList.forEach(function(contact,j){
                    if(call.CRM_ENTITY_ID==contact.ID){
                        if (contact.COMPANY_ID!=null){
                            companyList.forEach(function(company,h){
                                if (company.ID==contact.COMPANY_ID){
                                    callTime=(Math.floor(call.CALL_DURATION / 60)) + ':' + (call.CALL_DURATION % 60);
                                    if (call.CALL_TYPE==1){
                                        row=`<tr><td>${rowNumber}</td><td>${company.TITLE}</td><td>1</td><td>${contact.LAST_NAME}</td><td>${call.CALL_START_DATE}</td><td>${callTime}</td><td>Исходящий</td></tr>`;
                                    } else{
                                        row=`<tr><td>${rowNumber}</td><td>${company.TITLE}</td><td>1</td><td>${contact.LAST_NAME}</td><td>${call.CALL_START_DATE}</td><td>${callTime}</td><td>Входящий</td></tr>`;
                                    } 
                                    $('#mainTable').children().children().last().after(row);
                                    rowNumber++;
                                }
                            });
                        } else {
                            callTime=(Math.floor(call.CALL_DURATION / 60)) + ':' + (call.CALL_DURATION % 60);
                            if (call.CALL_TYPE==1){
                                row=`<tr><td>${rowNumber}</td><td>Не закреплены</td><td>1</td><td>${contact.LAST_NAME}</td><td>${call.CALL_START_DATE}</td><td>${callTime}</td><td>Исходящий</td></tr>`;
                            } else{
                                row=`<tr><td>${rowNumber}</td><td>Не закреплены</td><td>1</td><td>${contact.LAST_NAME}</td><td>${call.CALL_START_DATE}</td><td>${callTime}</td><td>Входящий</td></tr>`;
                            } 
                            $('#mainTable').children().children().last().after(row);
                            rowNumber++;
                        }
                    }
                });
            });
        }
    });
    $(document).on('click','.detailsForCalls',function(){
        companyNumber=$(this).parent().attr('class');            
        for (i=0;i<nullCount;i++){
            callTime=(Math.floor(unknownCalls[i].CALL_DURATION / 60)) + ':' + (unknownCalls[i].CALL_DURATION % 60);                        
            if (unknownCalls[i].CALL_TYPE==1){
                row=`<tr class="detailRow${companyNumber}"><td>${subRowNumber}</td><td>Не закреплены</td><td>1</td><td>${unknownCalls[i].PHONE_NUMBER}</td><td>${unknownCalls[i].CALL_START_DATE}</td><td>${callTime}</td><td>Исходящий</td></tr>`;
            } else{
                row=`<tr class="detailRow${companyNumber}"><td>${subRowNumber}</td><td>Не закреплены</td><td>1</td><td>${unknownCalls[i].PHONE_NUMBER}</td><td>${unknownCalls[i].CALL_START_DATE}</td><td>${callTime}</td><td>Входящий</td></tr>`;
            }                    
            if (i==0){   
                $('.detailsForCalls').parent().after(row);
                subRowNumber++;
            } else if (i==(nullCount-1)){
                $(`.detailRow${companyNumber}`).last().after(row);                            
                subRowNumber++;                            
            }  else {
                $(`.detailRow${companyNumber}`).last().after(row);
                subRowNumber++;                       
            }                    
        }
        $(this).attr('class','clickedForDetails');
    }); 
    $(document).on('click','.clickedForDetails',function(){
        companyNumber=$(this).parent().attr('class');            
        $(`.detailRow${companyNumber}`).hide();
        subRowNumber=1;
        $(this).attr('class','detailsForCalls');
    });
}); 