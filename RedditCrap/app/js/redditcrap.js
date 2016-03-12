// Register an event listener to check for crap when the stored sites change
chrome.storage.onChanged.addListener(function(changes, area) {
    checkCrap();
})

// We have to load our configuration file first
var config;
var xhr = new XMLHttpRequest();
xhr.onload = function() { config = JSON.parse(xhr.response); }
xhr.open("GET", chrome.extension.getURL('/app/conf/config.json'), true);
xhr.send();

// Finds all the appropriate domains in the DOM, checks whether they're blacklisted and acts accordingly
function checkCrap() {
    var domains = document.getElementsByClassName('domain');
    chrome.storage.sync.get(['crappySites', 'crappyAction'], function(data) {
        for (var i = 0; i < domains.length; i++) {
            // urls are in the form of '(url)'
            // (surrounded by brackets)
            var url = domains[i].textContent.substring(1, domains[i].textContent.length - 1);

            var parentNode = getParentByClass(domains[i], 'title');
            var entryNode = getThingNode(parentNode);
            if (parentNode.style.backgroundColor === 'red' ||
                entryNode.style.display === 'none') {

                parentNode.style.backgroundColor = '';
                entryNode.style.display = '';
            }

            for (var index = 0; index < data.crappySites.length; index++) {
                var shouldBeColoured = data.crappySites[index].indexOf(url) > -1;
                if (shouldBeColoured) {
                    if (data.crappyAction === config.DESIRED_ACTION_HIGHLIGHT) {
                        parentNode.style.backgroundColor = 'red';
                    }

                    if (data.crappyAction === config.DESIRED_ACTION_HIDE) {
                        entryNode.style.display = 'none';
                    }

                    break;
                }
            }
        }
    });
}

function getParentByClass(currentNode, className) {
    while (currentNode = currentNode.parentElement) {
        if (currentNode.classList.contains(className)) {
            return currentNode;
        }
    }
}

function getThingNode(parentNode) {
    while (parentNode = parentNode.parentElement) {
        if (parentNode.getAttribute('data-fullname')) {
            return parentNode;
        }
    }
}

// In this section we perform crapchecks when the page has changed
// This is important in the case of NeverEndingReddit which allows a user to scroll down to load a new page
// By introducing a short delay we prevent the page from being crapchecked for every modification (which is problematic if they come in quick succession)
var lastTimeModified;
var timeDelay = 2000; // 2 seconds

// When the subtree is modified for the first time we do an initial crapcheck.
// This allows us to look responsive while we discard all but one closely subsequent events
// After the last event we call checkCrap() again to make sure nothing has been missed due to the subsequent modification events
// Afterwards we reset the value so this can be repeated for other grouped subtree modification events
var performedFastCheck = false;

document.addEventListener('DOMSubtreeModified', function() {
    if (!performedFastCheck) {
        checkCrap();
        performedFastCheck = true;
    }

    lastTimeModified = new Date().getTime();

    setTimeout(function() {
        startTimer();
    }, timeDelay);
});

function startTimer() {
    if (lastTimeModified + timeDelay > new Date().getTime()) {
        clearTimeout();
        setTimeout(function() {
            startTimer()
        }, timeDelay);
    } else {
        checkCrap();
        performedFastCheck = false;
    }
};


// TODO: allowing users to give strikes against certain sources
// imgur.com + i.imgur.com