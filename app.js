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

let unknownCalls=[],leadCalls=[],contactCalls=[],leadList=[],contactList=[],companyList=[],companyCalls=[];
        let leadCount=0,contactCount=0,nullCount=0,rowNumber=1,currentLead=0,companyNumber=0,filteredUser=0,searchProc=0;
        let row="",currentContact="",callTime="";
let currentCall;
let filterBeginTime,filterEndTime,filterMinTime,filterMaxTime,filterOptions;
let contactsFound=false,companyesFound=false;
       

$(document).ready(function(){
    let l,k,i,count=0;
    let employes=[];      
    let local = new Date();
    let past = new Date(2592000000);
    let pastTime = new Date(local-past);
    $('#filterEndTime').attr( "value", `${local.toDateInputValue()}T00:00`);
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
        leadCount=0,contactCount=0,nullCount=0,rowNumber=1,currentLead=0,companyNumber=0,filteredUser=0,searchProc=0;
        unknownCalls=[],leadCalls=[],contactCalls=[];
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
                        if(result.data()[i].CRM_ENTITY_TYPE=="LEAD"){
                            leadCount++;    
                            leadCalls.push(result.data()[i]);
                        } else if (result.data()[i].CRM_ENTITY_TYPE=="CONTACT"){
                            contactCount++;
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
                    
        BX24.callMethod("crm.lead.list", 
			{ 
                filter: { "CREATED_BY_ID": filteredUser, ">DATE_CREATE": filterBeginTime, "<DATE_CREATE": filterEndTime },
				select: [ "ID",  "CONTACT_ID", "COMPANY_TITLE","DATE_CREATE" ]
			}, 
			function(result) 
			{
				if(result.error()){
                    console.error(result.error());
                } else {
					result.data().forEach(function(lead,i){
                        leadList.push(lead);
                    });		
					if(result.more()){
                        result.next();
                    } else{
                        elemForDispatch.dispatchEvent(changeEvent);
                        console.log(leadList);
                    }												
				}
			}
        );  
                    
                }
            }                        
        });
            
    }); 
    /*Поиск компаний и контактов*/
    $('#elemForDispatch').change(function(){
       BX24.callMethod("crm.contact.list",{select: [ "ID",  "LAST_NAME","COMPANY_ID","PHONE" ]},function(result){
            if(result.error()){
               console.error(result.error()); 
            }else{
                result.data().forEach(function(contact,i){
                    contactList.push(contact);
                });	
                if(result.more()&&contactList.length%2000==0){
                    setTimeout(function(){
                        result.next(); 
                    },1000);
                } else if(result.more()){
                    result.next();
                } else{
                    console.log("contacts found");
                    setTimeout(function(){
                        BX24.callMethod("crm.company.list", { select: [ "ID", "TITLE" ]	},function(result){
				if(result.error()){
                    console.error(result.error());
                }else {
					result.data().forEach(function(company,i){
                        companyList.push(company);
                    });			
					if(result.more()&&companyList.length%2000==0){
                        setTimeout(function(){
                           result.next(); 
                        },1000);
                    } else if(result.more()) {
                        result.next();
                    } else{
                         console.log("companyes found");
                        elemForDispatch.dispatchEvent(dblclickEvent);
                    }
				}
			}
		);
                        
                    },5000);
        
                }																
            }
        });
    });
    
    
    
        $('#elemForDispatch').dblclick(function(){  
           if (leadCount>0){
               leadCalls.forEach(function(lead, i){
                   if (lead.CONTACT_ID==null&&lead.COMPANY_ID==null){
                        nullCount++;
                        unknownCalls.push(lead);
                   } else if(lead.CONTACT_ID==null){
                       companyCalls.push(lead);
                   } else {
                       contactCalls.push(lead);
                   }
                   if (i==(leadCalls.length-1)){
                       
                   }
               });
            }
             
        });
        $('#elemForDispatch').focus(function(){  
             if (leadCount!=0){                
                if (currentLead>=0){
                    BX24.callMethod("crm.lead.get", { id: leadCalls[currentLead].CRM_ENTITY_ID },function(result){
				        if(result.error()){
                            console.error(result.error());
                            currentLead--;
                            setTimeout(function(){
                                elemForDispatch.dispatchEvent(callsFound);
                            },200);
                        }
				        else{
                            if(result.data().CONTACT_ID==null){
                                nullCount++;
                                unknownCalls.push(leadCalls.pop());
                                currentLead--;
                                setTimeout(function(){
                                    elemForDispatch.dispatchEvent(callsFound);
                                },200);
                            } else{                          
                                BX24.callMethod("crm.contact.get",{ id: result.data().CONTACT_ID},function(result){
				                    if(result.error()){                            
                                        console.error(result.data().CONTACT_ID);
                                        currentLead--;
                                        setTimeout(function(){
                                                elemForDispatch.dispatchEvent(callsFound);
                                        },200);
                                    } else{
                                        currentContact=result.data().LAST_NAME;
                                        if (result.data().COMPANY_ID==null){
                                            
                                            callTime=(Math.floor(leadCalls[currentLead].CALL_DURATION / 60)) + ':' + (leadCalls[currentLead].CALL_DURATION % 60);
                                            if (leadCalls[currentLead].CALL_TYPE==1){
                                                row=`<tr><td>${rowNumber}</td><td>Не закреплены</td><td>1</td><td>${currentContact}</td><td>${leadCalls[currentLead].CALL_START_DATE}</td><td>${callTime}</td><td>Исходящий</td></tr>`;
                                            } else{
                                                row=`<tr><td>${rowNumber}</td><td>Не закреплены</td><td>1</td><td>${currentContact}</td><td>${leadCalls[currentLead].CALL_START_DATE}</td><td>${callTime}</td><td>Входящий</td></tr>`;
                                            } 
                                            $('#mainTable').children().children().last().after(row);
                                            rowNumber++; 
                                            currentLead--;
                                            setTimeout(function(){
                                                elemForDispatch.dispatchEvent(callsFound);
                                            },200);
                                        } else{
                                            
                                            BX24.callMethod("crm.company.get", { id: result.data().COMPANY_ID}, function(result){
				                                if(result.error()){
                                                    console.error(result.error());
                                                } else{                                               
                                                    callTime=(Math.floor(leadCalls[currentLead].CALL_DURATION / 60)) + ':' + (leadCalls[currentLead].CALL_DURATION % 60);
                                                    if (leadCalls[currentLead].CALL_TYPE==1){
                                                        row=`<tr><td>${rowNumber}</td><td>${result.data().TITLE}</td><td>1</td><td>${currentContact}</td><td>${leadCalls[currentLead].CALL_START_DATE}</td><td>${callTime}</td><td>Исходящий</td></tr>`;
                                                    } else{
                                                        row=`<tr><td>${rowNumber}</td><td>${result.data().TITLE}</td><td>1</td><td>${currentContact}</td><td>${leadCalls[currentLead].CALL_START_DATE}</td><td>${callTime}</td><td>Входящий</td></tr>`;
                                                    } 
                                                    $('#mainTable').children().children().last().after(row);
                                                    rowNumber++;
                                                }
			                                 });
                                            currentLead--;
                                            setTimeout(function(){
                                                elemForDispatch.dispatchEvent(callsFound);
                                            },200);
                                        }
                                    }
                                });
                            }
                        }
			         });
                } else if(currentLead==-1){
                    //currentLead=contactCount-1; 
                    
                    elemForDispatch.dispatchEvent(unworkedFound);                    
                }
            }
            time=performance.now()-time;                        
            if(time>20000){
                
                currentCall=contactCalls.pop();
                
                if (currentCall!=undefined){
                    BX24.callMethod("crm.contact.get",{ id: currentCall.CRM_ENTITY_ID},function(result){
				    if(result.error()){
                       // currentLead--;
                        setTimeout(function(){
                            
                            elemForDispatch.dispatchEvent(unworkedFound);
                        },200);
                    } else{
                        currentContact=result.data().LAST_NAME;
                        if (result.data().COMPANY_ID==null){
                            callTime=(Math.floor(currentCall.CALL_DURATION / 60)) + ':' + (currentCall.CALL_DURATION % 60);
                            if (currentCall.CALL_TYPE==1){
                                row=`<tr><td>${rowNumber}</td><td>Не закреплены</td><td>1</td><td>${currentContact}</td><td>${currentCall.CALL_START_DATE}</td><td>${callTime}</td><td>Исходящий</td></tr>`;
                            } else{
                                row=`<tr><td>${rowNumber}</td><td>Не закреплены</td><td>1</td><td>${currentContact}</td><td>${currentCall.CALL_START_DATE}</td><td>${callTime}</td><td>Входящий</td></tr>`;
                            } 
                            $('#mainTable').children().children().last().after(row);
                            rowNumber++; 
                            //currentLead--;
                            setTimeout(function(){
                                elemForDispatch.dispatchEvent(unworkedFound);
                            },2000);
                        } else{ 
                            setTimeout(function(){
                                BX24.callMethod("crm.company.get", { id: result.data().COMPANY_ID}, function(result){
				                    if(result.error()){
                                       callTime=(Math.floor(currentCall.CALL_DURATION / 60)) + ':' + (currentCall.CALL_DURATION % 60);
                                        if (currentCall.CALL_TYPE==1){
                                            row=`<tr><td>${rowNumber}</td><td>Не закреплены</td><td>1</td><td>${currentContact}</td><td>${currentCall.CALL_START_DATE}</td><td>${callTime}</td><td>Исходящий</td></tr>`;
                                        } else{
                                            row=`<tr><td>${rowNumber}</td><td>Не закреплены</td><td>1</td><td>${currentContact}</td><td>${currentCall.CALL_START_DATE}</td><td>${callTime}</td><td>Входящий</td></tr>`;
                                        } 
                                        $('#mainTable').children().children().last().after(row);
                                        rowNumber++; 
                                        //currentLead--;
                                        setTimeout(function(){
                                            elemForDispatch.dispatchEvent(unworkedFound);
                                        },200);
                                    } else{                                        
                                        if(currentCall!=undefined){
                                            callTime=(Math.floor(currentCall.CALL_DURATION / 60)) + ':' + (currentCall.CALL_DURATION % 60);
                                            if (currentCall.CALL_TYPE==1){
                                                row=`<tr><td>${rowNumber}</td><td>${result.data().TITLE}</td><td>1</td><td>${currentContact}</td><td>${currentCall.CALL_START_DATE}</td><td>${callTime}</td><td>Исходящий</td></tr>`;
                                            } else{
                                                row=`<tr><td>${rowNumber}</td><td>${result.data().TITLE}</td><td>1</td><td>${currentContact}</td><td>${currentCall.CALL_START_DATE}</td><td>${callTime}</td><td>Входящий</td></tr>`;
                                            } 
                                            $('#mainTable').children().children().last().after(row);
                                            rowNumber++;
                                        }
                                    }
			                     });
                               // currentLead--;
                                setTimeout(function(){
                                    elemForDispatch.dispatchEvent(unworkedFound);
                                },1000);
                            },200)
                        }
                    }
                });
                } else if(nullCount!=0&&timeB!=5){ 
                    timeB=5;
                    row=`<tr class="${companyNumber}"><td>${rowNumber}</td><td class="detailsForCalls">Не закреплены</td><td>${nullCount}</td></tr>`;                
                    $('#mainTable').children().children().last().after(row);
                    rowNumber++;
                    companyNumber++;                        
                }
            }  else if(contactCalls.length!=0){
                setTimeout(function(){                    
                    elemForDispatch.dispatchEvent(unworkedFound);
                },1000);
            }
        });
            
            
           
        
        $(document).on('click','.detailsForCalls',function(){
            companyNumber=$(this).parent().attr('class');            
            for (i=0;i<nullCount;i++){
                        callTime=(Math.floor(unknownCalls[i].CALL_DURATION / 60)) + ':' + (unknownCalls[i].CALL_DURATION % 60);                        
                        if (unknownCalls[i].CALL_TYPE==1){
                            row=`<tr class="detailRow${companyNumber}"><td>${rowNumber}</td><td>Не закреплены</td><td>1</td><td>${unknownCalls[i].PHONE_NUMBER}</td><td>${unknownCalls[i].CALL_START_DATE}</td><td>${callTime}</td><td>Исходящий</td></tr>`;
                        } else{
                            row=`<tr class="detailRow${companyNumber}"><td>${rowNumber}</td><td>Не закреплены</td><td>1</td><td>${unknownCalls[i].PHONE_NUMBER}</td><td>${unknownCalls[i].CALL_START_DATE}</td><td>${callTime}</td><td>Входящий</td></tr>`;
                        }                    
                        if (i==0){   
                            $('.detailsForCalls').parent().after(row);
                            rowNumber++;
                        } else if (i==(nullCount-1)){
                            $(`.detailRow${companyNumber}`).last().after(row);                            
                            rowNumber++;                            
                        }  else {
                            $(`.detailRow${companyNumber}`).last().after(row);
                            rowNumber++;                       
                        }                    
                    }
            $(this).attr('class','clickedForDetails');
        }); 
        $(document).on('click','.clickedForDetails',function(){
            companyNumber=$(this).parent().attr('class');            
            $(`.detailRow${companyNumber}`).hide();
            $(this).attr('class','detailsForCalls');
        });
        
    
    
}); 


