chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
    console.log("background.js: "+JSON.stringify(request));
    if(request){
        var url = ""

        switch(request.from){
        case "eng":
            url = "http://tooltip.dic.naver.com/tooltip.nhn?"
            +"wordString="+request.phrase
            +"&languageCode=4"
            +"&nlp=false";
            break;
        case "kor":
            url = "";
            break;
        }

        // var url = "https://glosbe.com/gapi/translate?"
        // +"from="+request.from
        // +"&dest="+request.dest
        // +"&format=json"
        // +"&phrase="+request.phrase
        // +"&pretty=true";

        xhrGet(url, function(xhr){
            console.log(xhr.responseText);
            var obj = JSON.parse(xhr.responseText);

            var result = "";

            console.log(JSON.stringify(obj));

            if(obj.mean != undefined){
                for(var i = 0 ; i < obj.mean.length ; i++){
                    result+=obj.mean[i];
                    if(i != (obj.mean.length-1)){
                        result+=", ";
                    }
                }
            }

            // if(obj.tuc != undefined){
            //     for(var i = 0 ; i < obj.tuc.length ; i++){
            //         result+=obj.tuc[i].phrase.text;
            //         if(i != (obj.tuc.length-1)){
            //             result+=", ";
            //         }
            //     }
            // }

            console.log(result);
            sendResponse({data: result});
        });
    } else{
        console.log({data: "no result"});
        sendResponse({
            // response is not needed.
        });
    }
    return true;
});

function xhrGet(url, callback){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange=function(){
        if(this.readyState==4){
            callback(this)
        }
    };
    xhr.send()
    return true;
}
