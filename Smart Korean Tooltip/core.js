var tempWord = "";
var isTTSBeingUsed = 0;
var dicFlag = true;

$(function () {
    //Get the HTML in a div #hoverText and detect mouse move on it
    var $hoverText = $("*");
    $hoverText.mousemove(function (e) {

        var word = getWordUnderCursor(e);
        if(dicFlag){
        //Show the word in a div so we can test the result
            if (word !== "" && word != undefined && tempWord !== word){
                console.log(word);
                tempWord = word;
                var korCheck = /[가-힣]/;
                var enCheck = /[a-zA-Z]/;
                if(korCheck.test(word)){
                    console.log("Korean detected");
                    word = word.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/gi,"");
                    var dicResult = word;
                    showTooltip(e, "kor", "eng", dicResult);
                }

                if(enCheck.test(word)){
                    console.log("English detected");
                    word = word.replace(/[^a-zA-Z]+/g, '');
                    var dicResult = word;
                    showTooltip(e, "eng", "kor", dicResult);
                }
            }
        }
    });

    $hoverText.dblclick(function(e){
        var word = getWordUnderCursor(e);
        $("#ToolTipDic").remove();
        if(dicFlag){
            dicFlag = false;
        }else{
            dicFlag = true;
        }
        if(word !== "" && word != undefined){
            try{
                console.log("tts: " + word);
                var msg = new SpeechSynthesisUtterance();
                msg.text = word;

                // Set the attributes.
              	msg.volume = parseFloat(volumeInput.value);
              	msg.rate = parseFloat(rateInput.value);
              	msg.pitch = parseFloat(pitchInput.value);

                // If a voice has been selected, find the voice and set the
                // utterance instance's voice attribute.
              	if (voiceSelect.value) {
              		msg.voice = window.speechSynthesis.getVoices().filter(function(voice) { return voice.name == voiceSelect.value; })[0];
              	}

                // window.speechSynthesis.pause();
                // window.speechSynthesis.cancel();
                window.speechSynthesis.speak(msg);
            }catch(e){

            }
        }
    });
});

// This code make it works with IE
// REF: https://stackoverflow.com/questions/3127369/how-to-get-selected-textnode-in-contenteditable-div-in-ie
function getTextRangeBoundaryPosition(textRange, isStart) {
  var workingRange = textRange.duplicate();
  workingRange.collapse(isStart);
  var containerElement = workingRange.parentElement();
  var workingNode = document.createElement("span");
  var comparison, workingComparisonType = isStart ?
    "StartToStart" : "StartToEnd";

  var boundaryPosition, boundaryNode;

  // Move the working range through the container's children, starting at
  // the end and working backwards, until the working range reaches or goes
  // past the boundary we're interested in
  do {
    containerElement.insertBefore(workingNode, workingNode.previousSibling);
    workingRange.moveToElementText(workingNode);
  } while ( (comparison = workingRange.compareEndPoints(
    workingComparisonType, textRange)) > 0 && workingNode.previousSibling);

  // We've now reached or gone past the boundary of the text range we're
  // interested in so have identified the node we want
  boundaryNode = workingNode.nextSibling;
  if (comparison == -1 && boundaryNode) {
    // This must be a data node (text, comment, cdata) since we've overshot.
    // The working range is collapsed at the start of the node containing
    // the text range's boundary, so we move the end of the working range
    // to the boundary point and measure the length of its text to get
    // the boundary's offset within the node
    workingRange.setEndPoint(isStart ? "EndToStart" : "EndToEnd", textRange);

    boundaryPosition = {
      node: boundaryNode,
      offset: workingRange.text.length
    };
  } else {
    // We've hit the boundary exactly, so this must be an element
    boundaryPosition = {
      node: containerElement,
      offset: getChildIndex(workingNode)
    };
  }

  // Clean up
  workingNode.parentNode.removeChild(workingNode);

  return boundaryPosition;
}

function getWordUnderCursor(event) {
    var range, textNode, offset;

    if (document.body.createTextRange) {           // Internet Explorer
        try {
            range = document.body.createTextRange();
            range.moveToPoint(event.clientX, event.clientY);
            range.select();
            range = getTextRangeBoundaryPosition(range, true);

            textNode = range.node;
            offset = range.offset;
        } catch(e) {
            return "";
        }
    }
    else if (document.caretPositionFromPoint) {    // Firefox
        range = document.caretPositionFromPoint(event.clientX, event.clientY);
        textNode = range.offsetNode;
        offset = range.offset;
    } else if (document.caretRangeFromPoint) {     // Chrome
        range = document.caretRangeFromPoint(event.clientX, event.clientY);
        try{
            range.startContainer
            textNode = range.startContainer; // null
            offset = range.startOffset;
        }catch(e){
            // console.log(e);
        }
    }

    //data contains a full sentence
    //offset represent the cursor position in this sentence
    try{
        var data = textNode.data,
            i = offset,
            begin,
            end;
    }catch(e){
        console.log(e);
    }

    try{
        //Find the begin of the word (space)
        while (i > 0 && data[i] !== " ") { --i; };  // undefined
        begin = i;

        //Find the end of the word
        i = offset;
        while (i < data.length && data[i] !== " ") { ++i; }; // undefined
        end = i;
    }catch(e){
        //console.log(e);
    }

    try{
        //Return the word under the mouse cursor
        return data.substring(begin, end);
    }catch(e){
        //console.log(e);
    }
    return;
}

function showTooltip(e, from, dest, dicResult){
    dicResult = {'from':from, 'dest':dest, phrase:dicResult};
    chrome.runtime.sendMessage(dicResult, function(response) {
        var resultStr = dicResult.phrase;
        try{
            resultStr += ": "+ response.data;
        }catch(e){
            console.log(e);
        }
        $("#ToolTipDic").remove();
        $("body").append("<div id='ToolTipDic' style='display: inline !important; visibility: visible !important; position: absolute !important; height: auto !important; width: auto !important; z-index: "+1410065406+"!important; vertical-align: middle; padding: 10px; margin: 10px !important; font-size: 9pt !important; line-height: normal !important; font-family: &quot;맑은 고딕&quot;; font-weight: bold; color: rgb(0, 0, 0); border: 2px solid rgb(50, 50, 50); background: -webkit-gradient(linear, 0% 0%, 0% 100%, from(rgb(255, 255, 50)), to(rgb(200, 200, 0))); overflow: hidden; white-space: nowrap; border-radius: 0.2em; box-shadow: rgba(0, 0, 0, 0.4) 2px 2px 5px; left: "+(e.pageX-dicResult.phrase.length)+"px !important; top: "+(e.pageY+10)+"px !important;' class='tooltip_dic'>"+resultStr+"</div>");
    });
}
