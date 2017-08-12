Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
}); 
let emplsFound = new Event("click");
let IDFound = new Event("dblclick");
let callsFound = new Event("blur");

let callCategory, callDuration,callDate,callNumber;
let leadID=[];
let contactID=[];
let unknownCalls=[],leadCalls=[],contactCalls=[];
let leadCount=0,contactCount=0,nullCount=0,rowNumber=1,callTime="";
let row="";


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
                        elemForDispatch.dispatchEvent(emplsFound);
                     }
                 }             
            }              
         }  
     });
     
    $('#elemForDispatch').one('click',function(){                        
            l = employes.length;
            for (k=0;k<l;k++){
                $('#filterUsersList').append(`<option value = "${employes[k]}">${employes[k]}</option>`);        
            }
            
    });
    
    $('#filterButton').click(function(){  
        
        /*Очистка старого отчёта*/
        leadID=[],contactID=[],unknownCalls=[],leadCalls=[],contactCalls=[],leadCount=0,contactCount=0,nullCount=0,rowNumber=1,callTime="";
        
        
               /*Ввод пользовательских данных*/
        
                let filteredUser;                
                var filterBeginTime= new Date($('#filterBeginTime').val());
                var filterEndTime= new Date($('#filterEndTime').val());
               /*Проверка валидности даты*/
                if (filterEndTime<filterBeginTime|| filterBeginTime== "Invalid Date"||filterEndTime== "Invalid Date"){
                   alert("Введите корректное время");
                }
               
               /*Получение фильтрованных данных из задач*/
               BX24.callMethod('user.get', {"LAST_NAME": `${$('#filterUsersList').val()}`}, function(result){
                   filteredUser=result.data()[0].ID;                   
                   elemForDispatch.dispatchEvent(IDFound); 
               });
        $('#elemForDispatch').dblclick(function(){             
            BX24.callMethod('voximplant.statistic.get',{"FILTER": 
                {">CALL_DURATION":30, "PORTAL_USER_ID":filteredUser, ">CALL_START_DATE":filterBeginTime, "<CALL_START_DATE":filterEndTime},
                "SORT": "CALL_DURATION",         "ORDER": "DESC",      },function(result){
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
                           elemForDispatch.dispatchEvent(callsFound);  
                        }
                    }                        
                }   
            );
        }); 
        $('#elemForDispatch').blur(function(){
            row=`<tr><td>${rowNumber}</td><td class="detailsForCalls">Не закреплены</td><td>${nullCount}</td></tr>`;
            $('#tableHead').after(row);
            rowNumber++;
        });
        $(document).on('click','.detailsForCalls',function(){            
            let companyName=$(this).html();  
             let rowClass="detail"+$(this).html();
            $(this).attr('class','clickedForDetails');                      
            if(companyName=="Не закреплены"){
                for (i=0;i<nullCount;i++){
                    callTime=(Math.floor(unknownCalls[i].CALL_DURATION / 60)) + ':' + (unknownCalls[i].CALL_DURATION % 60);
                    if (unknownCalls[i].CALL_CATEGORY=='external'){
                        row=`<tr class="${rowClass}"><td>${rowNumber}</td><td>Не закреплены</td><td>1</td><td>Неизвестный</td><td>${unknownCalls[i].CALL_START_DATE}</td><td>${callTime}</td><td>Входящий</td></tr>`;
                    } else{
                        row=`<tr class="${rowClass}"><td>${rowNumber}</td><td>Не закреплены</td><td>1</td><td>Неизвестный</td><td>${unknownCalls[i].CALL_START_DATE}</td><td>${callTime}</td><td>Исходящий</td></tr>`;
                    }                    
                    if (i==0){
                        $(this).parent().after(row);
                        rowNumber++;
                    } else {
                        $(rowClass).last().after(row);
                        rowNumber++;                       
                    }                    
                }                
            } 
        }); 
        $(document).on('click','.clickedForDetails',function(){           
            let rowClass="detail"+$(this).html();
            $(rowClass).html('');
            $(this).removeAttr('class');
        });
        
    });
    
}); 