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
    chrome.storage.sync.get(['crappySites', 'crappyAction'], function(data) {
        var domains = Array.prototype.slice.call(document.getElementsByClassName('domain'));

        domains.map(function(domain) {
            var parentNode = getParentByClass(domain, 'title');
            return {
                url: getUrl(domain),
                parent: parentNode,
                entry: getThingNode(parentNode)
            }
        }).forEach(domainData => {
            if (domainData.parent.style.backgroundColor === 'red' ||
                domainData.entry.style.display === 'none') {

                domainData.parent.style.backgroundColor = '';
                domainData.entry.style.display = '';
            }

            if (data.crappySites.indexOf(domainData.url) > -1) {
                if (data.crappyAction === config.DESIRED_ACTION_HIGHLIGHT) {
                    domainData.parent.style.backgroundColor = 'red';
                }

                if (data.crappyAction === config.DESIRED_ACTION_HIDE) {
                    domainData.entry.style.display = 'none';
                }
            }
        });
    });
}

// urls are in the form of '(url)'
// (surrounded by brackets)
function getUrl(urlNode) {
    return urlNode.textContent.substring(1, urlNode.textContent.length - 1)
}

function getParentByClass(currentNode, className) {
    return currentNode.classList.contains(className) ? currentNode : getParentByClass(currentNode.parentElement, className);
}

function getThingNode(parentNode) {
    return parentNode.getAttribute('data-fullname') ? parentNode : getThingNode(parentNode.parentElement);
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