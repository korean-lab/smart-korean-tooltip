chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
    console.log("background.js: "+JSON.stringify(request));
    if(request){
        var url = "";
        var key = "";

        switch(request.from){
            case "eng":
            // http://sug.dic.daum.net/dic_all_ctsuggest?mod=json&code=utf_in_out&enc=utf&cate=lan&callback=callback&q=${query}
            url = "http://tooltip.dic.naver.com/tooltip.nhn?"
            +"wordString="+request.phrase
            +"&languageCode=4"
            +"&nlp=false";

            xhrGet(url, function(xhr){
                console.log(xhr.responseText);
                var obj = JSON.parse(xhr.responseText);

                var result = request.phrase+": ";

                console.log(JSON.stringify(obj));

                if(obj.mean != undefined){
                    for(var i = 0 ; i < obj.mean.length ; i++){
                        result+=obj.mean[i];
                        if(i != (obj.mean.length-1)){
                            result+=", ";
                        }
                    }
                }

                console.log(result);
                sendResponse({data: result});
            });
            break;
            case "glosbe":
            var url = "https://glosbe.com/gapi/translate?"
            +"from="+request.from
            +"&dest="+request.dest
            +"&format=json"
            +"&phrase="+request.phrase
            +"&pretty=true";

            xhrGet(url, function(xhr){
                console.log(xhr.responseText);
                var obj = JSON.parse(xhr.responseText);

                var result = "";

                console.log(JSON.stringify(obj));

                if(obj.tuc != undefined){
                    for(var i = 0 ; i < obj.tuc.length ; i++){
                        result+=obj.tuc[i].phrase.text;
                        if(i != (obj.tuc.length-1)){
                            result+=", ";
                        }
                    }
                }

                console.log(result);
                sendResponse({data: result});
            });
            default:
            key = "C8AEEE6E0C8C09DB1A7B4C446D69AB1E";
            url = "https://krdict.korean.go.kr/api/search?"
            +"key="+key
            +"&q="+request.phrase
            +"&translated=y"
            +"&trans_lang="+request.dest
            +"&sort=dict";

            console.log(url);
            xhrGet(url, function(xhr){
                console.log(xhr.responseText);
                var obj = $(xhr.responseText).find("item");
                var listLength = obj.length;
                var result = "";
                if(listLength){
                    $(obj).each(function(){
                        var senseResult = "";

                        $(this).find("sense").each(function(){
                            senseResult += ("<span class='sense-order'>"+$(this).find("sense_order").text()+". </span> "
                            +"<span class='trans-word'>"+$(this).find("trans_word").text()+"</span>"
                            +"<div class='trans-dfn' style='font-family: Georgia;'>"+$(this).find("trans_dfn").text()+"</div>");
                        });
                        result += "<div class='word-pos'><span class='word' style='color:blue;font-weight: bold;font-size: 20px;'>"+$(this).find("word").text()
                        +"</span><span class='pos' style='font-size: 15px;'>("+$(this).find("pos").text()+")</span></div>"
                        +senseResult;
                    });
                }

                console.log(result);
                sendResponse({data: result});
            });
            break;
        }
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
