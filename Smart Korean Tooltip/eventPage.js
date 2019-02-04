var menuItem = {
    "id": "Korean TTS by Korean Lab",
    "title": "Speak",
    "contexts": ["selection"]
};

chrome.contextMenus.create(menuItem, () => chrome.runtime.lastError);

chrome.contextMenus.onClicked.addListener(function(clickData){
    if (clickData.menuItemId == "Korean TTS" && clickData.selectionText){
       chrome.tts.speak(clickData.selectionText,
                        {
                            'lang': 'ko-KR',
                            'rate': 0.8
                        });
    }
});

chrome.contextMenus.onClicked.addListener(function(clickData){
    if (clickData.menuItemId == "Korean Dictionary" && clickData.seletionText){
    }
});
