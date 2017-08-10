$(document).ready(function(){
    let l,k,i,count=0;
    let employes=[];      
    var local = new Date();    
    $('#filterEndTime').append(`<input id="endDate" value="${local.toDateInputValue()}T00:00" type="datetime-local">`);
    
    
   
    
   
     BX24.callMethod('user.get', {}, function(result){
         for (i =0;i<50;i++){            
                if (result.answer.result[i].LAST_NAME!=""&&result.answer.result[i].LAST_NAME!=null&&result.answer.result[i].ACTIVE==true){
                    employes.push(result.data()[i].LAST_NAME);
                    employes.sort();                
                }
         } 
         if (result.more()){               
             result.next();
         } else {
             for (i =0;i<50;i++){            
             if (result.answer.result[i].LAST_NAME!=""&&result.answer.result[i].LAST_NAME!=null&&result.answer.result[i].ACTIVE==true){
                    employes.push(result.data()[i].LAST_NAME);
                    employes.sort();
                
                }
            } 
             
         }
                
         
     });
     
        $('#filterUsersList').one('click',function(){
                        
            l = employes.length;
            for (k=0;k<l;k++){
                $('#filterUsersList').append(`<option value = "${employes[k]}">${employes[k]}</option>`);        
            }
            
        }); 
     
       
     
     
}); /*

Вызов статистики звонка

   BX24.callMethod(      'voximplant.statistic.get',      {         "FILTER": {">CALL_DURATION":60, "PORTAL_USER_ID":43, ">CALL_START_DATE":"2017-08-08T00:00:00+03:00", "<CALL_START_DATE":"2017-08-09T00:00:00+03:00"},         "SORT": "CALL_DURATION",         "ORDER": "DESC",      },      function(result)      {                if(result.error())                    console.error(result.error());                else                    console.info(result.data());      }   );



CALL_CATEGORY
"external"
CALL_DURATION
"1517"
CALL_FAILED_CODE
"200"
CALL_FAILED_REASON
"Success call"
CALL_ID
"d402e7b90c819483.1502183165.526718"
CALL_START_DATE
"2017-08-08T12:06:07+03:00"
CALL_TYPE
"1"
CALL_VOTE
null
COST
"0.0000"
COST_CURRENCY
"RUR"
CRM_ACTIVITY_ID
"260808"
CRM_ENTITY_ID
"15390"
CRM_ENTITY_TYPE
"CONTACT"
ID
"96268"
PHONE_NUMBER
"79135291249"
PORTAL_NUMBER
"reg37405"
PORTAL_USER_ID
"43"
REDIAL_ATTEMPT
null
REST_APP_ID
null
REST_APP_NAME
null
SESSION_ID
"337318295"
TRANSCRIPT_ID
null
TRANSCRIPT_PENDING
"Y"
204880


CODE
null
CREATED_BY
"43"
CREATE_TIME
"2017-08-08T12:31:37+03:00"
DELETED_BY
"0"
DELETED_TYPE
"0"
DELETE_TIME
null
DETAIL_URL
"https://m2m-sib.bitrix24.ru/docs/file/Телефония - записи звонков/2017-08/2017-08-08_12-06-07__79135291249.mp3"
DOWNLOAD_URL
"https://m2m-sib.bitrix24.ru/rest/download.json?auth=p9tezvzvnzz6grgd8wbhd2lsourh7a9s&token=disk%7CaWQ9MjA0ODgwJl89c1BubnZCU0tPVWZLZ3dKSFFBZmQzTVBuRkpuenJQMXQ%3D%7CImRvd25sb2FkfGRpc2t8YVdROU1qQTBPRGd3Smw4OWMxQnViblpDVTB0UFZXWkxaM2RLU0ZGQlptUXpUVkJ1UmtwdWVuSlFNWFE9fHA5dGV6dnp2bnp6NmdyZ2Q4d2JoZDJsc291cmg3YTlzIg%3D%3D.5kauSR0SvkRvbT6g%2FidZs1yuVjLiVLXQWHIfAW%2BEHs4%3D"
FILE_ID
"396544"
GLOBAL_CONTENT_VERSION
"1"
ID
"204880"
NAME
"2017-08-08_12-06-07__79135291249.mp3"
PARENT_ID
"202078"
SIZE
"6069600"
STORAGE_ID
"69"
TYPE
"file"
UPDATED_BY
"43"
UPDATE_TIME
"2017-08-08T12:31:37+03:00"
*/

